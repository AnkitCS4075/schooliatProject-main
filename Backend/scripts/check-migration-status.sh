#!/bin/bash

# Script to check migration status
# Usage: ./scripts/check-migration-status.sh

set -e

echo "📋 Checking Migration Status..."
echo ""

cd "$(dirname "$0")/.."

echo "📋 Prisma Migration Status:"
npm run prisma:migrate:status

echo ""
echo "📋 Database Schema Info:"
echo "   Run 'npm run prisma:studio' to view database schema in Prisma Studio"

