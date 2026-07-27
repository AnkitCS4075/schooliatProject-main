#!/bin/sh
set -e

echo "=== SchooliAT Backend Starting ==="

# Step 1: Push Prisma schema (creates/updates tables)
echo "[1/3] Running Prisma schema push..."
npx prisma db push --schema=src/prisma/db/schema.prisma --accept-data-loss

# Step 2: Start server FIRST (so Render detects the port immediately)
echo "[2/3] Starting Express server..."
node src/server.js &
SERVER_PID=$!

# Step 3: Seed database in background (after server is up)
echo "[3/3] Seeding database in background..."
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

if [ "$USER_COUNT" = "0" ] || [ "$USER_COUNT" = "-1" ]; then
  echo "   Database is empty — running seed..."
  node prisma/seed.js && echo "   Seed completed!" || echo "   WARNING: Seed failed"
else
  echo "   Database has $USER_COUNT users — skipping seed."
fi

# Keep container running with the server process
wait $SERVER_PID
