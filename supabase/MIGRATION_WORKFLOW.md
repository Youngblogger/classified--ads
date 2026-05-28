# Supabase Autonomous Migration System

> ❌ Zero manual SQL execution | ✅ All migrations CI-controlled | ✅ Safe auto-rollback

## System Architecture

```
Developer → Git Push → GitHub Actions CI → Supabase CLI → Staging DB → Approval Gate → Production DB
```

**Single source of truth:** Git repository only. Supabase Dashboard is **read-only** for monitoring.

## Prerequisites

Install Supabase CLI locally (macOS/Linux/WSL):

```bash
npm install -g supabase
supabase login
```

Initialize and link to your project:

```bash
supabase init
supabase link --project-ref <project-ref>
```

## Migration File Structure

```
supabase/migrations/
  202605260001_initial_schema.sql          ← Tables, RLS, indexes, triggers
  202605260002_functions.sql               ← Custom PostgreSQL functions
  202605260003_security_policies.sql        ← Role system, private bucket
  202605260004_rollback_security_policies.sql  ← Revert security changes
  202605260005_rollback_functions.sql       ← Revert functions
```

**Rules:**
- NEVER edit a committed migration file
- ONE logical change per migration file
- Naming: `YYYYMMDDHHMMSS_description.sql`
- Each forward migration SHOULD have a corresponding rollback

## Development Workflow

### 1. Create a new migration

```bash
supabase migration new describe_your_change
```

This creates: `supabase/migrations/<timestamp>_describe_your_change.sql`

Edit the generated file with your SQL changes.

### 2. Create the rollback migration (REQUIRED for destructive changes)

Create a corresponding rollback file:
```bash
cp supabase/migrations/<timestamp>_describe_your_change.sql \
   supabase/migrations/<timestamp>_rollback_describe_your_change.sql
```

Write the **inverse** SQL operations in the rollback file.

### 3. Apply locally (if using local Supabase)

```bash
supabase db reset    # Wipes local DB and re-applies all migrations
supabase db push     # Push pending migrations to linked remote project
```

### 4. Commit and push

```bash
git add supabase/migrations/
git commit -m "feat(db): describe your change"
git push origin main
```

## CI/CD Pipeline (3 Stages)

### 🧪 Stage 1 — Validation (BLOCKING)

| Check | What it does |
|-------|-------------|
| SQL syntax | `supabase db lint` on every migration file |
| Naming convention | Ensures files match `YYYYMMDDHHMMSS_description.sql` |
| Duplicate timestamps | Prevents two files with the same timestamp |
| Rollback coverage | Warns if forward migration has no rollback |

### 🟡 Stage 2 — Staging Deployment (AUTOMATIC)

Triggered on every push to `main`:

1. **Drift detection** — `supabase db diff` checks if DB matches Git
2. **Dry run** — `supabase db push --dry-run` validates without applying
3. **Apply migrations** — `supabase db push` applies to staging
4. **Post-deploy verification** — Runs `verify_deployment.sql`:
   - All 17+ tables exist
   - RLS enabled on all tables
   - All 12+ functions present
   - All 14+ triggers active
   - All 3 storage buckets exist
5. **Schema integrity** — Re-checks after deploy
6. **Auto-rollback** — If verification fails, applies rollback automatically

### 🟢 Stage 3 — Production Deployment (GATED)

Requires **manual approval** via GitHub Environments:

1. Same drift detection + dry run + apply cycle
2. Post-deploy verification runs
3. Auto-rollback on failure
4. Success/failure notification

## Auto-Rollback System

If a migration fails or post-deploy verification fails:

### Automatic (safe rollback):
1. CI detects the failure immediately
2. Finds the matching rollback migration (`<timestamp>_rollback_*.sql`)
3. Applies the rollback to revert the failed changes
4. Pipeline stops with failure status

### Emergency (if auto-rollback fails):
1. **Restore from Supabase backup** (Project Settings → Backups)
2. Reapply migrations up to last stable version via CI
3. Investigate root cause before re-deploying

## Migration Safety Rules

### Destructive Changes (require extra caution)

For any of these operations:
- `DROP TABLE`
- `ALTER COLUMN TYPE` (data-changing)
- `DROP COLUMN`
- RLS restructuring

**MUST:**
1. Create rollback migration FIRST
2. Deploy to staging first (always automatic)
3. Verify on staging before production
4. Require manual approval for production

### Zero-Downtime Rules
- No destructive changes without a replacement migration
- No breaking schema changes without staging validation
- Backward-compatible migrations preferred
- Phased rollout for risky changes

## Drift Prevention

The system detects when Supabase database differs from Git migration state:

- Run on every CI deployment: `supabase db diff`
- If drift detected: pipeline warns (non-blocking for existing drift, blocking for new)

To fix drift manually:
```bash
supabase db pull        # Download remote schema as migration
supabase db diff        # Compare local vs remote
```

## Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Supabase personal access token (Settings → Access Tokens) |
| `STAGING_SUPABASE_PROJECT_REF` | Staging project reference |
| `PRODUCTION_SUPABASE_PROJECT_REF` | Production project reference |

## Required GitHub Variables

| Variable | Description |
|----------|-------------|
| `STAGING_SUPABASE_URL` | Staging project URL (for environment link) |
| `PRODUCTION_SUPABASE_URL` | Production project URL (for environment link) |

## Environment Strategy

| Environment | Purpose | Supabase Project | CI Trigger |
|-------------|---------|-----------------|------------|
| Staging | Pre-production validation | Separate project | Auto on push to main |
| Production | Live system | Separate project | Manual approval after staging |

## Verification Script

The file `supabase/verify_deployment.sql` runs automatically after every deployment and checks:
- Table existence (all 17+ tables)
- RLS enabled on all tables
- Function existence (all 12+ functions)
- Trigger existence (all 14+ triggers)
- Storage bucket existence (3 buckets)
- Auth configuration
