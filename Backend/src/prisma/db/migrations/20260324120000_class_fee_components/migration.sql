-- Custom fee breakdown per class and snapshot on student fee records
ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "default_fee_components" JSONB;
ALTER TABLE "fees" ADD COLUMN IF NOT EXISTS "fee_components" JSONB;
