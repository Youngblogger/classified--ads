-- Safe auto-repair tooling
-- Run ONLY after reviewing the verification output from 202606070002_backfill_verification.sql
-- These repairs are SAFE — no data is deleted, only missing/broken values are fixed

-- ============================================
-- 1. REPAIR MISSING STATUSES
-- ============================================
-- If any listings have NULL or invalid status, default them to 'active'
UPDATE listings
SET status = 'active', updated_at = NOW()
WHERE status IS NULL OR status NOT IN ('active', 'inactive', 'sold', 'expired', 'draft', 'pending', 'rejected');

-- ============================================
-- 2. REPAIR NULL TITLES
-- ============================================
UPDATE listings
SET title = 'Untitled Listing', slug = 'untitled-listing-' || id, updated_at = NOW()
WHERE title IS NULL OR title = '';

-- ============================================
-- 3. REPAIR NULL PRICES
-- ============================================
UPDATE listings
SET price = 0, updated_at = NOW()
WHERE price IS NULL;

-- ============================================
-- 4. BACKFILL MODERATION METADATA
-- ============================================
-- If you added moderated_at/moderated_by columns after some listings were created,
-- this backfills status-based defaults for existing listings.
-- This does NOT change status—only adds audit timestamps.
UPDATE listings
SET
  moderated_at = COALESCE(moderated_at, updated_at),
  moderation_note = COALESCE(moderation_note,
    CASE
      WHEN status = 'active' THEN 'Auto-approved (pre-migration legacy)'
      WHEN status = 'rejected' THEN 'Rejected (pre-migration legacy)'
      WHEN status = 'pending' THEN NULL
      ELSE NULL
    END
  )
WHERE moderated_at IS NULL AND status IN ('active', 'rejected');

-- ============================================
-- 5. REPAIR BROKEN IMAGE REFERENCES
-- ============================================
-- Mark listing_images with missing URL as non-primary so they don't break the UI
UPDATE listing_images
SET is_primary = false
WHERE (url IS NULL OR url = '') AND is_primary = true;

-- ============================================
-- 6. FIX ORPHANED LISTING IMAGES
-- ============================================
-- Soft-fix: mark images whose listing no longer exists
-- (Listing images are cascade-deleted on listing delete, so this is rare)
-- Only needed if cascade FK was added after data existed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'listing_images_listing_id_fkey'
      AND table_name = 'listing_images'
  ) THEN
    -- FK exists, cascade handles it — no action needed
    RAISE NOTICE 'Cascade FK exists — orphaned images are handled automatically';
  ELSE
    RAISE NOTICE 'No cascade FK — orphaned images may exist. Run manual cleanup if needed.';
  END IF;
END $$;

-- ============================================
-- 7. SUMMARY OF REPAIRS PERFORMED
-- ============================================
SELECT 'repair_complete' AS status, 'Run verification SQL again to confirm all checks pass' AS message;
