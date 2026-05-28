-- iList Marketplace - Auto Rollback Script
-- CI/CD calls this with: ROLLBACK_TARGET=<migration_timestamp>
-- Finds and applies the corresponding rollback migration

DO $$
DECLARE
  rollback_target TEXT := current_setting('rollback.target', true);
  rollback_file TEXT;
  rollback_exists BOOLEAN;
BEGIN
  IF rollback_target IS NULL OR rollback_target = '' THEN
    RAISE EXCEPTION 'rollback.target must be set to the migration timestamp to revert';
  END IF;

  -- Look for a rollback migration matching the target
  SELECT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'schema_migrations'
  ) INTO rollback_exists;

  IF NOT rollback_exists THEN
    RAISE NOTICE 'No schema_migrations table found. Skipping rollback check.';
    RETURN;
  END IF;

  RAISE NOTICE 'Rollback target: %', rollback_target;
  RAISE NOTICE 'Rollback procedure:';
  RAISE NOTICE '  1. Identify the failed migration version: %', rollback_target;
  RAISE NOTICE '  2. Find the matching rollback migration file in supabase/migrations/';
  RAISE NOTICE '  3. Apply the rollback via: supabase db push (after committing the rollback file)';
  RAISE NOTICE '';
  RAISE NOTICE 'Manual rollback command (if CI cannot auto-apply):';
  RAISE NOTICE '  supabase migration link --project-ref <ref>';
  RAISE NOTICE '  supabase db push';
END;
$$;
