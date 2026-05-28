-- iList Marketplace - Post-Deployment Verification Script
-- Run after migrations to confirm system health
-- Returns JSON with pass/fail per check

DO $$
DECLARE
  checks JSONB;
  result JSONB;
  all_passed BOOLEAN := true;
BEGIN
  checks := '[]'::JSONB;

  -- 1. TABLE EXISTENCE CHECK
  BEGIN
    WITH expected_tables AS (
      SELECT unnest(ARRAY[
        'profiles', 'categories', 'subcategories', 'listings',
        'listing_images', 'listing_favorites', 'listing_views',
        'conversations', 'messages', 'notifications',
        'boost_plans', 'boosted_listings', 'reports',
        'reviews', 'transactions', 'verification_requests', 'audit_logs'
      ]) AS tbl
    )
    SELECT jsonb_agg(
      jsonb_build_object('table', tbl, 'exists', EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl
      ))
    ) INTO checks FROM expected_tables;

    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(checks) AS c
      WHERE (c->>'exists')::boolean = false
    ) THEN
      all_passed := false;
      checks := checks || jsonb_build_object('check', 'table_existence', 'passed', false, 'details', checks);
    ELSE
      checks := jsonb_build_object('check', 'table_existence', 'passed', true, 'details', checks);
    END IF;
  END;

  -- 2. RLS ENABLED CHECK
  BEGIN
    WITH rls_status AS (
      SELECT relname AS table_name, relrowsecurity AS rls_enabled
      FROM pg_class
      WHERE relnamespace = 'public'::regnamespace
        AND relkind = 'r'
        AND relname NOT IN ('schema_migrations', 'seed_log')
    )
    SELECT jsonb_build_object(
      'check', 'rls_enabled',
      'passed', bool_and(rls_enabled),
      'details', jsonb_agg(jsonb_build_object('table', table_name, 'rls_enabled', rls_enabled))
    ) INTO checks FROM rls_status;
  END;

  IF NOT (checks->>'passed')::boolean THEN all_passed := false; END IF;

  -- 3. FUNCTION EXISTENCE CHECK
  BEGIN
    WITH expected_functions AS (
      SELECT unnest(ARRAY[
        'is_admin', 'is_superadmin', 'get_admin_analytics',
        'search_listings', 'get_user_stats', 'cleanup_expired_boosts',
        'increment_listing_views', 'increment_favorites_count',
        'decrement_favorites_count', 'handle_new_user',
        'generate_listing_slug', 'update_updated_at_column'
      ]) AS fn
    )
    SELECT jsonb_build_object(
      'check', 'functions_exist',
      'passed', bool_and(exists),
      'details', jsonb_agg(jsonb_build_object('function', fn, 'exists', exists))
    ) INTO checks
    FROM (
      SELECT fn, EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.proname = fn
      ) AS exists
      FROM expected_functions
    ) sub;
  END;

  IF NOT (checks->>'passed')::boolean THEN all_passed := false; END IF;

  -- 4. TRIGGER EXISTENCE CHECK
  BEGIN
    WITH expected_triggers AS (
      SELECT unnest(ARRAY[
        'on_auth_user_created', 'set_listing_slug',
        'update_profiles_updated_at', 'update_listings_updated_at',
        'update_conversations_updated_at', 'update_messages_updated_at',
        'update_categories_updated_at', 'update_subcategories_updated_at',
        'update_boost_plans_updated_at', 'update_boosted_listings_updated_at',
        'update_reports_updated_at', 'update_reviews_updated_at',
        'update_transactions_updated_at', 'update_verification_requests_updated_at'
      ]) AS tg
    )
    SELECT jsonb_build_object(
      'check', 'triggers_exist',
      'passed', bool_and(exists),
      'details', jsonb_agg(jsonb_build_object('trigger', tg, 'exists', exists))
    ) INTO checks
    FROM (
      SELECT tg, EXISTS (
        SELECT 1 FROM information_schema.triggers WHERE trigger_name = tg
      ) AS exists
      FROM expected_triggers
    ) sub;
  END;

  IF NOT (checks->>'passed')::boolean THEN all_passed := false; END IF;

  -- 5. STORAGE BUCKET CHECK
  BEGIN
    WITH expected_buckets AS (
      SELECT unnest(ARRAY['listing-images', 'verification-documents', 'avatars']) AS bucket
    )
    SELECT jsonb_build_object(
      'check', 'storage_buckets',
      'passed', bool_and(exists),
      'details', jsonb_agg(jsonb_build_object('bucket', bucket, 'exists', exists))
    ) INTO checks
    FROM (
      SELECT bucket, EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = bucket
      ) AS exists
      FROM expected_buckets
    ) sub;
  END;

  IF NOT (checks->>'passed')::boolean THEN all_passed := false; END IF;

  -- 6. AUTH CONFIGURATION CHECK
  BEGIN
    SELECT jsonb_build_object(
      'check', 'auth_config',
      'passed', (
        SELECT COUNT(*) > 0 FROM auth.instances
      ),
      'details', jsonb_build_object('instance_count', (SELECT COUNT(*) FROM auth.instances))
    ) INTO checks;
  END;

  -- FINAL RESULT
  result := jsonb_build_object(
    'all_passed', all_passed,
    'timestamp', NOW(),
    'checks', checks
  );

  RAISE NOTICE 'DEPLOYMENT VERIFICATION RESULT: %', result::TEXT;

  IF NOT all_passed THEN
    RAISE EXCEPTION 'DEPLOYMENT VERIFICATION FAILED: %', result::TEXT;
  END IF;
END;
$$;

-- Re-verify from client: SELECT * FROM pg_stat_user_tables WHERE schemaname = 'public';
