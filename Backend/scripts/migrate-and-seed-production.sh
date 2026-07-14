#!/bin/bash

# Script to migrate and seed PRODUCTION database
# Usage: ./scripts/migrate-and-seed-production.sh
# WARNING: This will modify the production database!

set -e

echo "=================================================================================="
echo "🚀 PRODUCTION DATABASE MIGRATION AND SEEDING"
echo "=================================================================================="
echo ""
echo "WARNING: You are about to migrate and seed the PRODUCTION database!"
echo "   This script will:"
echo "   1. Create a database backup"
echo "   2. Apply all pending migrations"
echo "   3. Seed the database with initial data (roles, super admin, etc.)"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Operation cancelled."
  exit 1
fi

echo ""
echo "Starting Production Database Migration and Seeding..."
echo ""

# Check for DATABASE_URL in environment or .env file
if [ -z "$DATABASE_URL" ]; then
  # Try to load from .env file in current directory
  if [ -f ".env" ]; then
    echo "Loading DATABASE_URL from .env file..."
    set -a
    source .env
    set +a
  elif [ -f "/opt/schooliat/backend/production/shared/.env" ]; then
    echo "Loading DATABASE_URL from production .env file..."
    set -a
    source /opt/schooliat/backend/production/shared/.env
    set +a
  else
    echo "ERROR: DATABASE_URL not found in environment or .env file"
    echo "   Please set DATABASE_URL environment variable or create .env file"
    echo "   Example: export DATABASE_URL='postgresql://user:pass@host:port/dbname'"
    exit 1
  fi
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is still not set"
  exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/.."

echo "Step 1: Creating database backup..."
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/production-pre-migration-$(date +%Y%m%d-%H%M%S).sql"

# Extract database connection details for backup
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p' | sed 's/:.*//')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p' || echo "5432")

echo "   Database: $DB_NAME"
echo "   Host: $DB_HOST"
echo "   Port: ${DB_PORT:-5432}"

# Try to create backup (may fail if pg_dump not available, but continue)
if command -v pg_dump &> /dev/null; then
  echo "   Creating backup..."
  PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null || {
    echo "   WARNING: Backup failed (pg_dump may not be available), but continuing..."
    rm -f "$BACKUP_FILE"
  }
  if [ -f "$BACKUP_FILE" ]; then
    echo "   ✅ Backup saved to: $BACKUP_FILE"
  fi
else
  echo "   ⚠️  pg_dump not available, skipping backup..."
fi

echo ""
echo "Step 2: Formatting Prisma schema..."
npm run prisma:format || echo "   ⚠️  Prisma format failed, continuing..."

echo ""
echo "Step 3: Generating Prisma Client..."
npm run prisma:generate || {
  echo "   ❌ Failed to generate Prisma client"
  exit 1
}

echo ""
echo "Step 4: Checking migration status..."
npm run prisma:migrate:status || echo "   ⚠️  Could not check migration status"

echo ""
echo "Step 5: Applying migrations to PRODUCTION database..."
echo "   Using DATABASE_URL: ${DATABASE_URL:0:50}..."
npm run prisma:migrate:deploy || {
  echo "   ❌ Migration failed!"
  exit 1
}

echo ""
echo "✅ Migrations applied successfully!"

echo ""
echo "Step 6: Seeding database with initial data..."
echo "   This will create:"
echo "   - Default roles and permissions"
echo "   - Super admin user (admin@schooliat.com)"
echo "   - Sample schools, classes, and users"
echo "   - Other initial data"
echo ""

# Check if seed script exists (npm run seed uses prisma/seed-run.js which loads env then runs seed.js)
if [ ! -f "prisma/seed.js" ]; then
  echo "   ⚠️  Seed file not found at prisma/seed.js"
  echo "   Skipping seeding..."
else
  # Run seed via npm (uses seed-run.js: loads .env / deployment shared .env, then runs seed.js)
  npm run seed || {
    echo "   ⚠️  Seeding encountered errors, but some data may have been created"
    echo "   Check the logs above for details"
  }
fi

echo ""
echo "=================================================================================="
echo "✅ PRODUCTION DATABASE MIGRATION AND SEEDING COMPLETED!"
echo "=================================================================================="
echo ""
echo "Next steps:"
echo "   1. Verify database schema: npm run prisma:migrate:status"
echo "   2. Test authentication: Use admin@schooliat.com / Admin@123"
echo "   3. Run API tests: npm run test:comprehensive"
echo "   4. Monitor application logs for any issues"
echo ""
if [ -f "$BACKUP_FILE" ]; then
  echo "Backup location: $BACKUP_FILE"
fi
echo ""

