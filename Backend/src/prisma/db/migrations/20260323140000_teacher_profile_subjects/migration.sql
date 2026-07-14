-- Free-text subjects taught (aligned with dashboard teacher list / edit form)
ALTER TABLE "teacher_profiles" ADD COLUMN IF NOT EXISTS "subjects" TEXT;
