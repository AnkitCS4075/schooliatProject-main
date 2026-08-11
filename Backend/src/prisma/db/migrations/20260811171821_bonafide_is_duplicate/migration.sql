-- Add is_duplicate column to bonafide_certificates
ALTER TABLE "bonafide_certificates" ADD COLUMN IF NOT EXISTS "is_duplicate" BOOLEAN NOT NULL DEFAULT false;
