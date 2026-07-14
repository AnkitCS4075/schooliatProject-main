#!/bin/bash

# Script to migrate and seed database (works with any environment)
# Usage: DATABASE_URL="postgresql://..." ./scripts/migrate-and-seed.sh
# Or: ./scripts/migrate-and-seed.sh (will prompt for DATABASE_URL)

set -e

echo "=================================================================================="
echo "🚀 DATABASE MIGRATION AND SEEDING"
echo "=================================================================================="
echo ""

# Check for DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  # Try to load from .env file
  if [ -f ".env" ]; then
    echo "Loading DATABASE_URL from .env file..."
    export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
  fi
fi

# If still not set, prompt user
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not found. Please provide your database connection string."
  echo "Example: postgresql://user:password@host:port/database"
  echo ""
  read -p "Enter DATABASE_URL: " DATABASE_URL
  export DATABASE_URL
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is required"
  exit 1
fi

# Show database info (masked)
DB_INFO=$(echo "$DATABASE_URL" | sed 's/:[^:@]*@/:***@/g')
echo "Database: $DB_INFO"
echo ""

# Confirm before proceeding
echo "This will:"
echo "  1. Apply all pending migrations"
echo "  2. Seed the database with initial data"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Operation cancelled."
  exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Ensure Prisma CLI sees DATABASE_URL (config reads env at load time)
export NODE_OPTIONS="${NODE_OPTIONS:-} -r dotenv/config"

echo ""
echo "Step 1: Generating Prisma Client..."
npm run prisma:generate || {
  echo "   ❌ Failed to generate Prisma client"
  exit 1
}

echo ""
echo "Step 2: Checking migration status..."
npm run prisma:migrate:status || echo "   ⚠️  Could not check migration status"

echo ""
echo "Step 3: Applying migrations..."
echo "   This will apply all pending migrations to the database"
npm run prisma:migrate:deploy || {
  echo "   ❌ Migration failed!"
  exit 1
}

echo ""
echo "✅ Migrations applied successfully!"

echo ""
echo "Step 4: Seeding database with initial data..."
echo "   This will create:"
echo "   - Default roles and permissions"
echo "   - Super admin user (admin@schooliat.com / Admin@123)"
echo "   - Sample schools, classes, and users"
echo "   - Other initial data"
echo ""

# Run seed via npm (uses seed-run.js: loads .env / deployment .env, then runs seed.js)
if [ -f "prisma/seed.js" ]; then
  npm run seed || {
    echo "   ⚠️  Seeding encountered errors, but some data may have been created"
    echo "   Check the logs above for details"
  }
  echo ""
  echo "✅ Seeding completed!"
else
  echo "   ⚠️  Seed file not found at prisma/seed.js"
fi

echo ""
echo "=================================================================================="
echo "✅ DATABASE MIGRATION AND SEEDING COMPLETED!"
echo "=================================================================================="
echo ""
echo "Default credentials created:"
echo "   Super Admin: admin@schooliat.com / Admin@123"
echo ""
echo "Next steps:"
echo "   1. Verify migration status: npm run prisma:migrate:status"
echo "   2. Test authentication with the credentials above"
echo "   3. Run API tests: npm run test:comprehensive"
echo ""

