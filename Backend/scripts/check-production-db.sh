#!/usr/bin/env bash
# Run the dashboard DB check using PRODUCTION .env.
# Run this ON THE PRODUCTION SERVER (e.g. SSH into VPS).
#
# Usage:
#   On server: cd /opt/schooliat/backend/production/current && bash scripts/check-production-db.sh
#   Or from repo Backend on server: PRODUCTION_ENV=1 bash scripts/check-production-db.sh
#   Optional: SCHOOL_ID=<uuid> bash scripts/check-production-db.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load production .env if we're not already in production current and env not set
if [ -z "$DATABASE_URL" ] || [ -n "$PRODUCTION_ENV" ]; then
  PROD_ENV="/opt/schooliat/backend/production/shared/.env"
  if [ -f "$PROD_ENV" ]; then
    echo "Loading production env from $PROD_ENV"
    set -a
    source "$PROD_ENV"
    set +a
  fi
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not set. Load .env or run from /opt/schooliat/backend/production/current (where .env is symlinked)."
  exit 1
fi

cd "$BACKEND_ROOT"
node scripts/check-dashboard-db.js
