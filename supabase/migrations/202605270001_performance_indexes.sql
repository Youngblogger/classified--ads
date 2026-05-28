-- Performance Indexes Migration
-- Adds missing indexes for query patterns identified in performance audit

-- listings: subcategory filtering (used in search/filter pages)
CREATE INDEX IF NOT EXISTS idx_listings_subcategory_id ON listings(subcategory_id) WHERE subcategory_id IS NOT NULL;

-- listings: condition filtering (used in search/filters)
CREATE INDEX IF NOT EXISTS idx_listings_condition ON listings(condition) WHERE condition IS NOT NULL;

-- listings: user dashboard queries (my-ads page)
CREATE INDEX IF NOT EXISTS idx_listings_user_status ON listings(user_id, status);

-- listings: boosted listing queries
CREATE INDEX IF NOT EXISTS idx_listings_boost_status ON listings(boost_status, boost_expires_at)
  WHERE boost_status IS NOT NULL AND boost_status = 'active';

-- listings: composite price + status for filtered searches
CREATE INDEX IF NOT EXISTS idx_listings_status_price ON listings(status, price) WHERE status = 'active';

-- listing_favorites: composite lookup for toggle/unfavorite
CREATE INDEX IF NOT EXISTS idx_favorites_user_listing ON listing_favorites(user_id, listing_id);

-- boosted_listings: per-user queries
CREATE INDEX IF NOT EXISTS idx_boosted_listings_user ON boosted_listings(user_id);

-- notifications: per-user sorted queries (most recent first)
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- verification_requests: per-user queries
CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON verification_requests(user_id);

-- reports: per-user queries
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);

-- conversations: participant + listing lookups
CREATE INDEX IF NOT EXISTS idx_conversations_participant_listing ON conversations(buyer_id, seller_id, listing_id);
