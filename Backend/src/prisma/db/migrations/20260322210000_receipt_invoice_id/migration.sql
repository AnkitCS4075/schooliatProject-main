-- Link receipts to the invoice they settle (optional; standalone receipts remain allowed).
ALTER TABLE "receipts" ADD COLUMN IF NOT EXISTS "invoice_id" TEXT;

CREATE INDEX IF NOT EXISTS "receipts_invoice_id_idx" ON "receipts"("invoice_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'receipts_invoice_id_fkey' AND table_name = 'receipts'
  ) THEN
    ALTER TABLE "receipts" ADD CONSTRAINT "receipts_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
