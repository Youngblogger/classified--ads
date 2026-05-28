-- iList Marketplace - Rollback: Security Policies Migration
-- Reverts 202605260003_security_policies.sql
-- WARNING: Drops the role column and reverts to is_verified-based checks.
--          Only run if no data depends on the new role system.

-- ============================
-- REVERT: 8. GRANT USAGE FOR ENUMS
-- ============================
REVOKE USAGE ON TYPE user_role FROM authenticated, anon;
REVOKE USAGE ON TYPE boost_status FROM authenticated, anon;

-- ============================
-- REVERT: 7. AVATAR BUCKET POLICIES
-- ============================
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- ============================
-- REVERT: 6. ADMIN ANALYTICS FUNCTION
-- ============================
DROP FUNCTION IF EXISTS get_admin_analytics();

-- ============================
-- REVERT: 5c. INDEXES (optional removal)
-- ============================
DROP INDEX IF EXISTS idx_listing_views_listing_date;
DROP INDEX IF EXISTS idx_conversations_participants;
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_reviews_listing;
DROP INDEX IF EXISTS idx_reviews_target_user;
DROP INDEX IF EXISTS idx_messages_unread;

-- ============================
-- REVERT: 5b. BOOST STATUS ENUM
-- ============================
ALTER TABLE boosted_listings ALTER COLUMN status DROP DEFAULT;
ALTER TABLE boosted_listings ALTER COLUMN status TYPE TEXT USING status::TEXT;
ALTER TABLE boosted_listings ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE boosted_listings ALTER COLUMN status SET NOT NULL;
DROP TYPE IF EXISTS boost_status;

-- ============================
-- REVERT: 5a. REVIEWS UNIQUE CONSTRAINT
-- ============================
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS unique_review_per_listing;

-- ============================
-- REVERT: 4b. VERIFICATION DOCUMENT POLICIES
-- ============================
DROP POLICY IF EXISTS "Admins can manage verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own verification documents" ON storage.objects;

-- ============================
-- REVERT: 4a. LISTING IMAGE STORAGE POLICIES (restore originals)
-- ============================
DROP POLICY IF EXISTS "Users can delete listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their own listing paths" ON storage.objects;

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
-- REVERT: 3k. MESSAGES INSERT POLICY
-- ============================
DROP POLICY IF EXISTS "Participants can send messages" ON messages;

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ============================
-- REVERT: 3j. AUDIT LOGS POLICIES
-- ============================
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Only admins can insert audit logs" ON audit_logs;

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- ============================
-- REVERT: 3i. VERIFICATION REQUESTS POLICIES
-- ============================
DROP POLICY IF EXISTS "Admins can manage verification requests" ON verification_requests;

CREATE POLICY "Admins can manage verification requests"
  ON verification_requests FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- ============================
-- REVERT: 3h. TRANSACTIONS POLICIES
-- ============================
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;

CREATE POLICY "System can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================
-- REVERT: 3g. REPORTS POLICIES
-- ============================
DROP POLICY IF EXISTS "Admins can manage reports" ON reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id OR auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

CREATE POLICY "Admins can manage reports"
  ON reports FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- ============================
-- REVERT: 3f. BOOSTED LISTINGS POLICIES
-- ============================
DROP POLICY IF EXISTS "Users can manage their boosts" ON boosted_listings;

CREATE POLICY "Users can manage their boosts"
  ON boosted_listings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================
-- REVERT: 3e. BOOST PLANS POLICIES
-- ============================
DROP POLICY IF EXISTS "Admins can manage boost plans" ON boost_plans;

CREATE POLICY "Admins can manage boost plans"
  ON boost_plans FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- ============================
-- REVERT: 3d. NOTIFICATIONS POLICIES
-- ============================
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================
-- REVERT: 3c. SUBCATEGORIES POLICIES
-- ============================
DROP POLICY IF EXISTS "Only admins can modify subcategories" ON subcategories;

CREATE POLICY "Only admins can modify subcategories"
  ON subcategories FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_verified = true));

-- ============================
-- REVERT: 3b. CATEGORIES POLICIES
-- ============================
DROP POLICY IF EXISTS "Only admins can modify categories" ON categories;

CREATE POLICY "Only admins can modify categories"
  ON categories FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE verification_status = 'approved' AND is_verified = true))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE verification_status = 'approved' AND is_verified = true));

-- ============================
-- REVERT: 3a. PROFILE UPDATE POLICY
-- ============================
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================
-- REVERT: 1. ROLE SYSTEM
-- ============================
DROP FUNCTION IF EXISTS is_superadmin();
DROP FUNCTION IF EXISTS is_admin();

DROP INDEX IF EXISTS idx_profiles_role;
ALTER TABLE profiles DROP COLUMN IF EXISTS supabase_user_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

DROP TYPE IF EXISTS user_role;

-- ============================
-- REVERT: 2. PRIVATE VERIFICATION BUCKET
-- ============================
-- Bucket deletion is manual via Dashboard to prevent data loss:
-- DELETE FROM storage.buckets WHERE id = 'verification-documents';
-- Uncomment the line above after confirming no documents remain.
