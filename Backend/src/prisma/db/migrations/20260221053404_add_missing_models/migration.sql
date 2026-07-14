-- Production-safe: only add new enums and tables that do not exist yet.
-- Existing enums (attendance_status, etc.) and tables (attendances, etc.) are left unchanged.

-- New enums only (library, gallery, circular, chatbot)
CREATE TYPE "library_issue_status" AS ENUM ('ISSUED', 'RETURNED', 'OVERDUE');
CREATE TYPE "gallery_privacy" AS ENUM ('PUBLIC', 'PRIVATE', 'SCHOOL_ONLY');
CREATE TYPE "circular_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "chatbot_intent" AS ENUM ('GENERAL_QUERY', 'ATTENDANCE_QUERY', 'HOMEWORK_QUERY', 'EXAM_QUERY', 'FEE_QUERY', 'TIMETABLE_QUERY');

-- Create notification_type if it does not exist, then add LIBRARY and CIRCULAR
DO $$ BEGIN
  CREATE TYPE "notification_type" AS ENUM ('ATTENDANCE', 'HOMEWORK', 'EXAM', 'FEE', 'LEAVE', 'ANNOUNCEMENT', 'GENERAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'notification_type' AND e.enumlabel = 'LIBRARY') THEN
    ALTER TYPE "notification_type" ADD VALUE 'LIBRARY';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'notification_type' AND e.enumlabel = 'CIRCULAR') THEN
    ALTER TYPE "notification_type" ADD VALUE 'CIRCULAR';
  END IF;
END $$;

-- New tables only
CREATE TABLE "library_books" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "publisher" TEXT,
    "category" TEXT,
    "description" TEXT,
    "total_copies" INTEGER NOT NULL DEFAULT 1,
    "available_copies" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT,
    "price" DECIMAL(10,2),
    "language" TEXT NOT NULL DEFAULT 'English',
    "published_year" INTEGER,
    "school_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "library_books_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "library_issues" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "issued_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3),
    "status" "library_issue_status" NOT NULL,
    "fine_amount" DECIMAL(10,2),
    "remarks" TEXT,
    "school_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "library_issues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "library_reservations" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "school_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "library_reservations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject_id" TEXT NOT NULL,
    "class_id" TEXT,
    "chapter" TEXT,
    "topic" TEXT,
    "file_id" TEXT,
    "school_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "syllabi" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "chapters" JSONB,
    "file_id" TEXT,
    "school_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "syllabi_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "galleries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_id" TEXT,
    "privacy" "gallery_privacy" NOT NULL DEFAULT 'PUBLIC',
    "class_id" TEXT,
    "school_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "gallery_images" (
    "id" TEXT NOT NULL,
    "gallery_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "caption" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "school_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "circulars" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "circular_status" NOT NULL DEFAULT 'DRAFT',
    "target_roles" JSONB NOT NULL DEFAULT '[]',
    "target_user_ids" JSONB NOT NULL DEFAULT '[]',
    "class_ids" JSONB NOT NULL DEFAULT '[]',
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "expires_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "school_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "circulars_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "keywords" JSONB DEFAULT '[]',
    "school_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chatbot_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "intent" "chatbot_intent",
    "context" JSONB,
    "school_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chatbot_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatbot_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "transport_id" TEXT NOT NULL,
    "start_point" TEXT NOT NULL,
    "end_point" TEXT NOT NULL,
    "distance" DECIMAL(10,2),
    "estimated_time" INTEGER,
    "school_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "route_stops" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "sequence" INTEGER NOT NULL,
    "arrival_time" TEXT,
    "school_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_maintenance" (
    "id" TEXT NOT NULL,
    "transport_id" TEXT NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "description" TEXT,
    "cost" DECIMAL(10,2),
    "maintenance_date" TIMESTAMP(3) NOT NULL,
    "next_maintenance_date" TIMESTAMP(3),
    "serviceProvider" TEXT,
    "odometer_reading" INTEGER,
    "school_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vehicle_maintenance_pkey" PRIMARY KEY ("id")
);

-- Indexes for new tables
CREATE UNIQUE INDEX "library_books_isbn_key" ON "library_books"("isbn");
CREATE INDEX "library_books_school_id_deleted_at_idx" ON "library_books"("school_id", "deleted_at");
CREATE INDEX "library_issues_book_id_deleted_at_idx" ON "library_issues"("book_id", "deleted_at");
CREATE INDEX "library_issues_user_id_deleted_at_idx" ON "library_issues"("user_id", "deleted_at");
CREATE INDEX "library_issues_school_id_deleted_at_idx" ON "library_issues"("school_id", "deleted_at");
CREATE INDEX "library_reservations_book_active_deleted_at_idx" ON "library_reservations"("book_id", "is_active", "deleted_at");
CREATE INDEX "library_reservations_user_id_deleted_at_idx" ON "library_reservations"("user_id", "deleted_at");
CREATE INDEX "notes_school_id_deleted_at_idx" ON "notes"("school_id", "deleted_at");
CREATE INDEX "notes_subject_id_deleted_at_idx" ON "notes"("subject_id", "deleted_at");
CREATE INDEX "syllabus_school_id_deleted_at_idx" ON "syllabi"("school_id", "deleted_at");
CREATE INDEX "galleries_school_id_deleted_at_idx" ON "galleries"("school_id", "deleted_at");
CREATE INDEX "gallery_images_gallery_id_deleted_at_idx" ON "gallery_images"("gallery_id", "deleted_at");
CREATE INDEX "circulars_school_status_deleted_at_idx" ON "circulars"("school_id", "status", "deleted_at");
CREATE INDEX "faqs_school_active_deleted_at_idx" ON "faqs"("school_id", "is_active", "deleted_at");
CREATE INDEX "chatbot_conversations_user_id_idx" ON "chatbot_conversations"("user_id");
CREATE INDEX "chatbot_messages_conversation_id_idx" ON "chatbot_messages"("conversation_id");
CREATE INDEX "routes_school_id_deleted_at_idx" ON "routes"("school_id", "deleted_at");
CREATE INDEX "routes_transport_id_deleted_at_idx" ON "routes"("transport_id", "deleted_at");
CREATE INDEX "route_stops_route_id_deleted_at_idx" ON "route_stops"("route_id", "deleted_at");
CREATE INDEX "vehicle_maintenance_transport_id_deleted_at_idx" ON "vehicle_maintenance"("transport_id", "deleted_at");

-- Foreign keys for new tables
ALTER TABLE "library_books" ADD CONSTRAINT "library_books_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "library_issues" ADD CONSTRAINT "library_issues_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "library_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "library_issues" ADD CONSTRAINT "library_issues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "library_reservations" ADD CONSTRAINT "library_reservations_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "library_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "library_reservations" ADD CONSTRAINT "library_reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "syllabi" ADD CONSTRAINT "syllabi_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "syllabi" ADD CONSTRAINT "syllabi_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "syllabi" ADD CONSTRAINT "syllabi_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "syllabi" ADD CONSTRAINT "syllabi_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "galleries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "circulars" ADD CONSTRAINT "circulars_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "chatbot_conversations" ADD CONSTRAINT "chatbot_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chatbot_messages" ADD CONSTRAINT "chatbot_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chatbot_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routes" ADD CONSTRAINT "routes_transport_id_fkey" FOREIGN KEY ("transport_id") REFERENCES "transports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routes" ADD CONSTRAINT "routes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_maintenance" ADD CONSTRAINT "vehicle_maintenance_transport_id_fkey" FOREIGN KEY ("transport_id") REFERENCES "transports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
