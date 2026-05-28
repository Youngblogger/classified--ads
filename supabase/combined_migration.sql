-- ============================================================
-- iList Marketplace - Full Database Migration
-- Run this entire script in the Supabase Dashboard SQL Editor
-- Order: 001 → 002 → 003 → 006 → 007 → seed
-- ============================================================

-- ============================================================
-- MIGRATION 001: Initial Schema
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE listing_status AS ENUM ('active', 'inactive', 'sold', 'expired', 'draft', 'pending', 'rejected');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'not_submitted');
CREATE TYPE boost_plan_type AS ENUM ('gold', 'platinum', 'diamond');
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit');

CREATE TABLE IF NOT EXISTS profiles (
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

CREATE TABLE IF NOT EXISTS categories (
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

CREATE TABLE IF NOT EXISTS subcategories (
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

CREATE TABLE IF NOT EXISTS listings (
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

CREATE TABLE IF NOT EXISTS listing_images (
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

CREATE TABLE IF NOT EXISTS listing_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS listing_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
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

CREATE TABLE IF NOT EXISTS messages (
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

CREATE TABLE IF NOT EXISTS notifications (
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

CREATE TABLE IF NOT EXISTS boost_plans (
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

CREATE TABLE IF NOT EXISTS boosted_listings (
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

CREATE TABLE IF NOT EXISTS reports (
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

CREATE TABLE IF NOT EXISTS reviews (
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

CREATE TABLE IF NOT EXISTS transactions (
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

CREATE TABLE IF NOT EXISTS verification_requests (
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

CREATE TABLE IF NOT EXISTS audit_logs (
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_boosted ON listings(is_boosted, boost_priority_score DESC) WHERE is_boosted = true;
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_listings_state ON listings(state);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_primary ON listing_images(listing_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON listing_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON listing_favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_views_listing_id ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_views_created_at ON listing_views(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
  CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
  CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subcategories_updated_at') THEN
  CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_listings_updated_at') THEN
  CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at') THEN
  CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_messages_updated_at') THEN
  CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_boost_plans_updated_at') THEN
  CREATE TRIGGER update_boost_plans_updated_at BEFORE UPDATE ON boost_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_boosted_listings_updated_at') THEN
  CREATE TRIGGER update_boosted_listings_updated_at BEFORE UPDATE ON boosted_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reports_updated_at') THEN
  CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reviews_updated_at') THEN
  CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transactions_updated_at') THEN
  CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_verification_requests_updated_at') THEN
  CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON verification_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF; END $$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), NEW.email, NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-generate listing slug
CREATE OR REPLACE FUNCTION generate_listing_slug()
RETURNS TRIGGER AS $$
DECLARE base_slug TEXT; final_slug TEXT;
BEGIN
  base_slug := LOWER(REGEXP_REPLACE(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  base_slug := LEFT(base_slug, 80);
  final_slug := base_slug || '-' || SUBSTR(MD5(NEW.id::TEXT), 1, 8);
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_listing_slug ON listings;
CREATE TRIGGER set_listing_slug
  BEFORE INSERT ON listings
  FOR EACH ROW WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_listing_slug();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS: Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only admins can modify categories" ON categories;
CREATE POLICY "Only admins can modify categories" ON categories FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE verification_status = 'approved' AND is_verified = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE verification_status = 'approved' AND is_verified = true));

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Subcategories are viewable by everyone" ON subcategories;
CREATE POLICY "Subcategories are viewable by everyone" ON subcategories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only admins can modify subcategories" ON subcategories;
CREATE POLICY "Only admins can modify subcategories" ON subcategories FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- RLS: Listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
CREATE POLICY "Anyone can view active listings" ON listings FOR SELECT USING (status = 'active' OR status = 'sold' OR auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create listings" ON listings;
CREATE POLICY "Users can create listings" ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
CREATE POLICY "Users can update their own listings" ON listings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
CREATE POLICY "Users can delete their own listings" ON listings FOR DELETE USING (auth.uid() = user_id);

-- RLS: Listing Images
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view listing images" ON listing_images;
CREATE POLICY "Anyone can view listing images" ON listing_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert images for their listings" ON listing_images;
CREATE POLICY "Users can insert images for their listings" ON listing_images FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM listings WHERE id = listing_id));
DROP POLICY IF EXISTS "Users can update images for their listings" ON listing_images;
CREATE POLICY "Users can update images for their listings" ON listing_images FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM listings WHERE id = listing_id));
DROP POLICY IF EXISTS "Users can delete images for their listings" ON listing_images;
CREATE POLICY "Users can delete images for their listings" ON listing_images FOR DELETE USING (auth.uid() IN (SELECT user_id FROM listings WHERE id = listing_id));

-- RLS: Favorites
ALTER TABLE listing_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own favorites" ON listing_favorites;
CREATE POLICY "Users can view their own favorites" ON listing_favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can add favorites" ON listing_favorites;
CREATE POLICY "Users can add favorites" ON listing_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can remove their favorites" ON listing_favorites;
CREATE POLICY "Users can remove their favorites" ON listing_favorites FOR DELETE USING (auth.uid() = user_id);

-- RLS: Listing Views
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can record a view" ON listing_views;
CREATE POLICY "Anyone can record a view" ON listing_views FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Listing owners can view their analytics" ON listing_views;
CREATE POLICY "Listing owners can view their analytics" ON listing_views FOR SELECT USING (auth.uid() IN (SELECT user_id FROM listings WHERE id = listing_id));

-- RLS: Conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants can view conversations" ON conversations;
CREATE POLICY "Participants can view conversations" ON conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
DROP POLICY IF EXISTS "Participants can create conversations" ON conversations;
CREATE POLICY "Participants can create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id);
DROP POLICY IF EXISTS "Participants can update conversations" ON conversations;
CREATE POLICY "Participants can update conversations" ON conversations FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- RLS: Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants can view messages" ON messages;
CREATE POLICY "Participants can view messages" ON messages FOR SELECT USING (auth.uid() IN (SELECT buyer_id FROM conversations WHERE id = conversation_id UNION SELECT seller_id FROM conversations WHERE id = conversation_id));
DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Participants can update messages" ON messages;
CREATE POLICY "Participants can update messages" ON messages FOR UPDATE USING (auth.uid() IN (SELECT buyer_id FROM conversations WHERE id = conversation_id UNION SELECT seller_id FROM conversations WHERE id = conversation_id));

-- RLS: Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS: Boost Plans
ALTER TABLE boost_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view boost plans" ON boost_plans;
CREATE POLICY "Anyone can view boost plans" ON boost_plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage boost plans" ON boost_plans;
CREATE POLICY "Admins can manage boost plans" ON boost_plans FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- RLS: Boosted Listings
ALTER TABLE boosted_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view boosted listings" ON boosted_listings;
CREATE POLICY "Anyone can view boosted listings" ON boosted_listings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can boost their own listings" ON boosted_listings;
CREATE POLICY "Users can boost their own listings" ON boosted_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their boosts" ON boosted_listings;
CREATE POLICY "Users can manage their boosts" ON boosted_listings FOR UPDATE USING (auth.uid() = user_id);

-- RLS: Reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can report" ON reports;
CREATE POLICY "Anyone can report" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
CREATE POLICY "Users can view their own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));
DROP POLICY IF EXISTS "Admins can manage reports" ON reports;
CREATE POLICY "Admins can manage reports" ON reports FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- RLS: Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- RLS: Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can create transactions" ON transactions;
CREATE POLICY "System can create transactions" ON transactions FOR INSERT WITH CHECK (true);

-- RLS: Verification Requests
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own verification requests" ON verification_requests;
CREATE POLICY "Users can view their own verification requests" ON verification_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can submit verification requests" ON verification_requests;
CREATE POLICY "Users can submit verification requests" ON verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage verification requests" ON verification_requests;
CREATE POLICY "Admins can manage verification requests" ON verification_requests FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true)) WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- RLS: Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- RLS: Storage listing-images
DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;
CREATE POLICY "Anyone can view listing images" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
CREATE POLICY "Users can update their own images" ON storage.objects FOR UPDATE USING (bucket_id = 'listing-images' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE USING (bucket_id = 'listing-images' AND auth.role() = 'authenticated');

-- Seed boost plans
INSERT INTO boost_plans (name, type, price, duration_days, priority_score, badge_label, badge_icon, color_scheme, features, sort_order) VALUES
  ('Gold Boost', 'gold', 2000, 3, 1, 'Gold', 'zap', '{"gradient": "from-amber-400 via-yellow-300 to-amber-400", "border": "border-amber-300", "text": "text-amber-900", "bg": "bg-gradient-to-r from-amber-50 to-yellow-50"}', '["Appears above normal listings", "Highlighted ad card", "Better search ranking", "Gold badge", "Increased impressions"]', 1),
  ('Platinum Boost', 'platinum', 5000, 7, 2, 'Platinum', 'crown', '{"gradient": "from-slate-400 via-slate-300 to-slate-400", "border": "border-slate-300", "text": "text-slate-900", "bg": "bg-gradient-to-r from-slate-50 to-gray-50"}', '["Homepage exposure", "Priority category placement", "Higher search visibility", "Platinum badge", "More impressions than Gold"]', 2),
  ('Diamond VIP', 'diamond', 10000, 14, 3, 'Diamond', 'diamond', '{"gradient": "from-blue-500 via-blue-400 to-blue-600", "border": "border-blue-300", "text": "text-blue-900", "bg": "bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50"}', '["Top homepage placement", "Always pinned above lower tiers", "Highest search priority", "Diamond animated badge", "Priority in recommended ads", "Extra premium styling"]', 3)
ON CONFLICT DO NOTHING;


-- ============================================================
-- MIGRATION 002: Functions
-- ============================================================
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void AS $$ BEGIN UPDATE listings SET views_count = views_count + 1 WHERE id = listing_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_favorites_count(listing_id UUID)
RETURNS void AS $$ BEGIN UPDATE listings SET favorites_count = (SELECT COUNT(*) FROM listing_favorites WHERE listing_id = increment_favorites_count.listing_id) WHERE id = listing_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_favorites_count(listing_id UUID)
RETURNS void AS $$ BEGIN UPDATE listings SET favorites_count = GREATEST(0, favorites_count - 1) WHERE id = listing_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION search_listings(
  search_query TEXT DEFAULT '', category_filter UUID DEFAULT NULL, min_price DECIMAL DEFAULT NULL, max_price DECIMAL DEFAULT NULL,
  state_filter TEXT DEFAULT NULL, sort_field TEXT DEFAULT 'created_at', sort_direction TEXT DEFAULT 'desc',
  page_num INTEGER DEFAULT 1, per_page INTEGER DEFAULT 12
)
RETURNS TABLE (
  id UUID, title TEXT, slug TEXT, description TEXT, price DECIMAL, currency TEXT, condition TEXT,
  status listing_status, state TEXT, lga TEXT, city TEXT, location TEXT,
  is_boosted BOOLEAN, boost_priority_score INTEGER, views_count INTEGER, favorites_count INTEGER,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, user_id UUID, category_id UUID,
  user_full_name TEXT, user_avatar_url TEXT, category_name TEXT, category_slug TEXT,
  primary_image_url TEXT, total_count BIGINT
) LANGUAGE plpgsql AS $$
DECLARE offset_val INTEGER; total BIGINT;
BEGIN
  offset_val := (page_num - 1) * per_page;
  SELECT COUNT(*) INTO total FROM listings l
  WHERE l.status = 'active'
    AND (search_query = '' OR to_tsvector('english', l.title || ' ' || COALESCE(l.description, '')) @@ plainto_tsquery('english', search_query))
    AND (category_filter IS NULL OR l.category_id = category_filter)
    AND (min_price IS NULL OR l.price >= min_price)
    AND (max_price IS NULL OR l.price <= max_price)
    AND (state_filter IS NULL OR l.state ILIKE state_filter);
  RETURN QUERY EXECUTE format(
    'SELECT l.id, l.title, l.slug, l.description, l.price, l.currency, l.condition,
     l.status, l.state, l.lga, l.city, l.location,
     l.is_boosted, l.boost_priority_score, l.views_count, l.favorites_count,
     l.created_at, l.updated_at, l.user_id, l.category_id,
     p.full_name AS user_full_name, p.avatar_url AS user_avatar_url,
     c.name AS category_name, c.slug AS category_slug,
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
END; $$;

CREATE OR REPLACE FUNCTION get_user_stats(target_user_id UUID)
RETURNS TABLE (total_ads BIGINT, active_ads BIGINT, total_views BIGINT, total_favorites BIGINT, member_since TIMESTAMPTZ, average_rating DECIMAL, review_count BIGINT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT COUNT(*) FROM listings WHERE user_id = target_user_id) AS total_ads,
    (SELECT COUNT(*) FROM listings WHERE user_id = target_user_id AND status = 'active') AS active_ads,
    (SELECT COALESCE(SUM(views_count), 0) FROM listings WHERE user_id = target_user_id) AS total_views,
    (SELECT COALESCE(SUM(favorites_count), 0) FROM listings WHERE user_id = target_user_id) AS total_favorites,
    (SELECT created_at FROM profiles WHERE id = target_user_id) AS member_since,
    (SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0) FROM reviews WHERE target_user_id = target_user_id AND is_approved = true) AS average_rating,
    (SELECT COUNT(*) FROM reviews WHERE target_user_id = target_user_id AND is_approved = true) AS review_count;
END; $$;

CREATE OR REPLACE FUNCTION cleanup_expired_boosts()
RETURNS TABLE (cleaned_count INTEGER) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE expired_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(id) INTO expired_ids FROM boosted_listings WHERE status = 'active' AND end_date < NOW();
  IF expired_ids IS NOT NULL THEN
    UPDATE boosted_listings SET status = 'expired', updated_at = NOW() WHERE id = ANY(expired_ids);
    UPDATE listings SET is_boosted = false, boost_status = 'expired', boost_priority_score = 0 WHERE id IN (SELECT listing_id FROM boosted_listings WHERE id = ANY(expired_ids));
  END IF;
  RETURN QUERY SELECT COALESCE(ARRAY_LENGTH(expired_ids, 1), 0) AS cleaned_count;
END; $$;

CREATE OR REPLACE FUNCTION record_daily_analytics()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO audit_logs (action, entity_type, entity_id, new_values)
  VALUES ('daily_analytics', 'system', NULL, jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_listings', (SELECT COUNT(*) FROM listings),
    'active_listings', (SELECT COUNT(*) FROM listings WHERE status = 'active'),
    'total_views_today', (SELECT COUNT(*) FROM listing_views WHERE created_at >= CURRENT_DATE),
    'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'credit' AND status = 'completed' AND created_at >= CURRENT_DATE),
    'date', CURRENT_DATE
  ));
END; $$;


-- ============================================================
-- MIGRATION 003: Security Hardening
-- ============================================================
CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS supabase_user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$ SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')); $$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$ SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'); $$ LANGUAGE sql STABLE SECURITY DEFINER;

INSERT INTO storage.buckets (id, name, public) VALUES ('verification-documents', 'verification-documents', false) ON CONFLICT (id) DO NOTHING;

-- Updated RLS with admin role checks
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin()) WITH CHECK (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "Only admins can modify categories" ON categories;
CREATE POLICY "Only admins can modify categories" ON categories FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Only admins can modify subcategories" ON subcategories;
CREATE POLICY "Only admins can modify subcategories" ON subcategories FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
CREATE POLICY "Admins can view all notifications" ON notifications FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Admins can manage boost plans" ON boost_plans;
CREATE POLICY "Admins can manage boost plans" ON boost_plans FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Users can manage their boosts" ON boosted_listings;
CREATE POLICY "Users can manage their boosts" ON boosted_listings FOR UPDATE USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
CREATE POLICY "Users can view their own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id OR is_admin());

DROP POLICY IF EXISTS "Admins can manage reports" ON reports;
CREATE POLICY "Admins can manage reports" ON reports FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "System can create transactions" ON transactions;
CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions" ON transactions FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Admins can manage verification requests" ON verification_requests;
CREATE POLICY "Admins can manage verification requests" ON verification_requests FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "Only admins can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND auth.uid() IN (SELECT buyer_id FROM conversations WHERE id = conversation_id UNION SELECT seller_id FROM conversations WHERE id = conversation_id));

-- Storage security
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Users can upload to their own listing paths" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = 'listings');

DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
CREATE POLICY "Users can update listing images" ON storage.objects FOR UPDATE USING (bucket_id = 'listing-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = 'listings');

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete listing images" ON storage.objects FOR DELETE USING (bucket_id = 'listing-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = 'listings');

-- Verification documents storage policies
CREATE POLICY "Users can upload own verification documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = 'verifications' AND SPLIT_PART(name, '/', 2) = auth.uid()::TEXT);

CREATE POLICY "Users can view own verification documents" ON storage.objects FOR SELECT USING (bucket_id = 'verification-documents' AND (SPLIT_PART(name, '/', 2) = auth.uid()::TEXT OR is_admin()));

CREATE POLICY "Admins can manage verification documents" ON storage.objects FOR ALL USING (bucket_id = 'verification-documents' AND is_admin());

-- Reviews unique constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS unique_review_per_listing;
ALTER TABLE reviews ADD CONSTRAINT unique_review_per_listing UNIQUE (reviewer_id, listing_id);

-- Boost status enum
CREATE TYPE boost_status AS ENUM ('active', 'expired', 'cancelled');
ALTER TABLE boosted_listings ADD COLUMN IF NOT EXISTS status_new boost_status;
UPDATE boosted_listings SET status_new = CASE WHEN status = 'active' THEN 'active'::boost_status WHEN status = 'expired' THEN 'expired'::boost_status ELSE 'cancelled'::boost_status END;
ALTER TABLE boosted_listings DROP COLUMN IF EXISTS status;
ALTER TABLE boosted_listings RENAME COLUMN status_new TO status;
ALTER TABLE boosted_listings ALTER COLUMN status SET DEFAULT 'active'::boost_status;
ALTER TABLE boosted_listings ALTER COLUMN status SET NOT NULL;

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read, sender_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_reviews_target_user ON reviews(target_user_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(buyer_id, seller_id, listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_date ON listing_views(listing_id, created_at);

-- Admin analytics function
CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_listings', (SELECT COUNT(*) FROM listings),
    'active_listings', (SELECT COUNT(*) FROM listings WHERE status = 'active'),
    'pending_listings', (SELECT COUNT(*) FROM listings WHERE status = 'pending'),
    'total_views', (SELECT COUNT(*) FROM listing_views),
    'total_favorites', (SELECT COUNT(*) FROM listing_favorites),
    'pending_verifications', (SELECT COUNT(*) FROM verification_requests WHERE status = 'pending'),
    'pending_reports', (SELECT COUNT(*) FROM reports WHERE status = 'pending'),
    'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'credit' AND status = 'completed')
  ) INTO result;
  RETURN result;
END; $$;

-- Avatar bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND SPLIT_PART(name, '/', 1) = auth.uid()::TEXT);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND SPLIT_PART(name, '/', 1) = auth.uid()::TEXT);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND SPLIT_PART(name, '/', 1) = auth.uid()::TEXT);

GRANT USAGE ON TYPE user_role TO authenticated, anon;
GRANT USAGE ON TYPE boost_status TO authenticated, anon;


-- ============================================================
-- MIGRATION 006: Verification & Trust System (part 1)
-- ============================================================
CREATE TYPE trust_tier AS ENUM ('highly_trusted', 'trusted', 'new_seller');
CREATE TYPE document_type AS ENUM ('nin', 'voters_card', 'drivers_license', 'international_passport', 'business_cac');
CREATE TYPE verification_decision AS ENUM ('approved', 'rejected', 'resubmission_required');

-- Add trust columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  ADD COLUMN IF NOT EXISTS trust_tier trust_tier DEFAULT 'new_seller',
  ADD COLUMN IF NOT EXISTS id_document_type document_type,
  ADD COLUMN IF NOT EXISTS id_document_number_masked TEXT,
  ADD COLUMN IF NOT EXISTS id_document_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS response_rate DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS response_time TEXT,
  ADD COLUMN IF NOT EXISTS total_transactions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_fraud_check_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_trust_score ON profiles(trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_trust_tier ON profiles(trust_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);

-- Identity documents table
CREATE TABLE IF NOT EXISTS identity_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_number_hash TEXT NOT NULL,
  document_number_masked TEXT NOT NULL,
  document_front_hash TEXT,
  document_back_hash TEXT,
  selfie_hash TEXT,
  issuing_country TEXT DEFAULT 'NG',
  is_expired BOOLEAN DEFAULT false,
  expiry_date DATE,
  metadata JSONB DEFAULT '{}',
  status verification_status DEFAULT 'pending',
  fraud_score INTEGER DEFAULT 0,
  fraud_signals JSONB DEFAULT '[]',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_identity_docs_user ON identity_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_docs_number_hash ON identity_documents(document_number_hash);
CREATE INDEX IF NOT EXISTS idx_identity_docs_front_hash ON identity_documents(document_front_hash) WHERE document_front_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_identity_docs_status ON identity_documents(status);
CREATE INDEX IF NOT EXISTS idx_identity_docs_fraud ON identity_documents(fraud_score DESC) WHERE fraud_score > 50;

-- Trust scores table
CREATE TABLE IF NOT EXISTS trust_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  identity_score INTEGER NOT NULL DEFAULT 0 CHECK (identity_score >= 0 AND identity_score <= 100),
  behavior_score INTEGER NOT NULL DEFAULT 0 CHECK (behavior_score >= 0 AND behavior_score <= 100),
  activity_score INTEGER NOT NULL DEFAULT 0 CHECK (activity_score >= 0 AND activity_score <= 100),
  identity_weight DECIMAL(3,2) DEFAULT 0.40,
  behavior_weight DECIMAL(3,2) DEFAULT 0.40,
  activity_weight DECIMAL(3,2) DEFAULT 0.20,
  tier trust_tier DEFAULT 'new_seller',
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_trust_scores_overall ON trust_scores(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_trust_scores_tier ON trust_scores(tier);

-- Add columns to verification_requests
ALTER TABLE verification_requests
  ADD COLUMN IF NOT EXISTS document_type document_type,
  ADD COLUMN IF NOT EXISTS document_number_masked TEXT,
  ADD COLUMN IF NOT EXISTS fraud_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_fail_reason TEXT,
  ADD COLUMN IF NOT EXISTS document_metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS decision verification_decision,
  ADD COLUMN IF NOT EXISTS decided_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;

CREATE INDEX IF NOT EXISTS idx_verification_requests_fraud ON verification_requests(fraud_score DESC) WHERE fraud_score > 50;
CREATE INDEX IF NOT EXISTS idx_verification_requests_doc_type ON verification_requests(document_type);
CREATE INDEX IF NOT EXISTS idx_verification_requests_decision ON verification_requests(decision);

-- Duplicate document check function
CREATE OR REPLACE FUNCTION check_document_duplicates(doc_number_hash TEXT, check_user_id UUID)
RETURNS TABLE (is_duplicate BOOLEAN, existing_user_id UUID, existing_document_type document_type)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT TRUE, user_id, document_type FROM identity_documents WHERE document_number_hash = check_document_duplicates.doc_number_hash AND user_id != check_document_duplicates.check_user_id AND status = 'approved' LIMIT 1;
  IF NOT FOUND THEN RETURN QUERY SELECT FALSE, NULL::UUID, NULL::document_type; END IF;
END; $$;

-- Fraud score calculation
CREATE OR REPLACE FUNCTION calculate_fraud_score(p_user_id UUID, p_document_number_hash TEXT, p_ip_address TEXT DEFAULT NULL)
RETURNS TABLE (score INTEGER, signals JSONB)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_score INTEGER := 0; v_signals JSONB := '[]'::JSONB; v_dup_check RECORD; v_account_age INTERVAL; v_recent_rejections INTEGER; v_previous_attempts INTEGER;
BEGIN
  FOR v_dup_check IN SELECT user_id, document_type FROM identity_documents WHERE document_number_hash = calculate_fraud_score.p_document_number_hash AND user_id != calculate_fraud_score.p_user_id AND status = 'approved' LOOP
    v_score := v_score + 40; v_signals := v_signals || jsonb_build_object('signal', 'duplicate_document', 'weight', 40, 'detail', 'Document already registered to another account');
  END LOOP;
  SELECT age(NOW(), created_at) INTO v_account_age FROM profiles WHERE id = p_user_id;
  IF v_account_age < INTERVAL '7 days' THEN v_score := v_score + 15; v_signals := v_signals || jsonb_build_object('signal', 'new_account', 'weight', 15, 'detail', format('Account age: %s', v_account_age)); END IF;
  SELECT COUNT(*) INTO v_recent_rejections FROM verification_requests WHERE user_id = p_user_id AND status = 'rejected' AND created_at > NOW() - INTERVAL '90 days';
  IF v_recent_rejections > 0 THEN v_score := v_score + LEAST(v_recent_rejections * 10, 30); v_signals := v_signals || jsonb_build_object('signal', 'previous_rejections', 'weight', LEAST(v_recent_rejections * 10, 30), 'detail', format('%s rejection(s) in last 90 days', v_recent_rejections)); END IF;
  SELECT COUNT(*) INTO v_previous_attempts FROM verification_requests WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '24 hours';
  IF v_previous_attempts > 3 THEN v_score := v_score + 10; v_signals := v_signals || jsonb_build_object('signal', 'rapid_resubmission', 'weight', 10, 'detail', format('%s attempts in 24 hours', v_previous_attempts)); END IF;
  v_score := LEAST(v_score, 100);
  RETURN QUERY SELECT v_score, v_signals;
END; $$;

-- Auto-verify function
CREATE OR REPLACE FUNCTION auto_verify_document(p_request_id UUID)
RETURNS TABLE (decision verification_decision, reason TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_request RECORD; v_fraud_score INTEGER; v_signals JSONB;
BEGIN
  SELECT * INTO v_request FROM verification_requests WHERE id = p_request_id; IF NOT FOUND THEN RETURN; END IF;
  SELECT f.score, f.signals INTO v_fraud_score, v_signals FROM calculate_fraud_score(v_request.user_id, 'placeholder_hash', v_request.ip_address) f;
  UPDATE verification_requests SET fraud_score = v_fraud_score, document_metadata = jsonb_set(COALESCE(document_metadata, '{}'::JSONB), '{fraud_signals}', v_signals) WHERE id = p_request_id;
  IF v_fraud_score < 20 THEN RETURN QUERY SELECT 'approved'::verification_decision, 'Passed auto-verification'::TEXT;
  ELSIF v_fraud_score < 50 THEN RETURN QUERY SELECT 'resubmission_required'::verification_decision, 'Manual review required'::TEXT;
  ELSE RETURN QUERY SELECT 'rejected'::verification_decision, format('Flagged by fraud detection (score: %s)', v_fraud_score)::TEXT; END IF;
END; $$;

-- Trust score calculation (v1 from migration 006)
CREATE OR REPLACE FUNCTION calculate_trust_score(target_user_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_identity_score INTEGER := 0; v_behavior_score INTEGER := 0; v_activity_score INTEGER := 0;
  v_overall INTEGER := 0; v_tier trust_tier; v_profile RECORD; v_stats RECORD;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = target_user_id;
  IF v_profile.verification_status = 'approved' THEN v_identity_score := 60; IF v_profile.role IN ('admin', 'superadmin') THEN v_identity_score := v_identity_score + 40; END IF; END IF;
  SELECT COALESCE(AVG(r.rating), 0) AS avg_rating, COUNT(r.id) AS review_count, COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') AS transactions
    INTO v_stats FROM profiles p LEFT JOIN reviews r ON r.target_user_id = p.id AND r.is_approved = true LEFT JOIN transactions t ON t.user_id = p.id WHERE p.id = target_user_id;
  v_behavior_score := 0; IF v_stats.avg_rating > 0 THEN v_behavior_score := v_behavior_score + LEAST((v_stats.avg_rating / 5.0) * 40, 40); END IF;
  v_behavior_score := v_behavior_score + LEAST(v_stats.review_count * 5, 25); v_behavior_score := v_behavior_score + LEAST(v_stats.transactions * 2, 35); v_behavior_score := LEAST(v_behavior_score, 100);
  SELECT COUNT(*) FILTER (WHERE status = 'active') AS active_ads INTO v_stats FROM listings WHERE user_id = target_user_id;
  v_activity_score := LEAST(v_stats.active_ads * 10, 30); IF v_profile.response_rate IS NOT NULL THEN v_activity_score := v_activity_score + LEAST((v_profile.response_rate / 100.0) * 40, 40); END IF;
  v_activity_score := LEAST(v_activity_score, 100);
  v_overall := ROUND(v_identity_score * 0.40 + v_behavior_score * 0.40 + v_activity_score * 0.20);
  IF v_overall >= 80 THEN v_tier := 'highly_trusted'; ELSIF v_overall >= 50 THEN v_tier := 'trusted'; ELSE v_tier := 'new_seller'; END IF;
  UPDATE profiles SET trust_score = v_overall, trust_tier = v_tier WHERE id = target_user_id;
  INSERT INTO trust_scores (user_id, overall_score, identity_score, behavior_score, activity_score, tier)
    VALUES (target_user_id, v_overall, v_identity_score, v_behavior_score, v_activity_score, v_tier)
    ON CONFLICT (user_id) DO UPDATE SET overall_score = EXCLUDED.overall_score, identity_score = EXCLUDED.identity_score, behavior_score = EXCLUDED.behavior_score, activity_score = EXCLUDED.activity_score, tier = EXCLUDED.tier, calculated_at = NOW();
  RETURN v_overall;
END; $$;

-- Triggers
CREATE OR REPLACE FUNCTION trigger_recalculate_trust_score() RETURNS TRIGGER AS $$ BEGIN PERFORM calculate_trust_score(NEW.id); RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS recalculate_trust_on_verification ON profiles;
CREATE TRIGGER recalculate_trust_on_verification AFTER UPDATE OF verification_status ON profiles FOR EACH ROW WHEN (OLD.verification_status IS DISTINCT FROM NEW.verification_status) EXECUTE FUNCTION trigger_recalculate_trust_score();

CREATE OR REPLACE FUNCTION trigger_recalculate_trust_on_review() RETURNS TRIGGER AS $$ BEGIN PERFORM calculate_trust_score(NEW.target_user_id); RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS recalculate_trust_on_review ON reviews;
CREATE TRIGGER recalculate_trust_on_review AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_trust_on_review();

CREATE OR REPLACE FUNCTION trigger_audit_verification() RETURNS TRIGGER AS $$ BEGIN INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values) VALUES (COALESCE(NEW.user_id, OLD.user_id), 'verification_' || NEW.status, 'verification_requests', NEW.id::TEXT, CASE WHEN OLD IS NOT NULL THEN row_to_json(OLD)::JSONB ELSE NULL END, row_to_json(NEW)::JSONB); RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS audit_verification_changes ON verification_requests;
CREATE TRIGGER audit_verification_changes AFTER INSERT OR UPDATE ON verification_requests FOR EACH ROW EXECUTE FUNCTION trigger_audit_verification();

-- RLS: identity_documents
ALTER TABLE identity_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own identity documents" ON identity_documents;
CREATE POLICY "Users can view own identity documents" ON identity_documents FOR SELECT USING (auth.uid() = user_id OR is_admin());
DROP POLICY IF EXISTS "Users can insert own identity documents" ON identity_documents;
CREATE POLICY "Users can insert own identity documents" ON identity_documents FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());
DROP POLICY IF EXISTS "Admins can manage identity documents" ON identity_documents;
CREATE POLICY "Admins can manage identity documents" ON identity_documents FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- RLS: trust_scores
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view trust scores" ON trust_scores;
CREATE POLICY "Anyone can view trust scores" ON trust_scores FOR SELECT USING (true);
DROP POLICY IF EXISTS "System can manage trust scores" ON trust_scores;
CREATE POLICY "System can manage trust scores" ON trust_scores FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- RLS: verification_requests (updated)
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own verification requests" ON verification_requests;
CREATE POLICY "Users can view own verification requests" ON verification_requests FOR SELECT USING (auth.uid() = user_id OR is_admin());
DROP POLICY IF EXISTS "Users can submit verification requests" ON verification_requests;
CREATE POLICY "Users can submit verification requests" ON verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());
DROP POLICY IF EXISTS "Admins can manage verification requests" ON verification_requests;
CREATE POLICY "Admins can manage verification requests" ON verification_requests FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE verification_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE identity_documents;

-- Storage policy for verification documents
CREATE POLICY "Users can upload verification documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'verification-documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = 'verifications');

GRANT USAGE ON TYPE trust_tier TO authenticated, anon;
GRANT USAGE ON TYPE document_type TO authenticated, anon;
GRANT USAGE ON TYPE verification_decision TO authenticated, anon;
GRANT ALL ON identity_documents TO authenticated;
GRANT ALL ON trust_scores TO authenticated;
GRANT SELECT, INSERT ON verification_requests TO authenticated;

-- Materialized view for admin queue
DROP MATERIALIZED VIEW IF EXISTS admin_verification_queue;
CREATE MATERIALIZED VIEW admin_verification_queue AS
SELECT vr.id, vr.user_id, p.full_name, p.email, vr.document_type, vr.status, vr.fraud_score, vr.auto_fail_reason, vr.created_at AS submitted_at, COALESCE(ts.overall_score, 0) AS user_trust_score, ts.tier AS user_trust_tier
FROM verification_requests vr LEFT JOIN profiles p ON p.id = vr.user_id LEFT JOIN trust_scores ts ON ts.user_id = vr.user_id WHERE vr.status = 'pending'
ORDER BY vr.fraud_score DESC, vr.created_at ASC;
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_queue_id ON admin_verification_queue(id);

CREATE OR REPLACE FUNCTION refresh_admin_verification_queue() RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY admin_verification_queue; END; $$;

-- Scale indexes
CREATE INDEX IF NOT EXISTS idx_listings_boost_expiry ON boosted_listings(end_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender ON messages(conversation_id, sender_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_lookup ON conversations(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_views_aggregate ON listing_views(listing_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);


-- ============================================================
-- MIGRATION 007: Marketplace Trust System (part 2)
-- Note: reviews/transactions/audit_logs created in 001.
--       007 attempted CREATE TABLE IF NOT EXISTS (skipped).
--       Adding 007-specific columns via ALTER TABLE instead.
-- ============================================================
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'verified', 'rejected');
CREATE TYPE id_document_type AS ENUM ('nin', 'voters_card', 'drivers_license', 'passport');
CREATE TYPE transaction_status_type AS ENUM ('pending', 'completed', 'cancelled');

-- User verifications table
CREATE TABLE IF NOT EXISTS user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status kyc_status DEFAULT 'not_submitted',
  document_type id_document_type,
  document_number TEXT,
  document_url TEXT,
  kyc_provider TEXT,
  kyc_reference TEXT,
  face_match_score FLOAT,
  fraud_score FLOAT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_verifications_user ON user_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_status ON user_verifications(status);
CREATE INDEX IF NOT EXISTS idx_user_verifications_fraud ON user_verifications(fraud_score DESC) WHERE fraud_score IS NOT NULL;

-- Add 007-specific trust columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trust_score_old FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_rate_old FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_time_avg INTEGER,
  ADD COLUMN IF NOT EXISTS completed_transactions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_avg FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS account_age_days INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_trust_score_old ON profiles(trust_score_old DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles(rating_avg DESC);

-- Add 007-specific columns to reviews (reviewer_id/listing_id/target_user_id from 001; add seller_id/buyer_id)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES profiles(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES profiles(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS transaction_id UUID;

CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer ON reviews(buyer_id);

-- Add 007-specific columns to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES profiles(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES profiles(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS ad_id UUID REFERENCES listings(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status_new transaction_status_type DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ad ON transactions(ad_id);

-- Fraud signals table
CREATE TABLE IF NOT EXISTS fraud_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  signal_value TEXT,
  score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_signals_user ON fraud_signals(user_id);

-- Add metadata column to audit_logs (007 variant has it)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Trust score calculation (v2 from migration 007 - replaces v1 from 006)
CREATE OR REPLACE FUNCTION calculate_trust_score_v2(user_id UUID)
RETURNS FLOAT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_is_verified BOOLEAN; v_rating_avg FLOAT; v_completed_transactions INTEGER; v_response_rate FLOAT; v_account_age_days INTEGER; v_score FLOAT; v_profile RECORD;
BEGIN
  SELECT is_verified, COALESCE(rating_avg, 0), COALESCE(completed_transactions, 0), COALESCE(response_rate, 0), COALESCE(account_age_days, 0)
    INTO v_is_verified, v_rating_avg, v_completed_transactions, v_response_rate, v_account_age_days FROM profiles WHERE id = calculate_trust_score_v2.user_id;
  v_score := (CASE WHEN v_is_verified THEN 100 ELSE 0 END) * 0.4 + LEAST(v_rating_avg * 20, 100) * 0.25 + LEAST(v_completed_transactions::FLOAT, 100) * 0.2 + v_response_rate * 0.1 + LEAST(v_account_age_days::FLOAT, 100) * 0.05;
  v_score := ROUND(LEAST(v_score, 100)::numeric, 2)::FLOAT;
  UPDATE profiles SET trust_score_old = v_score WHERE id = calculate_trust_score_v2.user_id;
  RETURN v_score;
END; $$;

-- Triggers
CREATE OR REPLACE FUNCTION update_seller_stats_on_review() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles SET rating_avg = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE seller_id = NEW.seller_id), review_count = (SELECT COUNT(*) FROM reviews WHERE seller_id = NEW.seller_id) WHERE id = NEW.seller_id;
  PERFORM calculate_trust_score_v2(NEW.seller_id); RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_review_insert ON reviews;
CREATE TRIGGER on_review_insert AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION update_seller_stats_on_review();

CREATE OR REPLACE FUNCTION update_seller_transaction_count() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'completed' THEN UPDATE profiles SET completed_transactions = (SELECT COUNT(*) FROM transactions WHERE seller_id = NEW.seller_id AND status = 'completed') WHERE id = NEW.seller_id; PERFORM calculate_trust_score_v2(NEW.seller_id); END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_transaction_complete ON transactions;
CREATE TRIGGER on_transaction_complete AFTER INSERT OR UPDATE OF status ON transactions FOR EACH ROW EXECUTE FUNCTION update_seller_transaction_count();

CREATE OR REPLACE FUNCTION update_verification_trust() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles SET is_verified = (NEW.status = 'verified') WHERE id = NEW.user_id;
  PERFORM calculate_trust_score_v2(NEW.user_id); RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_verification_update ON user_verifications;
CREATE TRIGGER on_verification_update AFTER INSERT OR UPDATE OF status ON user_verifications FOR EACH ROW EXECUTE FUNCTION update_verification_trust();

CREATE OR REPLACE FUNCTION audit_verification_action() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values) VALUES (COALESCE(NEW.user_id, OLD.user_id),
    CASE WHEN TG_OP = 'INSERT' THEN 'verification_submitted' WHEN NEW.status = 'verified' THEN 'verification_approved' WHEN NEW.status = 'rejected' THEN 'verification_rejected' ELSE 'verification_updated' END,
    'user_verifications', COALESCE(NEW.id, OLD.id)::TEXT, CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::JSONB ELSE NULL END, row_to_json(NEW)::JSONB);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS audit_verification ON user_verifications;
CREATE TRIGGER audit_verification AFTER INSERT OR UPDATE ON user_verifications FOR EACH ROW EXECUTE FUNCTION audit_verification_action();

-- RLS: user_verifications
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own verification" ON user_verifications;
CREATE POLICY "Users can view own verification" ON user_verifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own verification" ON user_verifications;
CREATE POLICY "Users can insert own verification" ON user_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: reviews (update to include new columns)
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only buyers can create reviews" ON reviews;
CREATE POLICY "Only buyers can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- RLS: transactions (update)
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- RLS: fraud_signals
ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own fraud signals" ON fraud_signals;
CREATE POLICY "Users can view own fraud signals" ON fraud_signals FOR SELECT USING (auth.uid() = user_id);

-- Rank score function
CREATE OR REPLACE FUNCTION calculate_rank_score(p_trust_score FLOAT, p_rating FLOAT, p_response_rate FLOAT, p_freshness_days INTEGER)
RETURNS FLOAT LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN RETURN COALESCE(p_trust_score, 0) * 0.5 + COALESCE(p_rating, 0) * 20 * 0.2 + COALESCE(p_response_rate, 0) * 0.2 + GREATEST(0, 1.0 - COALESCE(p_freshness_days, 0) / 30.0) * 0.1; END; $$;

GRANT USAGE ON TYPE kyc_status TO authenticated, anon;
GRANT USAGE ON TYPE id_document_type TO authenticated, anon;
GRANT USAGE ON TYPE transaction_status_type TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON user_verifications TO authenticated;
GRANT SELECT, INSERT ON reviews TO authenticated;
GRANT SELECT, INSERT ON transactions TO authenticated;
GRANT SELECT ON fraud_signals TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE user_verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;


-- ============================================================
-- SEED DATA: Categories
-- ============================================================
INSERT INTO categories (name, slug, icon, sort_order, is_active) VALUES
  ('Electronics', 'electronics', 'Laptop', 1, true),
  ('Vehicles', 'vehicles', 'Car', 2, true),
  ('Property', 'property', 'Building', 3, true),
  ('Fashion', 'fashion', 'Shirt', 4, true),
  ('Home & Garden', 'home-garden', 'Home', 5, true),
  ('Sports & Fitness', 'sports-fitness', 'Zap', 6, true),
  ('Health & Beauty', 'health-beauty', 'Heart', 7, true),
  ('Books & Media', 'books-media', 'Book', 8, true),
  ('Services', 'services', 'Briefcase', 9, true),
  ('Jobs', 'jobs', 'UserPlus', 10, true),
  ('Pets', 'pets', 'PawPrint', 11, true),
  ('Food & Drinks', 'food-drinks', 'Coffee', 12, true),
  ('Education', 'education', 'GraduationCap', 13, true),
  ('Agriculture', 'agriculture', 'Sprout', 14, true),
  ('Business & Industrial', 'business-industrial', 'Factory', 15, true)
ON CONFLICT (slug) DO NOTHING;
