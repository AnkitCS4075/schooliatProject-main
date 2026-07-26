#!/bin/sh
set -e

echo "Running Prisma schema push..."
npx prisma db push --schema=src/prisma/db/schema.prisma --accept-data-loss

echo "Starting server..."
exec node src/server.js
