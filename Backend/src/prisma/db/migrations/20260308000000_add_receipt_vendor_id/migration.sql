-- AlterTable: add optional vendorId to receipts and make schoolId optional
ALTER TABLE "receipts" ADD COLUMN IF NOT EXISTS "vendor_id" TEXT;

ALTER TABLE "receipts" ALTER COLUMN "school_id" DROP NOT NULL;

-- AddForeignKey (if not exists - Prisma may have already created receipts with school_id NOT NULL in init)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'receipts_vendor_id_fkey' AND table_name = 'receipts'
  ) THEN
    ALTER TABLE "receipts" ADD CONSTRAINT "receipts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
