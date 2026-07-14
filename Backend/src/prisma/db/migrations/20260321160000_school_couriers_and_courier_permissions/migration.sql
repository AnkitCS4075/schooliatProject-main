-- Courier dispatch tracking (per school) + permission enum values.

CREATE TYPE "courier_dispatch_status" AS ENUM ('DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED');

CREATE TABLE "school_couriers" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "tracking_number" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "contents" TEXT NOT NULL DEFAULT '',
    "status" "courier_dispatch_status" NOT NULL DEFAULT 'DISPATCHED',
    "dispatch_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivery_date" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "school_couriers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "school_couriers_school_id_deleted_at_idx" ON "school_couriers"("school_id", "deleted_at");

ALTER TABLE "school_couriers" ADD CONSTRAINT "school_couriers_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_COURIERS') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_COURIERS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'CREATE_COURIER_ENTRY') THEN
    ALTER TYPE "permission" ADD VALUE 'CREATE_COURIER_ENTRY';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'UPDATE_COURIER_ENTRY') THEN
    ALTER TYPE "permission" ADD VALUE 'UPDATE_COURIER_ENTRY';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'DELETE_COURIER_ENTRY') THEN
    ALTER TYPE "permission" ADD VALUE 'DELETE_COURIER_ENTRY';
  END IF;
END $$;
