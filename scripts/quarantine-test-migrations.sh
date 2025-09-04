#!/usr/bin/env bash
set -euo pipefail

# Move migrations that look like test placeholders (test*, *_test, sample*, tmp*)
# into prisma/migrations_quarantine/ without deletion.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

QUAR="$ROOT/prisma/migrations_quarantine"
SRC="$ROOT/prisma/migrations"

mkdir -p "$QUAR"

shopt -s nullglob
quarantined=()
for d in "$SRC"/*/; do
  name="$(basename "$d")"
  if [[ "$name" == test* || "$name" == *_test || "$name" == sample* || "$name" == tmp* ]]; then
    mv "$d" "$QUAR/" 
    quarantined+=("$name")
  fi
done

echo "Quarantined migrations:" 
for q in "${quarantined[@]:-}"; do
  echo " - $q"
done


