-- iList Marketplace - Security Hardening Migration
-- Run after 001_initial_schema.sql and 002_functions.sql

-- ============================
-- 1. PROPER ROLE SYSTEM (C-1)
-- ============================
CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS supabase_user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'));
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================
-- 2. PRIVATE VERIFICATION BUCKET (C-2)
-- ============================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================
-- 3. FIX RLS POLICIES
-- ============================

-- 3a. Profiles: admins can update any profile (for verification management)
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- 3b. Categories: admin role check only
DROP POLICY IF EXISTS "Only admins can modify categories" ON categories;
CREATE POLICY "Only admins can modify categories"
  ON categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3c. Subcategories: admin role check only
DROP POLICY IF EXISTS "Only admins can modify subcategories" ON subcategories;
CREATE POLICY "Only admins can modify subcategories"
  ON subcategories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3d. Notifications: restrict INSERT to own user_id or admin (C-3)
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

-- 3e. Boost Plans: admin role check
DROP POLICY IF EXISTS "Admins can manage boost plans" ON boost_plans;
CREATE POLICY "Admins can manage boost plans"
  ON boost_plans FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3f. Boosted Listings: admin can manage any
DROP POLICY IF EXISTS "Users can manage their boosts" ON boosted_listings;
CREATE POLICY "Users can manage their boosts"
  ON boosted_listings FOR UPDATE
  USING (auth.uid() = user_id OR is_admin());

-- 3g. Reports: admin role check instead of is_verified
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id OR is_admin());

DROP POLICY IF EXISTS "Admins can manage reports" ON reports;
CREATE POLICY "Admins can manage reports"
  ON reports FOR UPDATE
  USING (is_admin());

-- 3h. Transactions: restrict INSERT to own user_id or admin (C-3)
DROP POLICY IF EXISTS "System can create transactions" ON transactions;
CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

-- 3i. Verification Requests: admin role check
DROP POLICY IF EXISTS "Admins can manage verification requests" ON verification_requests;
CREATE POLICY "Admins can manage verification requests"
  ON verification_requests FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3j. Audit Logs: admin-only insert (C-3)
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "Only admins can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());

-- 3k. Messages: verify conversation participation (C-4)
DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND auth.uid() IN (
      SELECT buyer_id FROM conversations WHERE id = conversation_id
      UNION
      SELECT seller_id FROM conversations WHERE id = conversation_id
    )
  );

-- ============================
-- 4. STORAGE SECURITY (H-1)
-- ============================

-- 4a. Listing images: verify folder ownership
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Users can upload to their own listing paths"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'listings'
  );

DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
CREATE POLICY "Users can update listing images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'listings'
  );

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete listing images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'listings'
  );

-- 4b. Verification documents: owner + admin access
CREATE POLICY "Users can upload own verification documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'verifications'
    AND SPLIT_PART(name, '/', 2) = auth.uid()::TEXT
  );

CREATE POLICY "Users can view own verification documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-documents'
    AND (
      SPLIT_PART(name, '/', 2) = auth.uid()::TEXT
      OR is_admin()
    )
  );

CREATE POLICY "Admins can manage verification documents"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'verification-documents'
    AND is_admin()
  );

-- ============================
-- 5. DATABASE INTEGRITY (M-6, M-7)
-- ============================

-- 5a. Reviews: unique constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS unique_review_per_listing;
ALTER TABLE reviews ADD CONSTRAINT unique_review_per_listing UNIQUE (reviewer_id, listing_id);

-- 5b. Boosted Listings: status enum
CREATE TYPE boost_status AS ENUM ('active', 'expired', 'cancelled');
ALTER TABLE boosted_listings ADD COLUMN IF NOT EXISTS status_new boost_status;

UPDATE boosted_listings SET status_new = 
  CASE 
    WHEN status = 'active' THEN 'active'::boost_status
    WHEN status = 'expired' THEN 'expired'::boost_status
    ELSE 'cancelled'::boost_status
  END;

ALTER TABLE boosted_listings DROP COLUMN IF EXISTS status;
ALTER TABLE boosted_listings RENAME COLUMN status_new TO status;
ALTER TABLE boosted_listings ALTER COLUMN status SET DEFAULT 'active'::boost_status;
ALTER TABLE boosted_listings ALTER COLUMN status SET NOT NULL;

-- 5c. Missing indexes
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read, sender_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_reviews_target_user ON reviews(target_user_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(buyer_id, seller_id, listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_date ON listing_views(listing_id, created_at);

-- ============================
-- 6. ADMIN ANALYTICS FUNCTION (performance)
-- ============================
CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
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
END;
$$;

-- ============================
-- 7. AVATAR BUCKET (H-3)
-- ============================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND SPLIT_PART(name, '/', 1) = auth.uid()::TEXT
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND SPLIT_PART(name, '/', 1) = auth.uid()::TEXT
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND SPLIT_PART(name, '/', 1) = auth.uid()::TEXT
  );

-- ============================
-- 8. GRANT USAGE FOR NEW ENUMS
-- ============================
GRANT USAGE ON TYPE user_role TO authenticated, anon;
GRANT USAGE ON TYPE boost_status TO authenticated, anon;
