-- Add moderation columns to listings table

ALTER TABLE listings
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS moderation_note TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add sync tracking columns for Laravel/Supabase resilience
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending_sync', 'failed_sync')),
ADD COLUMN IF NOT EXISTS sync_error TEXT,
ADD COLUMN IF NOT EXISTS sync_retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_sync_attempt_at TIMESTAMPTZ;

-- Performance indexes for moderation and sync queries
CREATE INDEX IF NOT EXISTS idx_listings_sync_status ON listings(sync_status) WHERE sync_status != 'synced';
CREATE INDEX IF NOT EXISTS idx_listings_moderated_at ON listings(moderated_at) WHERE moderated_at IS NOT NULL;

-- Listing_images RLS: restrict to images of active/sold listings for public
DROP POLICY IF EXISTS "Anyone can view listing images" ON listing_images;
CREATE POLICY "Anyone can view listing images"
  ON listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
        AND (listings.status = 'active' OR listings.status = 'sold')
    )
    OR
    auth.uid() = (
      SELECT user_id FROM listings WHERE listings.id = listing_images.listing_id
    )
  );
