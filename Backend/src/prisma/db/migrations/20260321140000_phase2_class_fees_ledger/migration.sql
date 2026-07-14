-- Class-level default fee configuration (Phase C1)
ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "default_annual_fee" INTEGER;
ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "default_monthly_fee" INTEGER;

-- Installment cancellation audit fields (Phase C3)
ALTER TABLE "fee_installments" ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP(3);
ALTER TABLE "fee_installments" ADD COLUMN IF NOT EXISTS "cancellation_reason" TEXT;

-- New payment status for reversed / voided receipts (ledger stays; net totals adjusted in app)
DO $$ BEGIN
  ALTER TYPE "fee_payment_status" ADD VALUE 'CANCELLED';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
