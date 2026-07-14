#!/bin/bash

# Script to test Phase 1 APIs in PRODUCTION environment
# Usage: ./scripts/test-production-apis.sh
# WARNING: This will test against the production API!

set -e

echo "WARNING: You are about to test the PRODUCTION API!"
echo "   This will make requests to the production server."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Testing cancelled."
  exit 1
fi

echo "Testing Phase 1 APIs in Production Environment..."
echo ""

# Check if production .env exists
PRODUCTION_ENV="/opt/schooliat/backend/production/shared/.env"
if [ ! -f "$PRODUCTION_ENV" ]; then
  echo "ERROR: Production environment file not found at $PRODUCTION_ENV"
  exit 1
fi

# Load production environment variables
export $(grep -v '^#' "$PRODUCTION_ENV" | xargs)

# Set API URL for production
export API_URL="${API_URL:-https://api.schooliat.com}"

echo "Production Configuration:"
echo "   API URL: $API_URL"
echo "   Environment: production"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Run Phase 1 API tests
echo "Running Phase 1 API tests..."
node test-phase1-apis.js

echo ""
echo "Production API tests completed!"

