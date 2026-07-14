-- Add Inventory Permission enum values that exist in schema but were missing from previous migrations.
-- Production-safe: each value is added only if not present.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'CREATE_INVENTORY_ITEM') THEN
    ALTER TYPE "permission" ADD VALUE 'CREATE_INVENTORY_ITEM';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_INVENTORY') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_INVENTORY';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'EDIT_INVENTORY_ITEM') THEN
    ALTER TYPE "permission" ADD VALUE 'EDIT_INVENTORY_ITEM';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'DELETE_INVENTORY_ITEM') THEN
    ALTER TYPE "permission" ADD VALUE 'DELETE_INVENTORY_ITEM';
  END IF;
END $$;
