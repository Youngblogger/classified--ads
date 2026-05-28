-- iList Marketplace - Rollback: Functions Migration
-- Reverts 202605260002_functions.sql
-- WARNING: Drops all custom PostgreSQL functions.
--          Only run if no application code depends on these functions.

-- ============================
-- REVERT: record_daily_analytics
-- ============================
DROP FUNCTION IF EXISTS record_daily_analytics();

-- ============================
-- REVERT: cleanup_expired_boosts
-- ============================
DROP FUNCTION IF EXISTS cleanup_expired_boosts();

-- ============================
-- REVERT: get_user_stats
-- ============================
DROP FUNCTION IF EXISTS get_user_stats(target_user_id UUID);

-- ============================
-- REVERT: search_listings
-- ============================
DROP FUNCTION IF EXISTS search_listings(
  search_query TEXT,
  category_filter UUID,
  min_price DECIMAL,
  max_price DECIMAL,
  state_filter TEXT,
  sort_field TEXT,
  sort_direction TEXT,
  page_num INTEGER,
  per_page INTEGER
);

-- ============================
-- REVERT: decrement_favorites_count
-- ============================
DROP FUNCTION IF EXISTS decrement_favorites_count(listing_id UUID);

-- ============================
-- REVERT: increment_favorites_count
-- ============================
DROP FUNCTION IF EXISTS increment_favorites_count(listing_id UUID);

-- ============================
-- REVERT: increment_listing_views
-- ============================
DROP FUNCTION IF EXISTS increment_listing_views(listing_id UUID);
