-- StartTransaction
BEGIN;

-- AlterTable: Add the unique constraint to public_user_id
-- We use CREATE UNIQUE INDEX and then potentially ADD CONSTRAINT if needed by Prisma
-- But Prisma usually manages this via the index name

CREATE UNIQUE INDEX IF NOT EXISTS "users_unique_public_user_id" ON "users"("public_user_id");

-- CommitTransaction
COMMIT;
