-- iList Marketplace - Supabase Database Schema
-- Run this in Supabase SQL Editor to set up the complete database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================
-- ENUMS
-- ============================
CREATE TYPE listing_status AS ENUM ('active', 'inactive', 'sold', 'expired', 'draft', 'pending', 'rejected');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'not_submitted');
CREATE TYPE boost_plan_type AS ENUM ('gold', 'platinum', 'diamond');
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit');

-- ============================
-- PROFILES
-- ============================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_status verification_status DEFAULT 'not_submitted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- CATEGORIES
-- ============================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  image TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- ============================
-- LISTINGS
-- ============================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  condition TEXT,
  status listing_status DEFAULT 'active',
  is_featured BOOLEAN DEFAULT false,
  is_boosted BOOLEAN DEFAULT false,
  boost_type TEXT,
  boost_plan TEXT,
  boost_status TEXT,
  boost_expires_at TIMESTAMPTZ,
  boost_priority_score INTEGER DEFAULT 0,
  negotiable BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  whatsapp_number TEXT,
  phone_number TEXT,
  state TEXT,
  lga TEXT,
  city TEXT,
  location TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  specifications JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ============================
-- LISTING IMAGES (Supabase Storage-backed)
-- ============================
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  medium_url TEXT,
  storage_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- FAVORITES
-- ============================
CREATE TABLE listing_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================
-- LISTING VIEWS (Analytics)
-- ============================
CREATE TABLE listing_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- CONVERSATIONS & MESSAGES (Realtime-enabled)
-- ============================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, seller_id, listing_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT DEFAULT 'text',
  attachment_url TEXT,
  attachment_type TEXT,
  duration INTEGER,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- NOTIFICATIONS
-- ============================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- BOOST SYSTEM
-- ============================
CREATE TABLE boost_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type boost_plan_type NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  priority_score INTEGER DEFAULT 0,
  badge_label TEXT,
  badge_icon TEXT,
  color_scheme JSONB DEFAULT '{}',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE boosted_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES boost_plans(id) ON DELETE CASCADE,
  boost_type boost_plan_type NOT NULL,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending',
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- REPORTS
-- ============================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status report_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- REVIEWS
-- ============================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- TRANSACTIONS
-- ============================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  reference TEXT,
  description TEXT,
  status transaction_status DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- VERIFICATION REQUESTS
-- ============================
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL,
  status verification_status DEFAULT 'pending',
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  business_document_url TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- AUDIT LOGS
-- ============================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- INDEXES
-- ============================
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_slug ON listings(slug);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_boosted ON listings(is_boosted, boost_priority_score DESC) WHERE is_boosted = true;
CREATE INDEX idx_listings_search ON listings USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_listings_state ON listings(state);
CREATE INDEX idx_listings_location ON listings(location);

CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX idx_listing_images_primary ON listing_images(listing_id, is_primary) WHERE is_primary = true;

CREATE INDEX idx_favorites_user_id ON listing_favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON listing_favorites(listing_id);

CREATE INDEX idx_views_listing_id ON listing_views(listing_id);
CREATE INDEX idx_views_created_at ON listing_views(created_at);

CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);

-- ============================
-- AUTO-UPDATE UPDATED_AT TRIGGER
-- ============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boost_plans_updated_at
  BEFORE UPDATE ON boost_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boosted_listings_updated_at
  BEFORE UPDATE ON boosted_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON verification_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================
-- AUTO-GENERATE LISTING SLUG
-- ============================
CREATE OR REPLACE FUNCTION generate_listing_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  base_slug := LOWER(REGEXP_REPLACE(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  base_slug := LEFT(base_slug, 80);
  final_slug := base_slug || '-' || SUBSTR(MD5(NEW.id::TEXT), 1, 8);
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_listing_slug
  BEFORE INSERT ON listings
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_listing_slug();

-- ============================
-- STORAGE BUCKET SETUP
-- ============================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================
-- ROW LEVEL SECURITY
-- ============================

-- Profiles: users can read any profile, edit only their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Categories: public read, admin write
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify categories"
  ON categories FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE verification_status = 'approved' AND is_verified = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE verification_status = 'approved' AND is_verified = true));

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subcategories are viewable by everyone"
  ON subcategories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify subcategories"
  ON subcategories FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- Listings: public read active listings, owners CRUD their own
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  USING (status = 'active' OR status = 'sold' OR auth.uid() = user_id);

