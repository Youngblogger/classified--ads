-- Backfill verification + audit query
-- Run this SQL in Supabase SQL Editor to audit data integrity
-- This is READ-ONLY — no data is modified

-- ============================================
-- 1. LISTINGS MISSING REQUIRED RELATIONS
-- ============================================
SELECT 'listings_missing_category_id' AS audit_check, COUNT(*) AS count
FROM listings WHERE category_id IS NULL;

SELECT 'listings_missing_subcategory_id' AS audit_check, COUNT(*) AS count
FROM listings WHERE subcategory_id IS NULL;

SELECT 'listings_missing_user_id' AS audit_check, COUNT(*) AS count
FROM listings WHERE user_id IS NULL;

SELECT 'listings_missing_title' AS audit_check, COUNT(*) AS count
FROM listings WHERE title IS NULL OR title = '';

SELECT 'listings_missing_slug' AS audit_check, COUNT(*) AS count
FROM listings WHERE slug IS NULL OR slug = '';

SELECT 'listings_missing_price' AS audit_check, COUNT(*) AS count
FROM listings WHERE price IS NULL OR price = 0;

-- ============================================
-- 2. INVALID STATUSES
-- ============================================
SELECT 'listings_invalid_status' AS audit_check, COUNT(*) AS count
FROM listings
WHERE status NOT IN ('active', 'inactive', 'sold', 'expired', 'draft', 'pending', 'rejected');

SELECT 'listings_status_breakdown' AS audit_check, status, COUNT(*) AS count
FROM listings
GROUP BY status
ORDER BY count DESC;

-- ============================================
-- 3. INVALID UUID REFERENCES
-- ============================================
SELECT 'orphaned_category_ids' AS audit_check, COUNT(*) AS count
FROM listings l
WHERE l.category_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = l.category_id);

SELECT 'orphaned_subcategory_ids' AS audit_check, COUNT(*) AS count
FROM listings l
WHERE l.subcategory_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM subcategories s WHERE s.id = l.subcategory_id);

SELECT 'orphaned_user_ids' AS audit_check, COUNT(*) AS count
FROM listings l
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = l.user_id);

-- ============================================
-- 4. MALFORMED IMAGE DATA
-- ============================================
SELECT 'listings_with_zero_images' AS audit_check, COUNT(*) AS count
FROM listings l
WHERE (
  SELECT COUNT(*) FROM listing_images li WHERE li.listing_id = l.id
) = 0;

SELECT 'listing_images_missing_url' AS audit_check, COUNT(*) AS count
FROM listing_images WHERE url IS NULL OR url = '';

SELECT 'listing_images_missing_storage_path' AS audit_check, COUNT(*) AS count
FROM listing_images WHERE storage_path IS NULL OR storage_path = '';

-- ============================================
-- 5. DUPLICATE DETECTION
-- ============================================
SELECT 'duplicate_slugs' AS audit_check, slug, COUNT(*) AS count
FROM listings
GROUP BY slug
HAVING COUNT(*) > 1;

-- ============================================
-- 6. INVALID TIMESTAMPS
-- ============================================
SELECT 'listings_future_created_at' AS audit_check, COUNT(*) AS count
FROM listings
WHERE created_at > NOW() + INTERVAL '1 day';

SELECT 'listings_null_created_at' AS audit_check, COUNT(*) AS count
FROM listings
WHERE created_at IS NULL;

-- ============================================
-- 7. SYNC STATUS DISTRIBUTION (if column exists)
-- ============================================
SELECT 'sync_status_breakdown' AS audit_check, COALESCE(sync_status, 'not_set') AS sync_status, COUNT(*) AS count
FROM listings
GROUP BY sync_status
ORDER BY count DESC;

-- ============================================
-- 8. SUMMARY REPORT
-- ============================================
WITH checks AS (
  SELECT 'listings_total' AS check_name, COUNT(*)::TEXT AS value FROM listings
  UNION ALL
  SELECT 'listing_images_total', COUNT(*)::TEXT FROM listing_images
  UNION ALL
  SELECT 'categories_total', COUNT(*)::TEXT FROM categories
  UNION ALL
  SELECT 'subcategories_total', COUNT(*)::TEXT FROM subcategories
  UNION ALL
  SELECT 'profiles_total', COUNT(*)::TEXT FROM profiles
  UNION ALL
  SELECT 'listings_active', COUNT(*)::TEXT FROM listings WHERE status = 'active'
  UNION ALL
  SELECT 'listings_pending', COUNT(*)::TEXT FROM listings WHERE status = 'pending'
  UNION ALL
  SELECT 'listings_rejected', COUNT(*)::TEXT FROM listings WHERE status = 'rejected'
  UNION ALL
  SELECT 'listings_expired', COUNT(*)::TEXT FROM listings WHERE status = 'expired'
  UNION ALL
  SELECT 'listings_sold', COUNT(*)::TEXT FROM listings WHERE status = 'sold'
)
SELECT 'summary' AS audit_section, check_name, value FROM checks
ORDER BY check_name;
