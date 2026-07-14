-- Add payment_method to fee_installments so we persist online/offline method when recording payments
ALTER TABLE "fee_installments" ADD COLUMN IF NOT EXISTS "payment_method" "payment_method" NULL;
