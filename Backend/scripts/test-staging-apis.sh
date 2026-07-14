#!/bin/bash

# Script to test Phase 1 APIs in STAGING environment
# Usage: ./scripts/test-staging-apis.sh

set -e

echo "Testing Phase 1 APIs in Staging Environment..."
echo ""

# Check if staging .env exists
STAGING_ENV="/opt/schooliat/backend/staging/shared/.env"
if [ ! -f "$STAGING_ENV" ]; then
  echo "ERROR: Staging environment file not found at $STAGING_ENV"
  exit 1
fi

# Load staging environment variables
export $(grep -v '^#' "$STAGING_ENV" | xargs)

# Set API URL for staging
export API_URL="${API_URL:-http://localhost:3001}"

echo "Staging Configuration:"
echo "   API URL: $API_URL"
echo "   Environment: staging"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Run Phase 1 API tests
echo "Running Phase 1 API tests..."
node test-phase1-apis.js

echo ""
echo "Staging API tests completed!"

