-- Add missing boost fields to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS boost_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS boosted_at TIMESTAMPTZ;

-- Add wallet balance column to profiles if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12,2) DEFAULT 0;

-- Create function to auto-expire boosts
CREATE OR REPLACE FUNCTION expire_boosts()
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET
    is_boosted = false,
    boost_type = NULL,
    boost_plan = NULL,
    boost_status = 'expired',
    boost_priority_score = 0
  WHERE is_boosted = true
    AND boost_expires_at IS NOT NULL
    AND boost_expires_at < NOW();

  UPDATE boosted_listings
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create pg_cron extension if available
-- This will be used for scheduled boost expiration
-- If pg_cron is not available, a separate cron job should call expire_boosts()

-- Index for expired boosts query
CREATE INDEX IF NOT EXISTS idx_listings_boost_expires_at ON listings(boost_expires_at) WHERE is_boosted = true;
