#!/bin/bash

# Script to migrate both staging and production databases
# Usage: ./scripts/migrate-both-environments.sh

set -e

echo "Phase 1 Database Migration for Both Environments"
echo "=================================================="
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Step 1: Migrate Staging
echo "Step 1: Migrating STAGING database..."
echo "----------------------------------------"
bash scripts/migrate-staging.sh

echo ""
echo ""

# Step 2: Confirm Production Migration
echo "Step 2: Migrating PRODUCTION database..."
echo "----------------------------------------"
echo "WARNING: You will be prompted to confirm production migration."
echo ""
bash scripts/migrate-production.sh

echo ""
echo "All migrations completed!"
echo ""
echo "Next steps:"
echo "   1. Test staging APIs: npm run test:staging"
echo "   2. Test production APIs: npm run test:production"
echo "   3. Verify both databases have the new schema"

