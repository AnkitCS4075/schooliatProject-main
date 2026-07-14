-- Add regionId FK to schools table (text type to match regions.id)
ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "region_id" TEXT;

-- Add FK constraint for schools.region_id -> regions.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'schools_region_id_fkey'
  ) THEN
    ALTER TABLE "schools" ADD CONSTRAINT "schools_region_id_fkey"
      FOREIGN KEY ("region_id") REFERENCES "regions"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add permissions column to users table (array of permission enum values, default empty)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'permissions'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "permissions" "permission"[] NOT NULL DEFAULT ARRAY[]::"permission"[];
  END IF;
END $$;
