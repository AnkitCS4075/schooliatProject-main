-- Append-only fee payment / waiver / cancellation audit trail
CREATE TYPE "fee_ledger_entry_type" AS ENUM ('PAYMENT', 'WAIVER', 'CANCELLATION_REVERSAL');

CREATE TABLE "fee_ledger_entries" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "fee_id" TEXT,
    "installment_id" TEXT,
    "entry_type" "fee_ledger_entry_type" NOT NULL,
    "amount" INTEGER NOT NULL,
    "receipt_number" TEXT,
    "receipt_file_id" TEXT,
    "payment_method" TEXT,
    "transaction_id" TEXT,
    "remarks" TEXT,
    "metadata" JSONB,
    "recorded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_ledger_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "fee_ledger_entries_school_student_created_idx" ON "fee_ledger_entries"("school_id", "student_id", "created_at" DESC);
CREATE INDEX "fee_ledger_entries_installment_idx" ON "fee_ledger_entries"("installment_id");

ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "fee_receipt_number_prefix" TEXT DEFAULT 'REC';
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "fee_receipt_next_sequence" INTEGER DEFAULT 1;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "fee_receipt_use_gst" BOOLEAN DEFAULT false;
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "fee_receipt_cgst_percent" DECIMAL(5,2);
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "fee_receipt_sgst_percent" DECIMAL(5,2);
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "fee_receipt_pan_card_number" TEXT;

ALTER TABLE "fee_installments" ADD COLUMN IF NOT EXISTS "last_receipt_number" TEXT;