CREATE POLICY "Users can create listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- Listing Images: public read, owner manage
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view listing images"
  ON listing_images FOR SELECT
  USING (true);

CREATE POLICY "Users can insert images for their listings"
  ON listing_images FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM listings WHERE id = listing_id
    )
  );

CREATE POLICY "Users can update images for their listings"
  ON listing_images FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM listings WHERE id = listing_id
    )
  );

CREATE POLICY "Users can delete images for their listings"
  ON listing_images FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM listings WHERE id = listing_id
    )
  );

-- Favorites: users manage their own
ALTER TABLE listing_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON listing_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON listing_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites"
  ON listing_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Listing Views: insert allowed for all, select for analytics
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a view"
  ON listing_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Listing owners can view their analytics"
  ON listing_views FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM listings WHERE id = listing_id
    )
  );

-- Conversations: participants only
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Participants can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages: conversation participants only
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT buyer_id FROM conversations WHERE id = conversation_id
      UNION
      SELECT seller_id FROM conversations WHERE id = conversation_id
    )
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Participants can update messages"
  ON messages FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT buyer_id FROM conversations WHERE id = conversation_id
      UNION
      SELECT seller_id FROM conversations WHERE id = conversation_id
    )
  );

-- Notifications: user sees only their own
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Boost Plans: public read, admin write
ALTER TABLE boost_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view boost plans"
  ON boost_plans FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage boost plans"
  ON boost_plans FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- Boosted Listings: public read, owner manage
ALTER TABLE boosted_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view boosted listings"
  ON boosted_listings FOR SELECT
  USING (true);

CREATE POLICY "Users can boost their own listings"
  ON boosted_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their boosts"
  ON boosted_listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Reports: reporter create, admin manage
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can report"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id OR auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

CREATE POLICY "Admins can manage reports"
  ON reports FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- Reviews: public read, authenticated create
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- Transactions: user sees own, admin sees all
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- Verification Requests: user sees own, admin sees all
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification requests"
  ON verification_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit verification requests"
  ON verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage verification requests"
  ON verification_requests FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- Audit Logs: admin only
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- Storage: listing-images bucket RLS
CREATE POLICY "Anyone can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'listing-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'listing-images' AND auth.role() = 'authenticated');

-- ============================
-- SEED DATA: Default Boost Plans
-- ============================
INSERT INTO boost_plans (name, type, price, duration_days, priority_score, badge_label, badge_icon, color_scheme, features, sort_order) VALUES
  ('Gold Boost', 'gold', 2000, 3, 1, 'Gold', 'zap', '{"gradient": "from-amber-400 via-yellow-300 to-amber-400", "border": "border-amber-300", "text": "text-amber-900", "bg": "bg-gradient-to-r from-amber-50 to-yellow-50"}', '["Appears above normal listings", "Highlighted ad card", "Better search ranking", "Gold badge", "Increased impressions"]', 1),
  ('Platinum Boost', 'platinum', 5000, 7, 2, 'Platinum', 'crown', '{"gradient": "from-slate-400 via-slate-300 to-slate-400", "border": "border-slate-300", "text": "text-slate-900", "bg": "bg-gradient-to-r from-slate-50 to-gray-50"}', '["Homepage exposure", "Priority category placement", "Higher search visibility", "Platinum badge", "More impressions than Gold"]', 2),
  ('Diamond VIP', 'diamond', 10000, 14, 3, 'Diamond', 'diamond', '{"gradient": "from-blue-500 via-blue-400 to-blue-600", "border": "border-blue-300", "text": "text-blue-900", "bg": "bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50"}', '["Top homepage placement", "Always pinned above lower tiers", "Highest search priority", "Diamond animated badge", "Priority in recommended ads", "Extra premium styling"]', 3)
ON CONFLICT DO NOTHING;
