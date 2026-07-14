#!/bin/bash

# Script to run database migrations for STAGING environment
# Usage: ./scripts/migrate-staging.sh

set -e

echo "Starting Staging Database Migration..."
echo ""

# Check if staging .env exists
STAGING_ENV="/opt/schooliat/backend/staging/shared/.env"
if [ ! -f "$STAGING_ENV" ]; then
  echo "ERROR: Staging environment file not found at $STAGING_ENV"
  echo "   Please ensure staging environment is set up correctly."
  exit 1
fi

echo "Loading staging environment variables..."
export $(grep -v '^#' "$STAGING_ENV" | xargs)

# Navigate to backend directory
cd "$(dirname "$0")/.."

echo "Step 1: Formatting Prisma schema..."
npm run prisma:format

echo ""
echo "Step 2: Generating Prisma Client..."
npm run prisma:generate

echo ""
echo "Step 3: Creating migration (if needed)..."
echo "   This will create a new migration file for Phase 1 modules"
npm run prisma:migrate:create -- --name phase1_modules || echo "   Migration already exists or schema unchanged"

echo ""
echo "Step 4: Applying migration to STAGING database..."
echo "   Database: ${DATABASE_URL:-'Not set'}"
npm run prisma:migrate:deploy

echo ""
echo "Staging migration completed successfully!"
echo ""
echo "Next steps:"
echo "   1. Review the migration in prisma/migrations/"
echo "   2. Test staging APIs: npm run test:phase1 -- --env=staging"
echo "   3. Verify database schema in staging database"

