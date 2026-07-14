-- AlterTable
ALTER TABLE "regions" ADD COLUMN IF NOT EXISTS "zone_head_id" TEXT;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'regions_zone_head_id_fkey'
  ) THEN
    ALTER TABLE "regions" ADD CONSTRAINT "regions_zone_head_id_fkey" 
    FOREIGN KEY ("zone_head_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
