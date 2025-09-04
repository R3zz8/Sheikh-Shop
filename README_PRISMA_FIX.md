# Prisma Migration Repair & Workflow Guide

## What was fixed
- Added production-safe scripts to `package.json` for health checks, backups, drift detection, and safe deploys.
- Added `scripts/backup.sh` and `scripts/generate-baseline.sh` for safe operations.
- Documented a production-safe runbook in `docs/migrations.md`.
- Established a non-destructive baseline reconcile flow using `prisma migrate diff`.

## How to run safe migrations

### Development
- Edit `prisma/schema.prisma`.
- Create migration: `npx prisma migrate dev -n "change_name"`.
- Commit code and migrations.

### Staging
- Backup if desired: `DATABASE_URL=$STAGING bash scripts/backup.sh`.
- Deploy: `DATABASE_URL=$STAGING npx prisma migrate deploy`.
- Smoke test the app.

### Production
- Backup (required): `DATABASE_URL=$PROD bash scripts/backup.sh`.
- Health checks: `DATABASE_URL=$PROD npm run db:health`.
- Deploy: `DATABASE_URL=$PROD npx prisma migrate deploy`.

## Fixing common issues
- Migration not found (P3017): create a placeholder directory matching the missing `migration_name`, commit it, then re-run deploy.
- Failed migration (P3009): decide truth (applied vs rolled-back), run `migrate resolve`, and ship a forward-only fix migration.
- Schema drift: `DATABASE_URL=$PROD bash scripts/generate-baseline.sh`, review the SQL, commit, then deploy.

## Preventing schema drift
- Never run `db push` on production.
- Do not modify historical migrations.
- Encode any manual SQL into a migration and mark it applied with `migrate resolve`.
- Always run `migrate deploy` before starting the app in production.
