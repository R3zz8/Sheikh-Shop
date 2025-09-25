#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   MIGRATE_DATABASE_URL="postgres://user:pass@host:5432/db" bash scripts/backup.sh

if [[ -z "${MIGRATE_DATABASE_URL:-}" ]]; then
  echo "ERROR: MIGRATE_DATABASE_URL is not set." >&2
  exit 1
fi

timestamp=$(date +%Y%m%d%H%M%S)
outfile="backup_${timestamp}.dump"

echo "Creating PostgreSQL backup to ${outfile}..."
pg_dump "$MIGRATE_DATABASE_URL" -Fc -f "$outfile"
echo "Backup completed: ${outfile}"


