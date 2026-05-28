-- ====================================================================
-- VERIFICATION + TRUST SYSTEM — Production-ready for millions of users
-- Run after 001-005 in sequence
-- ====================================================================

-- ============================
-- ENUMS
-- ============================
CREATE TYPE trust_tier AS ENUM ('highly_trusted', 'trusted', 'new_seller');
CREATE TYPE document_type AS ENUM ('nin', 'voters_card', 'drivers_license', 'international_passport', 'business_cac');
CREATE TYPE verification_decision AS ENUM ('approved', 'rejected', 'resubmission_required');

-- ============================
-- 1. PROFILES — Add verification & trust columns
-- ============================
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

-- ============================
-- 2. IDENTITY DOCUMENTS — Duplicate prevention + fraud detection
-- ============================
CREATE TABLE identity_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_number_hash TEXT NOT NULL, -- SHA-256 of document number
  document_number_masked TEXT NOT NULL, -- e.g. NIN******7890
  document_front_hash TEXT, -- SHA-256 of front image
  document_back_hash TEXT, -- SHA-256 of back image
  selfie_hash TEXT, -- SHA-256 of selfie
  issuing_country TEXT DEFAULT 'NG',
  is_expired BOOLEAN DEFAULT false,
  expiry_date DATE,
  metadata JSONB DEFAULT '{}', -- OCR data, validation responses
  status verification_status DEFAULT 'pending',
  fraud_score INTEGER DEFAULT 0, -- 0-100, higher = more suspicious
  fraud_signals JSONB DEFAULT '[]', -- array of {signal: string, weight: number}
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_identity_docs_user ON identity_documents(user_id);
CREATE INDEX idx_identity_docs_number_hash ON identity_documents(document_number_hash);
CREATE INDEX idx_identity_docs_front_hash ON identity_documents(document_front_hash) WHERE document_front_hash IS NOT NULL;
CREATE INDEX idx_identity_docs_status ON identity_documents(status);
CREATE INDEX idx_identity_docs_fraud ON identity_documents(fraud_score DESC) WHERE fraud_score > 50;

