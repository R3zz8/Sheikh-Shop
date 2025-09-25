#!/usr/bin/env bash
set -euo pipefail

# Generates a baseline reconcile migration from the live DB (DATABASE_URL)
# to the local prisma/schema.prisma, without resetting data.
#
# Usage:
#   DATABASE_URL="postgres://user:pass@host:5432/db" bash scripts/generate-baseline.sh

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

WORKDIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$WORKDIR"

echo "Generating reconcile SQL via prisma migrate diff..."
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script > baseline_reconcile.sql

if [[ ! -s baseline_reconcile.sql ]]; then
  echo "No differences detected. Exiting."
  rm -f baseline_reconcile.sql || true
  exit 0
fi

ts=$(date +%Y%m%d%H%M%S)
mig="prisma/migrations/${ts}_baseline_reconcile"

mkdir -p "$mig"
mv baseline_reconcile.sql "$mig/migration.sql"

echo "Baseline reconcile created at: $mig/migration.sql"
echo "Review the SQL before deploying to production."


