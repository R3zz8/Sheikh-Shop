#!/bin/bash

# Sheikh-Shop Migration Backup Script
# Creates comprehensive backups before any migration operations

set -e

# Configuration
BACKUP_DIR="migration-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DB_URL="${DATABASE_URL:-postgresql://neondb_owner:npg_123456789@ep-divine-bar-adpdpd8q.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require}"

echo "🔄 Starting migration backup process..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Database Backup
echo "📊 Creating database backup..."
pg_dump "$DB_URL" \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --file="$BACKUP_DIR/sheikh-shop-full-backup-$TIMESTAMP.sql"

# 2. Schema-only Backup
echo "📋 Creating schema-only backup..."
pg_dump "$DB_URL" \
  --schema-only \
  --verbose \
  --file="$BACKUP_DIR/sheikh-shop-schema-backup-$TIMESTAMP.sql"

# 3. Migration Files Backup
echo "📁 Backing up migration files..."
cp -r prisma/migrations "$BACKUP_DIR/migrations-backup-$TIMESTAMP"

# 4. Create tar archive
echo "🗜️  Creating compressed archive..."
tar -czf "$BACKUP_DIR/migration-backup-$TIMESTAMP.tar.gz" prisma/migrations/

# 5. Git Snapshot
echo "📝 Creating git snapshot..."
git add prisma/migrations
git commit -m "backup: migration state before cleanup - $TIMESTAMP" || echo "No changes to commit"

# 6. Create branch for migration work
echo "🌿 Creating migration cleanup branch..."
git checkout -b "migration-cleanup-$TIMESTAMP" || echo "Branch already exists"

echo "✅ Backup completed successfully!"
echo "📂 Backup location: $BACKUP_DIR/"
echo "📊 Full backup: sheikh-shop-full-backup-$TIMESTAMP.sql"
echo "📋 Schema backup: sheikh-shop-schema-backup-$TIMESTAMP.sql"
echo "📁 Migration files: migrations-backup-$TIMESTAMP/"
echo "🗜️  Archive: migration-backup-$TIMESTAMP.tar.gz"
echo ""
echo "🔄 To restore from backup:"
echo "   psql \"\$DATABASE_URL\" -f $BACKUP_DIR/sheikh-shop-full-backup-$TIMESTAMP.sql"
echo ""
echo "⚠️  Remember to review the PRISMA_MIGRATIONS_AUDIT.md report before proceeding!"