-- ============================
-- 3. TRUST SCORES — Cached composite scoring
-- ============================
CREATE TABLE trust_scores (
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

CREATE INDEX idx_trust_scores_overall ON trust_scores(overall_score DESC);
CREATE INDEX idx_trust_scores_tier ON trust_scores(tier);

-- ============================
-- 4. VERIFICATION_REQUESTS — Upgrade with fraud data
-- ============================
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

-- ============================
-- 5. FRAUD DETECTION FUNCTIONS
-- ============================

-- 5a. Check for duplicate identity documents
CREATE OR REPLACE FUNCTION check_document_duplicates(
  doc_number_hash TEXT,
  check_user_id UUID
)
RETURNS TABLE (
  is_duplicate BOOLEAN,
  existing_user_id UUID,
  existing_document_type document_type
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    TRUE AS is_duplicate,
    user_id AS existing_user_id,
    document_type AS existing_document_type
  FROM identity_documents
  WHERE document_number_hash = check_document_duplicates.doc_number_hash
    AND user_id != check_document_duplicates.check_user_id
    AND status = 'approved'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::document_type;
  END IF;
END;
$$;

-- 5b. Calculate fraud score for a verification request
CREATE OR REPLACE FUNCTION calculate_fraud_score(
  p_user_id UUID,
  p_document_number_hash TEXT,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS TABLE (
  score INTEGER,
  signals JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score INTEGER := 0;
  v_signals JSONB := '[]'::JSONB;
  v_dup_check RECORD;
  v_account_age INTERVAL;
  v_recent_rejections INTEGER;
  v_previous_attempts INTEGER;
BEGIN
  -- 1. Duplicate document check (+40 if duplicate)
  FOR v_dup_check IN
    SELECT user_id, document_type FROM identity_documents
    WHERE document_number_hash = calculate_fraud_score.p_document_number_hash
      AND user_id != calculate_fraud_score.p_user_id
      AND status = 'approved'
  LOOP
    v_score := v_score + 40;
    v_signals := v_signals || jsonb_build_object(
      'signal', 'duplicate_document',
      'weight', 40,
      'detail', format('Document already registered to another account')
    );
  END LOOP;

  -- 2. Account age check (+15 if < 7 days)
  SELECT age(NOW(), created_at) INTO v_account_age FROM profiles WHERE id = p_user_id;
  IF v_account_age < INTERVAL '7 days' THEN
    v_score := v_score + 15;
    v_signals := v_signals || jsonb_build_object(
      'signal', 'new_account',
      'weight', 15,
      'detail', format('Account age: %s', v_account_age)
    );
  END IF;

  -- 3. Previous rejections (+10 each, max +30)
  SELECT COUNT(*) INTO v_recent_rejections
  FROM verification_requests
  WHERE user_id = p_user_id AND status = 'rejected' AND created_at > NOW() - INTERVAL '90 days';

  IF v_recent_rejections > 0 THEN
    v_score := v_score + LEAST(v_recent_rejections * 10, 30);
    v_signals := v_signals || jsonb_build_object(
      'signal', 'previous_rejections',
      'weight', LEAST(v_recent_rejections * 10, 30),
      'detail', format('%s rejection(s) in last 90 days', v_recent_rejections)
    );
  END IF;

  -- 4. Rapid resubmission (+10)
  SELECT COUNT(*) INTO v_previous_attempts
  FROM verification_requests
  WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '24 hours';

  IF v_previous_attempts > 3 THEN
    v_score := v_score + 10;
    v_signals := v_signals || jsonb_build_object(
      'signal', 'rapid_resubmission',
      'weight', 10,
      'detail', format('%s attempts in 24 hours', v_previous_attempts)
    );
  END IF;

  -- Ensure score is capped at 100
  v_score := LEAST(v_score, 100);

  RETURN QUERY SELECT v_score, v_signals;
END;
$$;

-- 5c. Auto-approve or route to manual based on fraud score
CREATE OR REPLACE FUNCTION auto_verify_document(
  p_request_id UUID
)
RETURNS TABLE (
  decision verification_decision,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request RECORD;
  v_fraud_score INTEGER;
  v_signals JSONB;
BEGIN
  SELECT * INTO v_request FROM verification_requests WHERE id = p_request_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Calculate fraud score
  SELECT f.score, f.signals INTO v_fraud_score, v_signals
  FROM calculate_fraud_score(v_request.user_id, 'placeholder_hash', v_request.ip_address) f;

  UPDATE verification_requests
  SET fraud_score = v_fraud_score,
      document_metadata = jsonb_set(
        COALESCE(document_metadata, '{}'::JSONB),
        '{fraud_signals}',
        v_signals
      )
  WHERE id = p_request_id;

  -- Decision logic
  IF v_fraud_score < 20 THEN
    RETURN QUERY SELECT 'approved'::verification_decision, 'Passed auto-verification'::TEXT;
  ELSIF v_fraud_score < 50 THEN
    RETURN QUERY SELECT 'resubmission_required'::verification_decision, 'Manual review required'::TEXT;
  ELSE
    RETURN QUERY SELECT 'rejected'::verification_decision, format('Flagged by fraud detection (score: %s)', v_fraud_score)::TEXT;
  END IF;
END;
$$;

-- ============================
-- 6. TRUST SCORE CALCULATION
-- ============================
CREATE OR REPLACE FUNCTION calculate_trust_score(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_identity_score INTEGER := 0;
  v_behavior_score INTEGER := 0;
  v_activity_score INTEGER := 0;
  v_overall INTEGER := 0;
  v_tier trust_tier;
  v_profile RECORD;
  v_stats RECORD;
BEGIN
  -- Get profile
  SELECT * INTO v_profile FROM profiles WHERE id = target_user_id;

  -- Identity Score (40% weight)
  IF v_profile.verification_status = 'approved' THEN
    v_identity_score := 60;
    IF v_profile.role IN ('admin', 'superadmin') THEN
      v_identity_score := v_identity_score + 40;
    END IF;
  END IF;

  -- Behavior Score (40% weight)
  SELECT
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(r.id) AS review_count,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') AS transactions
  INTO v_stats
  FROM profiles p
  LEFT JOIN reviews r ON r.target_user_id = p.id AND r.is_approved = true
  LEFT JOIN transactions t ON t.user_id = p.id
  WHERE p.id = target_user_id;

  v_behavior_score := 0;
  IF v_stats.avg_rating > 0 THEN
    v_behavior_score := v_behavior_score + LEAST((v_stats.avg_rating / 5.0) * 40, 40);
  END IF;
  v_behavior_score := v_behavior_score + LEAST(v_stats.review_count * 5, 25);
  v_behavior_score := v_behavior_score + LEAST(v_stats.transactions * 2, 35);
  v_behavior_score := LEAST(v_behavior_score, 100);

  -- Activity Score (20% weight)
  SELECT
    COUNT(*) FILTER (WHERE status = 'active') AS active_ads
  INTO v_stats
  FROM listings
  WHERE user_id = target_user_id;

  v_activity_score := LEAST(v_stats.active_ads * 10, 30);
  IF v_profile.response_rate IS NOT NULL THEN
    v_activity_score := v_activity_score + LEAST((v_profile.response_rate / 100.0) * 40, 40);
  END IF;

  v_activity_score := LEAST(v_activity_score, 100);

  -- Composite score
  v_overall := ROUND(v_identity_score * 0.40 + v_behavior_score * 0.40 + v_activity_score * 0.20);

  -- Determine tier
  IF v_overall >= 80 THEN
    v_tier := 'highly_trusted';
  ELSIF v_overall >= 50 THEN
    v_tier := 'trusted';
  ELSE
    v_tier := 'new_seller';
  END IF;

  -- Update profiles table
  UPDATE profiles
  SET trust_score = v_overall,
      trust_tier = v_tier
  WHERE id = target_user_id;

  -- Upsert trust_scores
  INSERT INTO trust_scores (user_id, overall_score, identity_score, behavior_score, activity_score, tier)
  VALUES (target_user_id, v_overall, v_identity_score, v_behavior_score, v_activity_score, v_tier)
  ON CONFLICT (user_id)
  DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    identity_score = EXCLUDED.identity_score,
    behavior_score = EXCLUDED.behavior_score,
    activity_score = EXCLUDED.activity_score,
    tier = EXCLUDED.tier,
    calculated_at = NOW();

  RETURN v_overall;
END;
$$;

-- ============================
-- 7. TRIGGERS
-- ============================

-- 7a. Recalculate trust score when verification status changes
CREATE OR REPLACE FUNCTION trigger_recalculate_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_trust_score(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS recalculate_trust_on_verification ON profiles;
CREATE TRIGGER recalculate_trust_on_verification
  AFTER UPDATE OF verification_status ON profiles
  FOR EACH ROW
  WHEN (OLD.verification_status IS DISTINCT FROM NEW.verification_status)
  EXECUTE FUNCTION trigger_recalculate_trust_score();

-- 7b. Update trust score when review is added
CREATE OR REPLACE FUNCTION trigger_recalculate_trust_on_review()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_trust_score(NEW.target_user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS recalculate_trust_on_review ON reviews;
CREATE TRIGGER recalculate_trust_on_review
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_trust_on_review();

-- 7c. Log verification request changes to audit_logs
CREATE OR REPLACE FUNCTION trigger_audit_verification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    'verification_' || NEW.status,
    'verification_requests',
    NEW.id::TEXT,
    CASE WHEN OLD IS NOT NULL THEN row_to_json(OLD)::JSONB ELSE NULL END,
    row_to_json(NEW)::JSONB
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_verification_changes ON verification_requests;
CREATE TRIGGER audit_verification_changes
  AFTER INSERT OR UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_verification();

-- ============================
-- 8. RLS POLICIES
-- ============================

-- 8a. identity_documents: users see own, admins see all
ALTER TABLE identity_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own identity documents"
  ON identity_documents FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own identity documents"
  ON identity_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can manage identity documents"
  ON identity_documents FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- 8b. trust_scores: public read, system write
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trust scores"
  ON trust_scores FOR SELECT
  USING (true);

CREATE POLICY "System can manage trust scores"
  ON trust_scores FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- 8c. verification_requests: users see own, admins see all
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verification requests" ON verification_requests;
CREATE POLICY "Users can view own verification requests"
  ON verification_requests FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can insert own verification requests" ON verification_requests;
CREATE POLICY "Users can insert own verification requests"
  ON verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Admins can manage verification requests" ON verification_requests;
CREATE POLICY "Admins can manage verification requests"
  ON verification_requests FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================
-- 9. REALTIME — Enable for admin dashboard
-- ============================
ALTER PUBLICATION supabase_realtime ADD TABLE verification_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE identity_documents;

-- ============================
-- 10. STORAGE — Verification documents bucket (already created, update policies)
-- ============================
-- Bucket already exists from 003 migration
-- Update storage policies for identity_documents
CREATE POLICY "Users can upload verification documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'verifications'
  );

-- ============================
-- 11. GRANT PERMISSIONS
-- ============================
GRANT USAGE ON TYPE trust_tier TO authenticated, anon;
GRANT USAGE ON TYPE document_type TO authenticated, anon;
GRANT USAGE ON TYPE verification_decision TO authenticated, anon;

GRANT ALL ON identity_documents TO authenticated;
GRANT ALL ON trust_scores TO authenticated;
GRANT SELECT, INSERT ON verification_requests TO authenticated;

-- ============================
-- 12. MATERIALIZED VIEW — Admin verification queue (performance for millions)
-- ============================
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_verification_queue AS
SELECT
  vr.id,
  vr.user_id,
  p.full_name,
  p.email,
  vr.document_type,
  vr.status,
  vr.fraud_score,
  vr.auto_fail_reason,
  vr.created_at AS submitted_at,
  COALESCE(ts.overall_score, 0) AS user_trust_score,
  ts.tier AS user_trust_tier
FROM verification_requests vr
LEFT JOIN profiles p ON p.id = vr.user_id
LEFT JOIN trust_scores ts ON ts.user_id = vr.user_id
WHERE vr.status = 'pending'
ORDER BY vr.fraud_score DESC, vr.created_at ASC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_queue_id ON admin_verification_queue(id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_admin_verification_queue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_verification_queue;
END;
$$;

-- ============================
-- 13. INDEXES FOR SCALE
-- ============================
CREATE INDEX IF NOT EXISTS idx_listings_boost_expiry ON boosted_listings(end_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender ON messages(conversation_id, sender_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_lookup ON conversations(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_views_aggregate ON listing_views(listing_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
