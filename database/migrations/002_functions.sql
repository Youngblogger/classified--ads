-- Supabase Database Functions for iList Marketplace
-- Run after 001_initial_schema.sql

-- ============================
-- INCREMENT LISTING VIEWS
-- ============================
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- INCREMENT FAVORITES COUNT
-- ============================
CREATE OR REPLACE FUNCTION increment_favorites_count(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET favorites_count = (
    SELECT COUNT(*) FROM listing_favorites WHERE listing_id = increment_favorites_count.listing_id
  )
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- DECREMENT FAVORITES COUNT
-- ============================
CREATE OR REPLACE FUNCTION decrement_favorites_count(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET favorites_count = GREATEST(0, favorites_count - 1)
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- SEARCH LISTINGS (full-text + filters)
-- ============================
CREATE OR REPLACE FUNCTION search_listings(
  search_query TEXT DEFAULT '',
  category_filter UUID DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  state_filter TEXT DEFAULT NULL,
  sort_field TEXT DEFAULT 'created_at',
  sort_direction TEXT DEFAULT 'desc',
  page_num INTEGER DEFAULT 1,
  per_page INTEGER DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  price DECIMAL,
  currency TEXT,
  condition TEXT,
  status listing_status,
  state TEXT,
  lga TEXT,
  city TEXT,
  location TEXT,
  is_boosted BOOLEAN,
  boost_priority_score INTEGER,
  views_count INTEGER,
  favorites_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID,
  category_id UUID,
  user_full_name TEXT,
  user_avatar_url TEXT,
  category_name TEXT,
  category_slug TEXT,
  primary_image_url TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  offset_val INTEGER;
  total BIGINT;
BEGIN
  offset_val := (page_num - 1) * per_page;

  -- Get total count
  SELECT COUNT(*) INTO total
  FROM listings l
  WHERE l.status = 'active'
    AND (search_query = '' OR to_tsvector('english', l.title || ' ' || COALESCE(l.description, '')) @@ plainto_tsquery('english', search_query))
    AND (category_filter IS NULL OR l.category_id = category_filter)
    AND (min_price IS NULL OR l.price >= min_price)
    AND (max_price IS NULL OR l.price <= max_price)
    AND (state_filter IS NULL OR l.state ILIKE state_filter);

  RETURN QUERY EXECUTE format(
    'SELECT
      l.id, l.title, l.slug, l.description, l.price, l.currency, l.condition,
      l.status, l.state, l.lga, l.city, l.location,
      l.is_boosted, l.boost_priority_score, l.views_count, l.favorites_count,
      l.created_at, l.updated_at,
      l.user_id, l.category_id,
      p.full_name AS user_full_name,
      p.avatar_url AS user_avatar_url,
      c.name AS category_name,
      c.slug AS category_slug,
      (SELECT li.url FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.is_primary DESC, li.sort_order ASC LIMIT 1) AS primary_image_url,
      $1 AS total_count
    FROM listings l
    LEFT JOIN profiles p ON p.id = l.user_id
    LEFT JOIN categories c ON c.id = l.category_id
    WHERE l.status = ''active''
      AND ($2 = '''' OR to_tsvector(''english'', l.title || '' '' || COALESCE(l.description, '''')) @@ plainto_tsquery(''english'', $2))
      AND ($3::UUID IS NULL OR l.category_id = $3)
      AND ($4::DECIMAL IS NULL OR l.price >= $4)
      AND ($5::DECIMAL IS NULL OR l.price <= $5)
      AND ($6::TEXT IS NULL OR l.state ILIKE $6)
    ORDER BY l.is_boosted DESC, l.boost_priority_score DESC, l.%I %s
    LIMIT $7 OFFSET $8',
    sort_field, sort_direction
  ) USING total, search_query, category_filter, min_price, max_price, state_filter, per_page, offset_val;
END;
$$;

-- ============================
-- GET USER STATS
-- ============================
CREATE OR REPLACE FUNCTION get_user_stats(target_user_id UUID)
RETURNS TABLE (
  total_ads BIGINT,
  active_ads BIGINT,
  total_views BIGINT,
  total_favorites BIGINT,
  member_since TIMESTAMPTZ,
  average_rating DECIMAL,
  review_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM listings WHERE user_id = target_user_id) AS total_ads,
    (SELECT COUNT(*) FROM listings WHERE user_id = target_user_id AND status = 'active') AS active_ads,
    (SELECT COALESCE(SUM(views_count), 0) FROM listings WHERE user_id = target_user_id) AS total_views,
    (SELECT COALESCE(SUM(favorites_count), 0) FROM listings WHERE user_id = target_user_id) AS total_favorites,
    (SELECT created_at FROM profiles WHERE id = target_user_id) AS member_since,
    (SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0) FROM reviews WHERE target_user_id = target_user_id AND is_approved = true) AS average_rating,
    (SELECT COUNT(*) FROM reviews WHERE target_user_id = target_user_id AND is_approved = true) AS review_count;
END;
$$;

-- ============================
-- CLEANUP EXPIRED BOOSTS (called via cron)
-- ============================
CREATE OR REPLACE FUNCTION cleanup_expired_boosts()
RETURNS TABLE (
  cleaned_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(id) INTO expired_ids
  FROM boosted_listings
  WHERE status = 'active' AND end_date < NOW();

  IF expired_ids IS NOT NULL THEN
    UPDATE boosted_listings
    SET status = 'expired', updated_at = NOW()
    WHERE id = ANY(expired_ids);

    UPDATE listings
    SET is_boosted = false,
        boost_status = 'expired',
        boost_priority_score = 0
    WHERE id IN (
      SELECT listing_id FROM boosted_listings WHERE id = ANY(expired_ids)
    );
  END IF;

  RETURN QUERY SELECT COALESCE(ARRAY_LENGTH(expired_ids, 1), 0) AS cleaned_count;
END;
$$;

-- ============================
-- RECORD DAILY ANALYTICS SNAPSHOT
-- ============================
CREATE OR REPLACE FUNCTION record_daily_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (action, entity_type, entity_id, new_values)
  VALUES (
    'daily_analytics',
    'system',
    NULL,
    jsonb_build_object(
      'total_users', (SELECT COUNT(*) FROM profiles),
      'total_listings', (SELECT COUNT(*) FROM listings),
      'active_listings', (SELECT COUNT(*) FROM listings WHERE status = 'active'),
      'total_views_today', (SELECT COUNT(*) FROM listing_views WHERE created_at >= CURRENT_DATE),
      'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'credit' AND status = 'completed' AND created_at >= CURRENT_DATE),
      'date', CURRENT_DATE
    )
  );
END;
$$;
