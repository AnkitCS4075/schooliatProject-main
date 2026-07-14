-- CreateEnum
CREATE TYPE "permission" AS ENUM ('GET_USERS', 'CREATE_STUDENT', 'GET_STUDENTS', 'EDIT_STUDENT', 'DELETE_STUDENT', 'CREATE_TEACHER', 'GET_TEACHERS', 'EDIT_TEACHER', 'DELETE_TEACHER', 'CREATE_CLASSES', 'GET_CLASSES', 'EDIT_CLASSES', 'DELETE_CLASSES', 'CREATE_TRANSPORT', 'GET_TRANSPORTS', 'EDIT_TRANSPORT', 'DELETE_TRANSPORT', 'GET_MY_SCHOOL', 'CREATE_EMPLOYEE', 'GET_EMPLOYEES', 'EDIT_EMPLOYEE', 'DELETE_EMPLOYEE', 'CREATE_SCHOOL', 'GET_SCHOOLS', 'EDIT_SCHOOL', 'DELETE_SCHOOL', 'CREATE_VENDOR', 'GET_VENDORS', 'EDIT_VENDOR', 'DELETE_VENDOR', 'GET_REGIONS', 'CREATE_REGION', 'EDIT_REGION', 'DELETE_REGION', 'CREATE_RECEIPT', 'GET_RECEIPTS', 'UPDATE_RECEIPT', 'DELETE_RECEIPT', 'CREATE_LICENSE', 'GET_LICENSES', 'UPDATE_LICENSE', 'DELETE_LICENSE', 'CREATE_LOCATION', 'GET_LOCATIONS', 'DELETE_LOCATION', 'GET_STATISTICS', 'GET_DASHBOARD_STATS', 'CREATE_EVENT', 'GET_EVENTS', 'EDIT_EVENT', 'DELETE_EVENT', 'GET_CALENDAR', 'CREATE_HOLIDAY', 'GET_HOLIDAYS', 'EDIT_HOLIDAY', 'DELETE_HOLIDAY', 'CREATE_EXAM_CALENDAR', 'GET_EXAM_CALENDARS', 'EDIT_EXAM_CALENDAR', 'DELETE_EXAM_CALENDAR', 'CREATE_EXAM_CALENDAR_ITEM', 'GET_EXAM_CALENDAR_ITEMS', 'EDIT_EXAM_CALENDAR_ITEM', 'DELETE_EXAM_CALENDAR_ITEM', 'CREATE_NOTICE', 'GET_NOTICES', 'EDIT_NOTICE', 'DELETE_NOTICE', 'CREATE_EXAM', 'GET_EXAMS', 'EDIT_EXAM', 'DELETE_EXAM', 'MANAGE_ID_CARD_CONFIG', 'GENERATE_ID_CARDS', 'GET_ID_CARDS', 'GET_SETTINGS', 'EDIT_SETTINGS', 'GET_FEES', 'RECORD_FEE_PAYMENT', 'GET_ROLES', 'CREATE_GRIEVANCE', 'GET_GRIEVANCES', 'GET_MY_GRIEVANCES', 'UPDATE_GRIEVANCE', 'ADD_GRIEVANCE_COMMENT');

-- CreateEnum
CREATE TYPE "user_type" AS ENUM ('APP', 'SCHOOL');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "accommodation_type" AS ENUM ('DAY_SCHOLAR', 'HOSTELLER');

-- CreateEnum
CREATE TYPE "blood_group" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "role_name" AS ENUM ('SUPER_ADMIN', 'EMPLOYEE', 'SCHOOL_ADMIN', 'STUDENT', 'TEACHER', 'STAFF');

-- CreateEnum
CREATE TYPE "date_type" AS ENUM ('SINGLE_DATE', 'DATE_RANGE');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('UNIT_TEST', 'SEMESTER', 'FINAL');

-- CreateEnum
CREATE TYPE "fee_payment_status" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID');

