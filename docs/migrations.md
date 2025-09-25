# Prisma Migrations Runbook (Production-Safe)

## Golden Rules
- Never run `npx prisma db push` on production.
- Always commit every migration directory; never delete or edit applied migrations.
- Fix forward: use new migrations; do not rewrite history.
- If manual SQL is executed in prod, capture it in a committed migration and mark as applied with `migrate resolve`.

## Pre-deploy Health Checks (CI)
- `npx prisma validate`
- `npx prisma format --schema prisma/schema.prisma --check`
- Optional (staging DB): `DATABASE_URL=$STAGING npx prisma migrate status`

## Standard Deployment Flow
1. Local/dev
   - Update `schema.prisma`
   - `npx prisma migrate dev -n "change_name"`
   - Commit code and migrations
2. Staging
   - `DATABASE_URL=$STAGING npx prisma migrate deploy`
   - Run smoke tests
3. Production
   - `bash scripts/backup.sh`
   - `DATABASE_URL=$PROD npm run db:health`
   - `DATABASE_URL=$PROD npx prisma migrate deploy`

## Handling Incidents
### P3017 (migration not found)
- Create placeholder directory matching the missing `migration_name` present in `_prisma_migrations`.
- Commit it. Re-run deploy.

### P3009 (failed migration)
- Decide truth (applied vs rolled-back) from DB state.
- Mark state:
  - `npx prisma migrate resolve --applied <name>`
  - or `npx prisma migrate resolve --rolled-back <name>`
- Create a forward-only fix migration and deploy.

### Schema Drift
- Generate reconcile migration (non-destructive):
```
DATABASE_URL=$PROD npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script > baseline_reconcile.sql
```
- Move into `prisma/migrations/<ts>_baseline_reconcile/migration.sql`, review, commit, deploy.

## Backup
- `DATABASE_URL=$PROD bash scripts/backup.sh`

## Naming Conventions
- `YYYYMMDDHHMMSS_descriptive_change`


