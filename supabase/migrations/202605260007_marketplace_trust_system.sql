-- ====================================================================
-- MARKETPLACE TRUST + VERIFICATION SYSTEM
-- Single identity verification, fraud detection, trust scoring
-- ====================================================================

-- ============================
-- ENUMS
-- ============================
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'verified', 'rejected');
CREATE TYPE id_document_type AS ENUM ('nin', 'voters_card', 'drivers_license', 'passport');
CREATE TYPE transaction_status_type AS ENUM ('pending', 'completed', 'cancelled');

-- ============================
-- 1. USER VERIFICATIONS TABLE (Single source of truth)
-- ============================
CREATE TABLE user_verifications (
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

CREATE INDEX idx_user_verifications_user ON user_verifications(user_id);
CREATE INDEX idx_user_verifications_status ON user_verifications(status);
CREATE INDEX idx_user_verifications_fraud ON user_verifications(fraud_score DESC) WHERE fraud_score IS NOT NULL;

-- ============================
-- 2. PROFILES — Add trust columns
-- ============================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trust_score FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_rate FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_time_avg INTEGER,
  ADD COLUMN IF NOT EXISTS completed_transactions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_avg FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS account_age_days INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_trust_score ON profiles(trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles(rating_avg DESC);

-- ============================
-- 3. REVIEWS TABLE (Spec: seller_id, buyer_id, transaction_id)
-- ============================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  transaction_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer ON reviews(buyer_id);

-- ============================
-- 4. TRANSACTIONS TABLE (Spec: buyer_id, seller_id, ad_id)
-- ============================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  ad_id UUID REFERENCES listings(id),
  status transaction_status_type DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ad ON transactions(ad_id);

-- ============================
-- 5. FRAUD SIGNALS TABLE
-- ============================
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

-- ============================
-- 6. AUDIT LOG (verification actions)
-- ============================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================
-- 7. TRUST SCORE CALCULATION FUNCTION
-- Formula:
--   Identity Verification x 0.4
--   + Rating Score x 0.25
--   + Transaction Volume x 0.2
--   + Response Rate x 0.1
--   + Account Age x 0.05
-- ============================
CREATE OR REPLACE FUNCTION calculate_trust_score(user_id UUID)
RETURNS FLOAT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_verified BOOLEAN;
  v_rating_avg FLOAT;
  v_completed_transactions INTEGER;
  v_response_rate FLOAT;
  v_account_age_days INTEGER;
  v_score FLOAT;
  v_profile RECORD;
BEGIN
  SELECT
    is_verified,
    COALESCE(rating_avg, 0),
    COALESCE(completed_transactions, 0),
    COALESCE(response_rate, 0),
    COALESCE(account_age_days, 0)
  INTO v_is_verified, v_rating_avg, v_completed_transactions, v_response_rate, v_account_age_days
  FROM profiles
  WHERE id = calculate_trust_score.user_id;

  v_score :=
    (CASE WHEN v_is_verified THEN 100 ELSE 0 END) * 0.4
    + LEAST(v_rating_avg * 20, 100) * 0.25
    + LEAST(v_completed_transactions::FLOAT, 100) * 0.2
    + v_response_rate * 0.1
    + LEAST(v_account_age_days::FLOAT, 100) * 0.05;

  v_score := ROUND(LEAST(v_score, 100)::numeric, 2)::FLOAT;

  UPDATE profiles
  SET trust_score = v_score
  WHERE id = calculate_trust_score.user_id;

  RETURN v_score;
END;
$$;

-- ============================
-- 8. TRIGGERS
-- ============================

-- 8a. Update profile stats when review is inserted
CREATE OR REPLACE FUNCTION update_seller_stats_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET
    rating_avg = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE seller_id = NEW.seller_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE seller_id = NEW.seller_id)
  WHERE id = NEW.seller_id;

  PERFORM calculate_trust_score(NEW.seller_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_insert ON reviews;
CREATE TRIGGER on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_stats_on_review();

-- 8b. Update profile transaction count
CREATE OR REPLACE FUNCTION update_seller_transaction_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE profiles
    SET completed_transactions = (SELECT COUNT(*) FROM transactions WHERE seller_id = NEW.seller_id AND status = 'completed')
    WHERE id = NEW.seller_id;

    PERFORM calculate_trust_score(NEW.seller_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_transaction_complete ON transactions;
CREATE TRIGGER on_transaction_complete
  AFTER INSERT OR UPDATE OF status ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_transaction_count();

-- 8c. Update verification status triggers trust recalculation
CREATE OR REPLACE FUNCTION update_verification_trust()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET is_verified = (NEW.status = 'verified')
  WHERE id = NEW.user_id;

  PERFORM calculate_trust_score(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_verification_update ON user_verifications;
CREATE TRIGGER on_verification_update
  AFTER INSERT OR UPDATE OF status ON user_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_trust();

-- 8d. Audit log for verification actions
CREATE OR REPLACE FUNCTION audit_verification_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    CASE
      WHEN TG_OP = 'INSERT' THEN 'verification_submitted'
      WHEN NEW.status = 'verified' THEN 'verification_approved'
      WHEN NEW.status = 'rejected' THEN 'verification_rejected'
      ELSE 'verification_updated'
    END,
    'user_verifications',
    COALESCE(NEW.id, OLD.id)::TEXT,
    CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::JSONB ELSE NULL END,
    row_to_json(NEW)::JSONB
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_verification ON user_verifications;
CREATE TRIGGER audit_verification
  AFTER INSERT OR UPDATE ON user_verifications
  FOR EACH ROW
  EXECUTE FUNCTION audit_verification_action();

-- ============================
-- 9. ROW LEVEL SECURITY
-- ============================

-- 9a. user_verifications
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification"
  ON user_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification"
  ON user_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 9b. reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Only buyers can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- 9c. transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 9d. fraud_signals
ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fraud signals"
  ON fraud_signals FOR SELECT
  USING (auth.uid() = user_id);

-- ============================
-- 10. FUNCTIONS — Ranking helper
-- ============================
CREATE OR REPLACE FUNCTION calculate_rank_score(
  p_trust_score FLOAT,
  p_rating FLOAT,
  p_response_rate FLOAT,
  p_freshness_days INTEGER
)
RETURNS FLOAT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN (
    COALESCE(p_trust_score, 0) * 0.5
    + COALESCE(p_rating, 0) * 20 * 0.2
    + COALESCE(p_response_rate, 0) * 0.2
    + GREATEST(0, 1.0 - COALESCE(p_freshness_days, 0) / 30.0) * 0.1
  );
END;
$$;

-- ============================
-- 11. GRANTS
-- ============================
GRANT USAGE ON TYPE kyc_status TO authenticated, anon;
GRANT USAGE ON TYPE id_document_type TO authenticated, anon;
GRANT USAGE ON TYPE transaction_status_type TO authenticated, anon;

GRANT SELECT, INSERT, UPDATE ON user_verifications TO authenticated;
GRANT SELECT, INSERT ON reviews TO authenticated;
GRANT SELECT, INSERT ON transactions TO authenticated;
GRANT SELECT ON fraud_signals TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;

-- ============================
-- 12. REALTIME
-- ============================
ALTER PUBLICATION supabase_realtime ADD TABLE user_verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
