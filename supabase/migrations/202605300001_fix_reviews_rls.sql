-- ============================
-- Fix Reviews RLS Policies
-- ============================
-- The previous RLS policy "Only buyers can create reviews" only allows
-- auth.uid() = buyer_id. But the frontend client-side code inserts with
-- reviewer_id (not buyer_id). This fix allows both.
-- ============================

DROP POLICY IF EXISTS "Only buyers can create reviews" ON reviews;
CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
CREATE POLICY "Anyone can read approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true OR auth.uid() = reviewer_id OR auth.uid() = buyer_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id OR auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = reviewer_id OR auth.uid() = buyer_id);
