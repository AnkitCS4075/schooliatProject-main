#!/bin/bash

# Script to run database migrations for PRODUCTION environment
# Usage: ./scripts/migrate-production.sh
# WARNING: This will modify the production database!

set -e

echo "WARNING: You are about to migrate the PRODUCTION database!"
echo "   This script will modify the production database schema."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Migration cancelled."
  exit 1
fi

echo "Starting Production Database Migration..."
echo ""

# Check if production .env exists
PRODUCTION_ENV="/opt/schooliat/backend/production/shared/.env"
if [ ! -f "$PRODUCTION_ENV" ]; then
  echo "ERROR: Production environment file not found at $PRODUCTION_ENV"
  echo "   Please ensure production environment is set up correctly."
  exit 1
fi

echo "Loading production environment variables..."
set -a
source "$PRODUCTION_ENV"
set +a

# Confirm we're on production DB (Prisma uses DATABASE_URL from env)
DB_NAME_FROM_URL=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^/?]*\).*|\1|p')
if [ -n "$DB_NAME_FROM_URL" ]; then
  echo "   DATABASE_URL points to database: $DB_NAME_FROM_URL"
  if [ "$DB_NAME_FROM_URL" != "schooliat_production" ]; then
    echo "   ERROR: Expected schooliat_production. Fix $PRODUCTION_ENV and re-run."
    exit 1
  fi
fi

# Navigate to backend directory
cd "$(dirname "$0")/.."

echo "Step 1: Creating database backup..."
BACKUP_DIR="/opt/schooliat/shared/backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/production-pre-migration-$(date +%Y%m%d-%H%M%S).sql"

# Extract database connection details
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "   Backing up database: $DB_NAME"
PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" || {
  echo "WARNING: Backup failed, but continuing with migration..."
}

echo "   Backup saved to: $BACKUP_FILE"

echo ""
echo "Step 2: Formatting Prisma schema..."
npm run prisma:format

echo ""
echo "Step 3: Generating Prisma Client..."
npm run prisma:generate

echo ""
echo "Step 4: Applying migration to PRODUCTION database..."
echo "   Database: ${DATABASE_URL:-'Not set'}"
npm run prisma:migrate:deploy

echo ""
echo "Production migration completed successfully!"
echo ""
echo "Next steps:"
echo "   1. Review the migration in prisma/migrations/"
echo "   2. Test production APIs: npm run test:phase1 -- --env=production"
echo "   3. Verify database schema in production database"
echo "   4. Monitor application logs for any issues"
echo ""
echo "Backup location: $BACKUP_FILE"