-- CreateEnum
CREATE TYPE "grievance_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "grievance_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "id_card_collection_status" AS ENUM ('GENERATED', 'NOT_GENERATED', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "license_status" AS ENUM ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('BANK_TRANSFER', 'CASH', 'CHEQUE', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD');

-- CreateEnum
CREATE TYPE "receipt_status" AS ENUM ('GENERATED', 'PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "salary_component_value_type" AS ENUM ('PERCENTAGE', 'ABSOLUTE');

-- CreateEnum
CREATE TYPE "salary_component_type" AS ENUM ('GROSS', 'NET');

-- CreateEnum
CREATE TYPE "salary_component_frequency" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "template_type" AS ENUM ('ID_CARD', 'RESULT', 'INVENTORY_RECEIPT', 'FEE_RECEIPT');

-- CreateEnum
CREATE TYPE "transport_type" AS ENUM ('BUS', 'VAN', 'CAR');

-- CreateEnum
CREATE TYPE "lead_status" AS ENUM ('NEW', 'HOT', 'COLD', 'FOLLOW_UP', 'CONVERTED');

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT,
    "content_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "type" "template_type" NOT NULL,
    "path" TEXT NOT NULL,
    "image_id" TEXT,
    "sample_id" TEXT,
    "title" TEXT NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" "role_name" NOT NULL,
    "permissions" "permission"[] DEFAULT ARRAY[]::"permission"[],
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT[],
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "certificate_link" TEXT,
    "logoId" TEXT,
    "gst_number" TEXT,
    "principal_name" TEXT,
    "principal_email" TEXT,
    "principal_phone" TEXT,
    "established_year" INTEGER,
    "board_affiliation" TEXT,
    "student_strength" INTEGER,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "division" TEXT,
    "school_id" TEXT NOT NULL,
    "class_teacher_id" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "public_user_id" TEXT NOT NULL,
    "user_type" "user_type" NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "contact" TEXT NOT NULL,
    "gender" "gender" NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "address" TEXT[],
    "aadhaar_id" TEXT,
    "registration_photo_id" TEXT,
    "id_photo_id" TEXT,
    "role_id" TEXT NOT NULL,
    "school_id" TEXT,
    "assigned_region_id" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "roll_number" INTEGER NOT NULL,
    "apaar_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "transport_id" TEXT,
    "father_name" TEXT NOT NULL,
    "mother_name" TEXT NOT NULL,
    "father_contact" TEXT NOT NULL,
    "mother_contact" TEXT NOT NULL,
    "father_occupation" TEXT,
    "annual_income" DECIMAL(15,0),
    "accommodation_type" "accommodation_type" NOT NULL,
    "blood_group" "blood_group",
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "designation" TEXT,
    "highest_qualification" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "year_of_passing" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "transport_id" TEXT,
    "pan_card_number" TEXT,
    "blood_group" "blood_group",
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transports" (
    "id" TEXT NOT NULL,
    "type" "transport_type" NOT NULL,
    "license_number" TEXT NOT NULL,
    "vehicle_number" TEXT,
    "school_id" TEXT NOT NULL,
    "owner_first_name" TEXT NOT NULL,
    "owner_last_name" TEXT NOT NULL,
    "driver_first_name" TEXT NOT NULL,
    "driver_last_name" TEXT NOT NULL,
    "driver_date_of_birth" TIMESTAMP(3) NOT NULL,
    "driver_contact" TEXT NOT NULL,
    "driver_gender" "gender" NOT NULL,
    "driver_photo_link" TEXT,
    "conductor_first_name" TEXT NOT NULL,
    "conductor_last_name" TEXT NOT NULL,
    "conductor_date_of_birth" TIMESTAMP(3),
    "conductor_contact" TEXT NOT NULL,
    "conductor_gender" "gender" NOT NULL,
    "conductor_photo_link" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "transports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "contact" TEXT NOT NULL,
    "address" TEXT[],
    "status" "lead_status" NOT NULL DEFAULT 'NEW',
    "comments" TEXT,
    "region_id" TEXT NOT NULL,
    "employee_id" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "school_id" TEXT,
    "student_fee_installments" INTEGER NOT NULL DEFAULT 12,
    "student_fee_amount" INTEGER,
    "current_installement_number" INTEGER NOT NULL,
    "logo_id" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "certificate_number" TEXT NOT NULL,
    "document_url" TEXT,
    "status" "license_status" NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL,
    "receipt_number" TEXT,
    "school_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "base_amount" DECIMAL(10,2) NOT NULL,
    "sgst_percent" DECIMAL(5,2),
    "cgst_percent" DECIMAL(5,2),
    "igst_percent" DECIMAL(5,2),
    "ugst_percent" DECIMAL(5,2),
    "sgst_amount" DECIMAL(10,2),
    "cgst_amount" DECIMAL(10,2),
    "igst_amount" DECIMAL(10,2),
    "ugst_amount" DECIMAL(10,2),
    "total_gst" DECIMAL(10,2),
    "description" TEXT NOT NULL,
    "payment_method" "payment_method" NOT NULL,
    "status" "receipt_status" NOT NULL DEFAULT 'GENERATED',
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date_type" "date_type" NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "till" TIMESTAMP(3) NOT NULL,
    "visible_from" TIMESTAMP(3) NOT NULL,
    "visible_to" TIMESTAMP(3) NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date_type" "date_type" NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "till" TIMESTAMP(3) NOT NULL,
    "visible_from" TIMESTAMP(3) NOT NULL,
    "visible_to" TIMESTAMP(3) NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_calendar" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "visible_from" TIMESTAMP(3) NOT NULL,
    "visible_to" TIMESTAMP(3) NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "exam_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_calendar_items" (
    "id" TEXT NOT NULL,
    "examCalendarId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "exam_calendar_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "visible_from" TIMESTAMP(3) NOT NULL,
    "visible_to" TIMESTAMP(3) NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ExamType" NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fees" (
    "id" TEXT NOT NULL,
    "school_id" TEXT,
    "student_id" TEXT,
    "year" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "total_paid_amount" INTEGER NOT NULL,
    "total_pending_amount" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_installments" (
    "id" TEXT NOT NULL,
    "fee_id" TEXT,
    "school_id" TEXT,
    "student_id" TEXT,
    "installement_number" INTEGER NOT NULL,
    "payment_status" "fee_payment_status" NOT NULL,
    "amount" INTEGER NOT NULL,
    "remaining_amount" INTEGER NOT NULL,
    "paid_amount" INTEGER NOT NULL,
    "paid_at" TIMESTAMP(3),
    "receipt_file_id" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "fee_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grievances" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "grievance_status" NOT NULL DEFAULT 'OPEN',
    "priority" "grievance_priority" NOT NULL DEFAULT 'MEDIUM',
    "created_by_id" TEXT NOT NULL,
    "school_id" TEXT,
    "resolved_by_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "grievances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grievance_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "grievance_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "grievance_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_cards" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "id_card_config_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "id_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_card_collections" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "id_card_collection_status" NOT NULL DEFAULT 'NOT_GENERATED',
    "id_card_config_id" TEXT,
    "file_id" TEXT,
    "generated_at" TIMESTAMP(3),
    "generated_by" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "id_card_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_card_configs" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "template_id" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "sample_id" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "id_card_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salaries" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "salary_structure_id" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "till" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "salaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_structures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "grossMonthlyAmount" INTEGER NOT NULL,
    "netMonthlyAmount" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "salary_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_structure_components" (
    "id" TEXT NOT NULL,
    "salary_structure_id" TEXT,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "salary_component_type" NOT NULL,
    "value" INTEGER NOT NULL,
    "value_type" "salary_component_value_type" NOT NULL,
    "frequency" "salary_component_frequency" NOT NULL,
    "is_base_pay_component" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "salary_structure_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_payments" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "component_amounts" JSONB NOT NULL,
    "slip_id" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "salary_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "templates_type_path_key" ON "templates"("type", "path");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "schools_code_key" ON "schools"("code");

-- CreateIndex
CREATE UNIQUE INDEX "schools_address_key" ON "schools"("address");

-- CreateIndex
CREATE UNIQUE INDEX "schools_email_key" ON "schools"("email");

-- CreateIndex
CREATE UNIQUE INDEX "schools_phone_key" ON "schools"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "classes_grade_division_school_id_key" ON "classes"("grade", "division", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_school_id_key" ON "subjects"("name", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_unique_email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_aadhaar_id_key" ON "users"("aadhaar_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_apaar_id_key" ON "student_profiles"("apaar_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_user_id_key" ON "teacher_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "transports_license_number_key" ON "transports"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "transports_vehicle_number_school_id_key" ON "transports"("vehicle_number", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_certificate_number_key" ON "licenses"("certificate_number");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_receipt_number_key" ON "receipts"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "id_card_collections_school_id_class_id_year_key" ON "id_card_collections"("school_id", "class_id", "year");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_assigned_region_id_fkey" FOREIGN KEY ("assigned_region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_transport_id_fkey" FOREIGN KEY ("transport_id") REFERENCES "transports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_transport_id_fkey" FOREIGN KEY ("transport_id") REFERENCES "transports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievance_comments" ADD CONSTRAINT "grievance_comments_grievance_id_fkey" FOREIGN KEY ("grievance_id") REFERENCES "grievances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievance_comments" ADD CONSTRAINT "grievance_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
