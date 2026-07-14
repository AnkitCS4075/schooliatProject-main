-- Encrypted platform SMTP password (super-admin UI); keep secrets out of platform_config JSON.
ALTER TABLE "settings" ADD COLUMN "platform_smtp_password_enc" TEXT;
