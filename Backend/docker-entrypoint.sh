#!/bin/sh
set -e

echo "=== SchooliAT Backend Starting ==="

# Step 1: Push Prisma schema (creates/updates tables)
echo "[1/3] Running Prisma schema push..."
npx prisma db push --schema=src/prisma/db/schema.prisma --accept-data-loss

# Step 2: Seed database if empty (first deploy only)
echo "[2/3] Checking if database needs seeding..."
USER_COUNT=$(node --input-type=module -e "
import { PrismaClient } from './src/prisma/generated/index.js';
const prisma = new PrismaClient();
try {
  const count = await prisma.user.count();
  console.log(count);
} catch(e) {
  console.log(-1);
} finally {
  await prisma.\$disconnect();
}
" 2>/dev/null || echo "-1")

echo "   Found $USER_COUNT users in database."

if [ "$USER_COUNT" = "0" ] || [ "$USER_COUNT" = "-1" ]; then
  echo "   Database is empty — running seed..."
  node prisma/seed.js || echo "   WARNING: Seed failed (non-fatal, continuing startup)"
else
  echo "   Database already has data — skipping seed."
fi

# Step 3: Start server
echo "[3/3] Starting Express server..."
exec node src/server.js
