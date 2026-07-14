#!/bin/bash
# Seed database using staging or production credentials (run from repo root).
# Seeding is NOT run in CI/CD; use this script when you want to seed from here.
#
# Usage: ./seed-env.sh [production|staging]
# Env files (on VPS): /opt/schooliat/backend/<env>/shared/.env

set -e

ENV="${1:-}"
if [ "$ENV" != "production" ] && [ "$ENV" != "staging" ]; then
  echo "Usage: $0 production|staging"
  echo "  Loads /opt/schooliat/backend/<env>/shared/.env and runs Backend seed."
  exit 1
fi

ENV_FILE="/opt/schooliat/backend/${ENV}/shared/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Environment file not found: $ENV_FILE"
  echo "Create it on the VPS or run from Backend with: source $ENV_FILE && npm run seed"
  exit 1
fi

echo "Seeding ${ENV} database (credentials from ${ENV_FILE})..."
set -a
source "$ENV_FILE"
set +a

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/Backend"
npm run seed
