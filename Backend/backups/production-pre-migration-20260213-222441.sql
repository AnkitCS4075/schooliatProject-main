--
-- PostgreSQL database dump
--

\restrict c8nZKfHsyk15DEccHYpfOmhYrx0eWsVbhhMnHaEfeHN0gzqlWgS9MNwIxM6YKi8

-- Dumped from database version 16.11 (Ubuntu 16.11-1.pgdg22.04+1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ExamType; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public."ExamType" AS ENUM (
    'UNIT_TEST',
    'SEMESTER',
    'FINAL'
);


ALTER TYPE public."ExamType" OWNER TO schooliat_user;

--
-- Name: accommodation_type; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.accommodation_type AS ENUM (
    'DAY_SCHOLAR',
    'HOSTELLER'
);


ALTER TYPE public.accommodation_type OWNER TO schooliat_user;

--
-- Name: attendance_status; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.attendance_status AS ENUM (
    'PRESENT',
    'ABSENT',
    'LATE',
    'HALF_DAY'
);


ALTER TYPE public.attendance_status OWNER TO schooliat_user;

--
-- Name: blood_group; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.blood_group AS ENUM (
    'A_POSITIVE',
    'A_NEGATIVE',
    'B_POSITIVE',
    'B_NEGATIVE',
    'AB_POSITIVE',
    'AB_NEGATIVE',
    'O_POSITIVE',
    'O_NEGATIVE'
);


ALTER TYPE public.blood_group OWNER TO schooliat_user;

--
-- Name: conversation_type; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.conversation_type AS ENUM (
    'DIRECT',
    'GROUP',
    'CLASS',
    'SCHOOL'
);


ALTER TYPE public.conversation_type OWNER TO schooliat_user;

--
-- Name: date_type; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.date_type AS ENUM (
    'SINGLE_DATE',
    'DATE_RANGE'
);


ALTER TYPE public.date_type OWNER TO schooliat_user;

--
-- Name: fee_payment_status; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.fee_payment_status AS ENUM (
    'PENDING',
    'PARTIALLY_PAID',
    'PAID'
);


ALTER TYPE public.fee_payment_status OWNER TO schooliat_user;

--
-- Name: gender; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.gender AS ENUM (
    'MALE',
    'FEMALE'
);


ALTER TYPE public.gender OWNER TO schooliat_user;

--
-- Name: grievance_priority; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.grievance_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public.grievance_priority OWNER TO schooliat_user;

--
-- Name: grievance_status; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.grievance_status AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public.grievance_status OWNER TO schooliat_user;

--
-- Name: id_card_collection_status; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.id_card_collection_status AS ENUM (
    'GENERATED',
    'NOT_GENERATED',
    'IN_PROGRESS'
);


ALTER TYPE public.id_card_collection_status OWNER TO schooliat_user;

--
-- Name: lead_status; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.lead_status AS ENUM (
    'NEW',
    'HOT',
    'COLD',
    'FOLLOW_UP',
    'CONVERTED'
);


ALTER TYPE public.lead_status OWNER TO schooliat_user;

--
-- Name: leave_status; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.leave_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public.leave_status OWNER TO schooliat_user;

--
-- Name: license_status; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.license_status AS ENUM (
    'ACTIVE',
    'EXPIRING_SOON',
    'EXPIRED'
);


ALTER TYPE public.license_status OWNER TO schooliat_user;

--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.notification_type AS ENUM (
    'ATTENDANCE',
    'HOMEWORK',
    'EXAM',
    'FEE',
    'LEAVE',
    'ANNOUNCEMENT',
    'GENERAL'
);


ALTER TYPE public.notification_type OWNER TO schooliat_user;

--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.payment_method AS ENUM (
    'BANK_TRANSFER',
    'CASH',
    'CHEQUE',
    'UPI',
    'CREDIT_CARD',
    'DEBIT_CARD'
);


ALTER TYPE public.payment_method OWNER TO schooliat_user;

--
-- Name: permission; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.permission AS ENUM (
    'GET_USERS',
    'CREATE_STUDENT',
    'GET_STUDENTS',
    'EDIT_STUDENT',
    'DELETE_STUDENT',
    'CREATE_TEACHER',
    'GET_TEACHERS',
    'EDIT_TEACHER',
    'DELETE_TEACHER',
    'CREATE_CLASSES',
    'GET_CLASSES',
    'EDIT_CLASSES',
    'DELETE_CLASSES',
    'CREATE_TRANSPORT',
    'GET_TRANSPORTS',
    'EDIT_TRANSPORT',
    'DELETE_TRANSPORT',
    'GET_MY_SCHOOL',
    'CREATE_EMPLOYEE',
    'GET_EMPLOYEES',
    'EDIT_EMPLOYEE',
    'DELETE_EMPLOYEE',
    'CREATE_SCHOOL',
    'GET_SCHOOLS',
    'EDIT_SCHOOL',
    'DELETE_SCHOOL',
    'CREATE_VENDOR',
    'GET_VENDORS',
    'EDIT_VENDOR',
    'DELETE_VENDOR',
    'GET_REGIONS',
    'CREATE_REGION',
    'EDIT_REGION',
    'DELETE_REGION',
    'CREATE_RECEIPT',
    'GET_RECEIPTS',
    'UPDATE_RECEIPT',
    'DELETE_RECEIPT',
    'CREATE_LICENSE',
    'GET_LICENSES',
    'UPDATE_LICENSE',
    'DELETE_LICENSE',
    'CREATE_LOCATION',
    'GET_LOCATIONS',
    'DELETE_LOCATION',
    'GET_STATISTICS',
    'GET_DASHBOARD_STATS',
    'CREATE_EVENT',
    'GET_EVENTS',
    'EDIT_EVENT',
    'DELETE_EVENT',
    'GET_CALENDAR',
    'CREATE_HOLIDAY',
    'GET_HOLIDAYS',
    'EDIT_HOLIDAY',
    'DELETE_HOLIDAY',
    'CREATE_EXAM_CALENDAR',
    'GET_EXAM_CALENDARS',
    'EDIT_EXAM_CALENDAR',
    'DELETE_EXAM_CALENDAR',
    'CREATE_EXAM_CALENDAR_ITEM',
    'GET_EXAM_CALENDAR_ITEMS',
    'EDIT_EXAM_CALENDAR_ITEM',
    'DELETE_EXAM_CALENDAR_ITEM',
    'CREATE_NOTICE',
    'GET_NOTICES',
    'EDIT_NOTICE',
    'DELETE_NOTICE',
    'CREATE_EXAM',
    'GET_EXAMS',
    'EDIT_EXAM',
    'DELETE_EXAM',
    'MANAGE_ID_CARD_CONFIG',
    'GENERATE_ID_CARDS',
    'GET_ID_CARDS',
    'GET_SETTINGS',
    'EDIT_SETTINGS',
    'GET_FEES',
    'RECORD_FEE_PAYMENT',
    'GET_ROLES',
    'CREATE_GRIEVANCE',
    'GET_GRIEVANCES',
    'GET_MY_GRIEVANCES',
    'UPDATE_GRIEVANCE',
    'ADD_GRIEVANCE_COMMENT',
    'MARK_ATTENDANCE',
    'GET_ATTENDANCE',
    'EXPORT_ATTENDANCE',
    'CREATE_TIMETABLE',
    'GET_TIMETABLE',
    'EDIT_TIMETABLE',
    'DELETE_TIMETABLE',
    'CREATE_HOMEWORK',
    'GET_HOMEWORK',
    'EDIT_HOMEWORK',
    'DELETE_HOMEWORK',
    'SUBMIT_HOMEWORK',
    'GRADE_HOMEWORK',
    'ENTER_MARKS',
    'GET_MARKS',
    'EDIT_MARKS',
    'PUBLISH_RESULTS',
    'GET_RESULTS',
    'CREATE_LEAVE_REQUEST',
    'GET_LEAVE_REQUESTS',
    'APPROVE_LEAVE',
    'REJECT_LEAVE',
    'SEND_MESSAGE',
    'GET_MESSAGES',
    'CREATE_ANNOUNCEMENT',
    'SEND_NOTIFICATION'
);


ALTER TYPE public.permission OWNER TO schooliat_user;

--
-- Name: receipt_status; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.receipt_status AS ENUM (
    'GENERATED',
    'PENDING',
    'PAID',
    'CANCELLED'
);


ALTER TYPE public.receipt_status OWNER TO schooliat_user;

--
-- Name: role_name; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.role_name AS ENUM (
    'SUPER_ADMIN',
    'EMPLOYEE',
    'SCHOOL_ADMIN',
    'STUDENT',
    'TEACHER',
    'STAFF'
);


ALTER TYPE public.role_name OWNER TO schooliat_user;

--
-- Name: salary_component_frequency; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.salary_component_frequency AS ENUM (
    'MONTHLY',
    'YEARLY'
);


ALTER TYPE public.salary_component_frequency OWNER TO schooliat_user;

--
-- Name: salary_component_type; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.salary_component_type AS ENUM (
    'GROSS',
    'NET'
);


ALTER TYPE public.salary_component_type OWNER TO schooliat_user;

--
-- Name: salary_component_value_type; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.salary_component_value_type AS ENUM (
    'PERCENTAGE',
    'ABSOLUTE'
);


ALTER TYPE public.salary_component_value_type OWNER TO schooliat_user;

--
-- Name: submission_status; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.submission_status AS ENUM (
    'PENDING',
    'SUBMITTED',
    'GRADED',
    'OVERDUE'
);


ALTER TYPE public.submission_status OWNER TO schooliat_user;

--
-- Name: template_type; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.template_type AS ENUM (
    'ID_CARD',
    'RESULT',
    'INVENTORY_RECEIPT',
    'FEE_RECEIPT'
);


ALTER TYPE public.template_type OWNER TO schooliat_user;

--
-- Name: transport_type; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.transport_type AS ENUM (
    'BUS',
    'VAN',
    'CAR'
);


ALTER TYPE public.transport_type OWNER TO schooliat_user;

--
-- Name: user_type; Type: TYPE; Schema: public; Owner: schooliat_user
--

CREATE TYPE public.user_type AS ENUM (
    'APP',
    'SCHOOL'
);


ALTER TYPE public.user_type OWNER TO schooliat_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO schooliat_user;

--
-- Name: attendance_periods; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.attendance_periods (
    id text NOT NULL,
    name text NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.attendance_periods OWNER TO schooliat_user;

--
-- Name: attendances; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.attendances (
    id text NOT NULL,
    student_id text NOT NULL,
    class_id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    status public.attendance_status NOT NULL,
    period_id text,
    late_arrival_time timestamp(3) without time zone,
    absence_reason text,
    marked_by text NOT NULL,
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.attendances OWNER TO schooliat_user;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    user_id text NOT NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    ip_address text NOT NULL,
    user_agent text,
    changes jsonb,
    result text NOT NULL,
    error_message text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO schooliat_user;

--
-- Name: classes; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.classes (
    id text NOT NULL,
    grade text NOT NULL,
    division text,
    school_id text NOT NULL,
    class_teacher_id text,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.classes OWNER TO schooliat_user;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.conversations (
    id text NOT NULL,
    participants text[],
    type public.conversation_type NOT NULL,
    title text,
    school_id text,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.conversations OWNER TO schooliat_user;

--
-- Name: events; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.events (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    date_type public.date_type NOT NULL,
    "from" timestamp(3) without time zone NOT NULL,
    till timestamp(3) without time zone NOT NULL,
    visible_from timestamp(3) without time zone NOT NULL,
    visible_to timestamp(3) without time zone NOT NULL,
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.events OWNER TO schooliat_user;

--
-- Name: exam_calendar; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.exam_calendar (
    id text NOT NULL,
    class_id text NOT NULL,
    exam_id text NOT NULL,
    title text NOT NULL,
    visible_from timestamp(3) without time zone NOT NULL,
    visible_to timestamp(3) without time zone NOT NULL,
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.exam_calendar OWNER TO schooliat_user;

--
-- Name: exam_calendar_items; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.exam_calendar_items (
    id text NOT NULL,
    "examCalendarId" text NOT NULL,
    subject text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.exam_calendar_items OWNER TO schooliat_user;

--
-- Name: exams; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.exams (
    id text NOT NULL,
    school_id text NOT NULL,
    year integer NOT NULL,
    name text NOT NULL,
    type public."ExamType" NOT NULL
);


ALTER TABLE public.exams OWNER TO schooliat_user;

--
-- Name: fee_installments; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.fee_installments (
    id text NOT NULL,
    fee_id text,
    school_id text,
    student_id text,
    installement_number integer NOT NULL,
    payment_status public.fee_payment_status NOT NULL,
    amount integer NOT NULL,
    remaining_amount integer NOT NULL,
    paid_amount integer NOT NULL,
    paid_at timestamp(3) without time zone,
    receipt_file_id text,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.fee_installments OWNER TO schooliat_user;

--
-- Name: fees; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.fees (
    id text NOT NULL,
    school_id text,
    student_id text,
    year integer NOT NULL,
    total_amount integer NOT NULL,
    total_paid_amount integer NOT NULL,
    total_pending_amount integer NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.fees OWNER TO schooliat_user;

--
-- Name: files; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.files (
    id text NOT NULL,
    extension text NOT NULL,
    name text NOT NULL,
    owner_id text,
    content_type text NOT NULL,
    size integer NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.files OWNER TO schooliat_user;

--
-- Name: grievance_comments; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.grievance_comments (
    id text NOT NULL,
    content text NOT NULL,
    grievance_id text NOT NULL,
    author_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone
);


ALTER TABLE public.grievance_comments OWNER TO schooliat_user;

--
-- Name: grievances; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.grievances (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    status public.grievance_status DEFAULT 'OPEN'::public.grievance_status NOT NULL,
    priority public.grievance_priority DEFAULT 'MEDIUM'::public.grievance_priority NOT NULL,
    created_by_id text NOT NULL,
    school_id text,
    resolved_by_id text,
    resolved_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone
);


ALTER TABLE public.grievances OWNER TO schooliat_user;

--
-- Name: holidays; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.holidays (
    id text NOT NULL,
    title text NOT NULL,
    date_type public.date_type NOT NULL,
    "from" timestamp(3) without time zone NOT NULL,
    till timestamp(3) without time zone NOT NULL,
    visible_from timestamp(3) without time zone NOT NULL,
    visible_to timestamp(3) without time zone NOT NULL,
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.holidays OWNER TO schooliat_user;

--
-- Name: homework_submissions; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.homework_submissions (
    id text NOT NULL,
    homework_id text NOT NULL,
    student_id text NOT NULL,
    submitted_at timestamp(3) without time zone,
    status public.submission_status NOT NULL,
    files text[],
    feedback text,
    grade text,
    marks_obtained integer,
    total_marks integer,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.homework_submissions OWNER TO schooliat_user;

--
-- Name: homeworks; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.homeworks (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    class_ids text[],
    subject_id text NOT NULL,
    teacher_id text NOT NULL,
    due_date timestamp(3) without time zone NOT NULL,
    is_mcq boolean DEFAULT false NOT NULL,
    attachments text[],
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.homeworks OWNER TO schooliat_user;

--
-- Name: id_card_collections; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.id_card_collections (
    id text NOT NULL,
    school_id text NOT NULL,
    class_id text NOT NULL,
    year integer NOT NULL,
    status public.id_card_collection_status DEFAULT 'NOT_GENERATED'::public.id_card_collection_status NOT NULL,
    id_card_config_id text,
    file_id text,
    generated_at timestamp(3) without time zone,
    generated_by text,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.id_card_collections OWNER TO schooliat_user;

--
-- Name: id_card_configs; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.id_card_configs (
    id text NOT NULL,
    school_id text NOT NULL,
    year integer NOT NULL,
    template_id text NOT NULL,
    config jsonb NOT NULL,
    sample_id text,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.id_card_configs OWNER TO schooliat_user;

--
-- Name: id_cards; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.id_cards (
    id text NOT NULL,
    school_id text NOT NULL,
    class_id text NOT NULL,
    student_id text NOT NULL,
    id_card_config_id text NOT NULL,
    file_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.id_cards OWNER TO schooliat_user;

--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.leave_balances (
    id text NOT NULL,
    user_id text NOT NULL,
    leave_type_id text NOT NULL,
    total_leaves integer NOT NULL,
    used_leaves integer DEFAULT 0 NOT NULL,
    remaining_leaves integer NOT NULL,
    year integer NOT NULL,
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.leave_balances OWNER TO schooliat_user;

--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.leave_requests (
    id text NOT NULL,
    user_id text NOT NULL,
    leave_type_id text NOT NULL,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    reason text NOT NULL,
    status public.leave_status DEFAULT 'PENDING'::public.leave_status NOT NULL,
    approved_by text,
    approved_at timestamp(3) without time zone,
    rejection_reason text,
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.leave_requests OWNER TO schooliat_user;

--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.leave_types (
    id text NOT NULL,
    name text NOT NULL,
    max_leaves integer,
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.leave_types OWNER TO schooliat_user;

--
-- Name: licenses; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.licenses (
    id text NOT NULL,
    name text NOT NULL,
    issuer text NOT NULL,
    issue_date timestamp(3) without time zone NOT NULL,
    expiry_date timestamp(3) without time zone NOT NULL,
    certificate_number text NOT NULL,
    document_url text,
    status public.license_status DEFAULT 'ACTIVE'::public.license_status NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.licenses OWNER TO schooliat_user;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.locations (
    id text NOT NULL,
    name text NOT NULL,
    region_id text NOT NULL,
    employee_id text,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.locations OWNER TO schooliat_user;

--
-- Name: marks; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.marks (
    id text NOT NULL,
    exam_id text NOT NULL,
    student_id text NOT NULL,
    subject_id text NOT NULL,
    class_id text NOT NULL,
    marks_obtained numeric(10,2) NOT NULL,
    max_marks numeric(10,2) NOT NULL,
    percentage numeric(5,2) NOT NULL,
    grade text,
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.marks OWNER TO schooliat_user;

--
-- Name: mcq_answers; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.mcq_answers (
    id text NOT NULL,
    submission_id text NOT NULL,
    question_id text NOT NULL,
    selected_answer integer NOT NULL,
    is_correct boolean NOT NULL,
    marks_obtained integer NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.mcq_answers OWNER TO schooliat_user;

--
-- Name: mcq_questions; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.mcq_questions (
    id text NOT NULL,
    homework_id text NOT NULL,
    question text NOT NULL,
    options text[],
    correct_answer integer NOT NULL,
    marks integer NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.mcq_questions OWNER TO schooliat_user;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.messages (
    id text NOT NULL,
    conversation_id text NOT NULL,
    sender_id text NOT NULL,
    content text NOT NULL,
    attachments text[],
    "readBy" text[],
    sent_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.messages OWNER TO schooliat_user;

--
-- Name: notices; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.notices (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    visible_from timestamp(3) without time zone NOT NULL,
    visible_to timestamp(3) without time zone NOT NULL,
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.notices OWNER TO schooliat_user;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    type public.notification_type NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    action_url text,
    school_id text,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.notifications OWNER TO schooliat_user;

--
-- Name: otps; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.otps (
    id text NOT NULL,
    email text NOT NULL,
    otp text NOT NULL,
    purpose text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    used_at timestamp(3) without time zone
);


ALTER TABLE public.otps OWNER TO schooliat_user;

--
-- Name: parent_child_links; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.parent_child_links (
    id text NOT NULL,
    parent_id text NOT NULL,
    child_id text NOT NULL,
    relationship text NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.parent_child_links OWNER TO schooliat_user;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.password_reset_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    used_at timestamp(3) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO schooliat_user;

--
-- Name: receipts; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.receipts (
    id text NOT NULL,
    receipt_number text,
    school_id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    base_amount numeric(10,2) NOT NULL,
    sgst_percent numeric(5,2),
    cgst_percent numeric(5,2),
    igst_percent numeric(5,2),
    ugst_percent numeric(5,2),
    sgst_amount numeric(10,2),
    cgst_amount numeric(10,2),
    igst_amount numeric(10,2),
    ugst_amount numeric(10,2),
    total_gst numeric(10,2),
    description text NOT NULL,
    payment_method public.payment_method NOT NULL,
    status public.receipt_status DEFAULT 'GENERATED'::public.receipt_status NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.receipts OWNER TO schooliat_user;

--
-- Name: regions; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.regions (
    id text NOT NULL,
    name text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.regions OWNER TO schooliat_user;

--
-- Name: results; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.results (
    id text NOT NULL,
    exam_id text NOT NULL,
    student_id text NOT NULL,
    class_id text NOT NULL,
    total_marks numeric(10,2) NOT NULL,
    max_total_marks numeric(10,2) NOT NULL,
    percentage numeric(5,2) NOT NULL,
    cgpa numeric(4,2),
    grade text NOT NULL,
    rank integer,
    is_pass boolean NOT NULL,
    published_at timestamp(3) without time zone,
    published_by text,
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.results OWNER TO schooliat_user;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name public.role_name NOT NULL,
    permissions public.permission[] DEFAULT ARRAY[]::public.permission[],
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.roles OWNER TO schooliat_user;

--
-- Name: salaries; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.salaries (
    id text NOT NULL,
    school_id text NOT NULL,
    teacher_id text NOT NULL,
    salary_structure_id text NOT NULL,
    "from" timestamp(3) without time zone NOT NULL,
    till timestamp(3) without time zone NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.salaries OWNER TO schooliat_user;

--
-- Name: salary_payments; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.salary_payments (
    id text NOT NULL,
    school_id text NOT NULL,
    teacher_id text NOT NULL,
    month text NOT NULL,
    total_amount integer NOT NULL,
    component_amounts jsonb NOT NULL,
    slip_id text,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.salary_payments OWNER TO schooliat_user;

--
-- Name: salary_structure_components; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.salary_structure_components (
    id text NOT NULL,
    salary_structure_id text,
    school_id text NOT NULL,
    name text NOT NULL,
    type public.salary_component_type NOT NULL,
    value integer NOT NULL,
    value_type public.salary_component_value_type NOT NULL,
    frequency public.salary_component_frequency NOT NULL,
    is_base_pay_component boolean DEFAULT false NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.salary_structure_components OWNER TO schooliat_user;

--
-- Name: salary_structures; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.salary_structures (
    id text NOT NULL,
    name text NOT NULL,
    school_id text NOT NULL,
    "grossMonthlyAmount" integer NOT NULL,
    "netMonthlyAmount" integer NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.salary_structures OWNER TO schooliat_user;

--
-- Name: schools; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.schools (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    address text[],
    email text NOT NULL,
    phone text NOT NULL,
    certificate_link text,
    "logoId" text,
    gst_number text,
    principal_name text,
    principal_email text,
    principal_phone text,
    established_year integer,
    board_affiliation text,
    student_strength integer,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.schools OWNER TO schooliat_user;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.settings (
    id text NOT NULL,
    school_id text,
    student_fee_installments integer DEFAULT 12 NOT NULL,
    student_fee_amount integer,
    current_installement_number integer NOT NULL,
    logo_id text,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.settings OWNER TO schooliat_user;

--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.student_profiles (
    id text NOT NULL,
    user_id text NOT NULL,
    roll_number integer NOT NULL,
    apaar_id text NOT NULL,
    class_id text NOT NULL,
    transport_id text,
    father_name text NOT NULL,
    mother_name text NOT NULL,
    father_contact text NOT NULL,
    mother_contact text NOT NULL,
    father_occupation text,
    annual_income numeric(15,0),
    accommodation_type public.accommodation_type NOT NULL,
    blood_group public.blood_group,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.student_profiles OWNER TO schooliat_user;

--
-- Name: subjects; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.subjects (
    id text NOT NULL,
    name text NOT NULL,
    school_id text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.subjects OWNER TO schooliat_user;

--
-- Name: teacher_profiles; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.teacher_profiles (
    id text NOT NULL,
    user_id text NOT NULL,
    designation text,
    highest_qualification text NOT NULL,
    university text NOT NULL,
    year_of_passing integer NOT NULL,
    grade text NOT NULL,
    transport_id text,
    pan_card_number text,
    blood_group public.blood_group,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.teacher_profiles OWNER TO schooliat_user;

--
-- Name: templates; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.templates (
    id text NOT NULL,
    type public.template_type NOT NULL,
    path text NOT NULL,
    image_id text,
    sample_id text,
    title text NOT NULL
);


ALTER TABLE public.templates OWNER TO schooliat_user;

--
-- Name: timetable_slots; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.timetable_slots (
    id text NOT NULL,
    timetable_id text NOT NULL,
    day_of_week integer NOT NULL,
    period_number integer NOT NULL,
    subject_id text NOT NULL,
    teacher_id text NOT NULL,
    room text,
    start_time text NOT NULL,
    end_time text NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.timetable_slots OWNER TO schooliat_user;

--
-- Name: timetables; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.timetables (
    id text NOT NULL,
    name text NOT NULL,
    class_id text,
    school_id text NOT NULL,
    effective_from timestamp(3) without time zone NOT NULL,
    effective_till timestamp(3) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.timetables OWNER TO schooliat_user;

--
-- Name: transports; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.transports (
    id text NOT NULL,
    type public.transport_type NOT NULL,
    license_number text NOT NULL,
    vehicle_number text,
    school_id text NOT NULL,
    owner_first_name text NOT NULL,
    owner_last_name text NOT NULL,
    driver_first_name text NOT NULL,
    driver_last_name text NOT NULL,
    driver_date_of_birth timestamp(3) without time zone NOT NULL,
    driver_contact text NOT NULL,
    driver_gender public.gender NOT NULL,
    driver_photo_link text,
    conductor_first_name text NOT NULL,
    conductor_last_name text NOT NULL,
    conductor_date_of_birth timestamp(3) without time zone,
    conductor_contact text NOT NULL,
    conductor_gender public.gender NOT NULL,
    conductor_photo_link text,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.transports OWNER TO schooliat_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.users (
    id text NOT NULL,
    public_user_id text NOT NULL,
    user_type public.user_type NOT NULL,
    email text NOT NULL,
    password text,
    first_name text NOT NULL,
    last_name text,
    contact text NOT NULL,
    gender public.gender NOT NULL,
    date_of_birth timestamp(3) without time zone NOT NULL,
    address text[],
    aadhaar_id text,
    registration_photo_id text,
    id_photo_id text,
    role_id text NOT NULL,
    school_id text,
    assigned_region_id text,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO schooliat_user;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: schooliat_user
--

CREATE TABLE public.vendors (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    contact text NOT NULL,
    address text[],
    status public.lead_status DEFAULT 'NEW'::public.lead_status NOT NULL,
    comments text,
    region_id text NOT NULL,
    employee_id text,
    created_by text NOT NULL,
    updated_by text,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.vendors OWNER TO schooliat_user;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5a4e41bf-8905-4339-af3c-fc31c03152f5	33f99ff5e98ea526011abe078b897bfb561248acc9f41e49dfd9b892001133dd	2026-01-31 15:46:48.228646+00	20260130193526_init	\N	\N	2026-01-31 15:46:47.999673+00	1
cd0a4651-0253-47c7-b91f-55b577ae3631	722ecfbd4df4a24baea815b3bc0caa0473d5cb81144d17e83ff2a6f6a57fbcbd	2026-01-31 15:46:48.245252+00	20260130194842_add_location_model	\N	\N	2026-01-31 15:46:48.230134+00	1
2ad38f07-4a10-44f4-98fa-bd5b0cc8b7ca	1afc667e8760d9bd887a01cf3c1da643385f512aece09528cb71a6e69606f2a9	2026-01-31 15:46:48.274767+00	20260130200849_add_performance_indexes	\N	\N	2026-01-31 15:46:48.246822+00	1
1d7cdc8b-6c5c-4b10-8936-4b15241acfe5	638bb878324e68ddc499fb882e9dcb71c379aa8ee1c87448e8d7a51ad89d3283	2026-02-09 09:42:12.09416+00	20260209094154_phase2_models	\N	\N	2026-02-09 09:42:12.09416+00	1
\.


--
-- Data for Name: attendance_periods; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.attendance_periods (id, name, start_time, end_time, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.attendances (id, student_id, class_id, date, status, period_id, late_arrival_time, absence_reason, marked_by, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, ip_address, user_agent, changes, result, error_message, "timestamp") FROM stdin;
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.classes (id, grade, division, school_id, class_teacher_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
99965d57-d9a6-46ca-a506-b0af51d3cbed	1	A	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.039	2026-01-31 21:07:25.039	\N
b9dcdb9e-4ff1-4492-98c9-eb0bb77d12aa	2	A	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.043	2026-01-31 21:07:25.043	\N
c03ad09c-d156-431e-a6de-54842ef464f2	3	A	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.046	2026-01-31 21:07:25.046	\N
90111446-8b2c-4c41-9352-3e89e306505d	4	A	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.049	2026-01-31 21:07:25.049	\N
aba77e33-5439-44af-a2d4-7cbebbfe574c	5	A	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.052	2026-01-31 21:07:25.052	\N
d690284e-3d0a-42c3-881e-1c436d95ed70	6	A	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.06	2026-01-31 21:07:25.06	\N
bb84eddb-f8f3-4a7e-a307-72ff03e4829d	6	B	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.064	2026-01-31 21:07:25.064	\N
90b7bc33-30cd-49c1-9dca-415325b8b27b	7	A	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.067	2026-01-31 21:07:25.067	\N
66c44981-b56e-494c-ba81-f29f01ce63bf	7	B	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.072	2026-01-31 21:07:25.072	\N
3d0451c5-1a86-4148-a647-951fe70bb77c	8	A	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.081	2026-01-31 21:07:25.081	\N
fc4b806a-d23f-4dae-b88a-5b6039a471fd	9	A	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.084	2026-01-31 21:07:25.084	\N
b17bccf2-85ab-4823-a330-d65c0a1dc6b2	10	A	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.092	2026-01-31 21:07:25.092	\N
dbc7856d-e503-49ef-b7db-c7fa8fcbb6b8	11	A	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.095	2026-01-31 21:07:25.095	\N
64f9c27d-1919-42bb-8676-186cb5b3cb83	12	A	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-01-31 21:07:25.098	2026-01-31 21:07:25.098	\N
0fa6a2ca-ed5b-4c55-aed5-9d0471755e3c	1	A	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.139	2026-01-31 21:07:25.139	\N
af13ec7a-71d8-4166-ba68-d515846bd235	2	A	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.143	2026-01-31 21:07:25.143	\N
1a62f98d-09ef-45a0-89d7-2ba15237b4e0	3	A	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.147	2026-01-31 21:07:25.147	\N
5b733e1f-7300-4994-aa66-717d94925115	4	A	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.16	2026-01-31 21:07:25.16	\N
0eb92e39-b7e6-4a8e-9bfb-1517fb0b5ce1	5	A	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.164	2026-01-31 21:07:25.164	\N
dd567ff4-dd17-42b2-82f4-d0e991072a3e	6	A	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.167	2026-01-31 21:07:25.167	\N
4d9626ce-1439-4238-8a7d-119f1ae0526a	6	B	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.17	2026-01-31 21:07:25.17	\N
9b22675d-a673-486f-ae61-3be3c3cd6b0a	7	A	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.174	2026-01-31 21:07:25.174	\N
3ae5054e-52d5-46dd-8f65-cfaf46434997	8	A	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.178	2026-01-31 21:07:25.178	\N
42eae334-bb4f-4b14-8870-6e6cd3e756b7	8	B	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.182	2026-01-31 21:07:25.182	\N
f03a0250-0254-4f32-9be7-ab1e0c46a6e1	9	A	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.185	2026-01-31 21:07:25.185	\N
ae551295-5d18-4111-a9a6-3385262c1e9d	9	B	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.188	2026-01-31 21:07:25.188	\N
aeeb944d-d159-4f3f-927f-2143bf3452a6	10	A	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.191	2026-01-31 21:07:25.191	\N
f53f923e-a1d5-43e7-b1c3-943ac8b98947	11	A	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.194	2026-01-31 21:07:25.194	\N
da5c8ab5-1148-4ec5-b709-0c422f2955f6	12	A	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-01-31 21:07:25.198	2026-01-31 21:07:25.198	\N
d41a6879-faa6-470e-9382-d467e9cdfb45	1	A	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.237	2026-01-31 21:07:25.237	\N
e8df4774-5abb-42fd-b7dd-673080482bb9	2	A	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.241	2026-01-31 21:07:25.241	\N
94da982e-86c6-4033-959b-5d6ccb8c3051	3	A	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.246	2026-01-31 21:07:25.246	\N
9c28c8ca-66af-43f4-8460-c737c76e0fd7	4	A	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.251	2026-01-31 21:07:25.251	\N
39646555-1b09-4906-8cf4-d0607030e24d	5	A	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.258	2026-01-31 21:07:25.258	\N
a42643d1-33a2-4cb5-9a48-b8ebadefebe9	6	A	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.261	2026-01-31 21:07:25.261	\N
46d4f4bd-a14f-4599-8fbc-087a87c4b5ba	6	B	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.263	2026-01-31 21:07:25.263	\N
6a312ff6-b23e-4695-92d5-733e40bfd101	7	A	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.266	2026-01-31 21:07:25.266	\N
083aeda9-6c26-4de6-983f-57f80a880b90	7	B	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.269	2026-01-31 21:07:25.269	\N
5775ad6f-83a2-473b-8349-ba8ac24d72e4	8	A	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.272	2026-01-31 21:07:25.272	\N
4cb89199-dd0c-4a01-85d1-f2a52764fc1c	9	A	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.275	2026-01-31 21:07:25.275	\N
9843339a-cbf2-4466-83fe-ed944fc293f9	10	A	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.277	2026-01-31 21:07:25.277	\N
11a888b9-2187-4d73-95cd-028b6652fc1b	11	A	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.283	2026-01-31 21:07:25.283	\N
96906a0b-62f7-4d2a-abf7-ce3f434a09d3	12	A	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-01-31 21:07:25.288	2026-01-31 21:07:25.288	\N
6758ed3f-f026-4fbf-a0ca-a64afc1b725a	8	B	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-02-01 06:31:01.545	2026-02-01 06:31:01.545	\N
80d64ba0-5675-4914-aed9-b8e310583939	7	B	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	seed	\N	\N	2026-02-01 06:31:01.72	2026-02-01 06:31:01.72	\N
87fa69e2-dd1b-4e62-a59f-18dddb460c41	9	B	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	seed	\N	\N	2026-02-01 06:33:27.317	2026-02-01 06:33:27.317	\N
e4b6f2ab-5ebb-4eef-92d8-28f507ecc92e	8	B	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-02-01 06:33:27.451	2026-02-01 06:33:27.451	\N
7de45927-e5b4-47d4-82b4-ffa335b355bb	9	B	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	seed	\N	\N	2026-02-01 06:33:27.458	2026-02-01 06:33:27.458	\N
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.conversations (id, participants, type, title, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.events (id, title, description, date_type, "from", till, visible_from, visible_to, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
eb4fce4e-393a-4356-88f7-a9d3e3bebf6d	Annual Sports Day	School annual sports day with various competitions	SINGLE_DATE	2026-02-15 00:00:00	2026-02-15 00:00:00	2026-01-01 00:00:00	2026-02-20 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.192	2026-01-31 21:07:38.192	\N
84e04dc7-6d6d-419e-bc6e-e40e6be9a3c5	Science Exhibition	Students showcase their science projects	DATE_RANGE	2026-03-10 00:00:00	2026-03-12 00:00:00	2026-02-01 00:00:00	2026-03-15 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.196	2026-01-31 21:07:38.196	\N
b7cf9d21-498a-48ba-a5d4-66fdba9a5a55	Annual Day Celebration	School annual day with cultural programs	SINGLE_DATE	2026-12-20 00:00:00	2026-12-20 00:00:00	2026-11-01 00:00:00	2026-12-25 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.197	2026-01-31 21:07:38.197	\N
634fac3c-05c0-4961-b756-86afd31128f1	Annual Sports Day	School annual sports day with various competitions	SINGLE_DATE	2026-02-15 00:00:00	2026-02-15 00:00:00	2026-01-01 00:00:00	2026-02-20 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.21	2026-01-31 21:07:38.21	\N
d2ac4fab-11e4-40a9-86ed-2e5ae58bb4bb	Science Exhibition	Students showcase their science projects	DATE_RANGE	2026-03-10 00:00:00	2026-03-12 00:00:00	2026-02-01 00:00:00	2026-03-15 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.212	2026-01-31 21:07:38.212	\N
702b6c79-732f-4733-8362-0fbf58efc1e7	Annual Day Celebration	School annual day with cultural programs	SINGLE_DATE	2026-12-20 00:00:00	2026-12-20 00:00:00	2026-11-01 00:00:00	2026-12-25 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.213	2026-01-31 21:07:38.213	\N
5bb5bf19-fc4a-4284-9e0c-3b89c54e12e0	Annual Sports Day	School annual sports day with various competitions	SINGLE_DATE	2026-02-15 00:00:00	2026-02-15 00:00:00	2026-01-01 00:00:00	2026-02-20 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.226	2026-01-31 21:07:38.226	\N
8fcd228f-b4e6-4e18-b39b-f2871f7e89c0	Science Exhibition	Students showcase their science projects	DATE_RANGE	2026-03-10 00:00:00	2026-03-12 00:00:00	2026-02-01 00:00:00	2026-03-15 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.228	2026-01-31 21:07:38.228	\N
e3812ba3-9e59-4f42-afe1-181907ea6934	Annual Day Celebration	School annual day with cultural programs	SINGLE_DATE	2026-12-20 00:00:00	2026-12-20 00:00:00	2026-11-01 00:00:00	2026-12-25 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.23	2026-01-31 21:07:38.23	\N
30cfaa74-8048-4e13-8417-217753a79016	Annual Sports Day	School annual sports day with various competitions	SINGLE_DATE	2026-02-15 00:00:00	2026-02-15 00:00:00	2026-01-01 00:00:00	2026-02-20 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:31:49.953	2026-02-01 06:31:49.953	\N
5a6509b0-97b3-417a-84b6-c81566ac3ee8	Science Exhibition	Students showcase their science projects	DATE_RANGE	2026-03-10 00:00:00	2026-03-12 00:00:00	2026-02-01 00:00:00	2026-03-15 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:31:49.959	2026-02-01 06:31:49.959	\N
4d49a07d-7a07-404a-b30e-72c236a66d17	Annual Day Celebration	School annual day with cultural programs	SINGLE_DATE	2026-12-20 00:00:00	2026-12-20 00:00:00	2026-11-01 00:00:00	2026-12-25 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:31:49.961	2026-02-01 06:31:49.961	\N
9f8f041f-0a2e-440c-9095-f2108073e74c	Annual Sports Day	School annual sports day with various competitions	SINGLE_DATE	2026-02-15 00:00:00	2026-02-15 00:00:00	2026-01-01 00:00:00	2026-02-20 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:49.996	2026-02-01 06:31:49.996	\N
b1280245-ce5a-4449-8792-ff6ce7c2c61f	Science Exhibition	Students showcase their science projects	DATE_RANGE	2026-03-10 00:00:00	2026-03-12 00:00:00	2026-02-01 00:00:00	2026-03-15 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:49.999	2026-02-01 06:31:49.999	\N
8ea05dba-7285-40f2-82bb-1efaf42652df	Annual Day Celebration	School annual day with cultural programs	SINGLE_DATE	2026-12-20 00:00:00	2026-12-20 00:00:00	2026-11-01 00:00:00	2026-12-25 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:50.003	2026-02-01 06:31:50.003	\N
cda9fafb-2b5d-4166-bdbc-02f8b235d086	Annual Sports Day	School annual sports day with various competitions	SINGLE_DATE	2026-02-15 00:00:00	2026-02-15 00:00:00	2026-01-01 00:00:00	2026-02-20 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:31:50.041	2026-02-01 06:31:50.041	\N
987bac78-32d0-4831-8484-4822434155a3	Science Exhibition	Students showcase their science projects	DATE_RANGE	2026-03-10 00:00:00	2026-03-12 00:00:00	2026-02-01 00:00:00	2026-03-15 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:31:50.046	2026-02-01 06:31:50.046	\N
845a340d-8636-420c-a7e5-f04c885047e5	Annual Day Celebration	School annual day with cultural programs	SINGLE_DATE	2026-12-20 00:00:00	2026-12-20 00:00:00	2026-11-01 00:00:00	2026-12-25 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:31:50.049	2026-02-01 06:31:50.049	\N
8211c049-87a1-42f6-b64f-0619b7a50884	Annual Sports Day	School annual sports day with various competitions	SINGLE_DATE	2026-02-15 00:00:00	2026-02-15 00:00:00	2026-01-01 00:00:00	2026-02-20 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:34:35.028	2026-02-01 06:34:35.028	\N
4753025c-ac7f-4fd3-9ec8-62afbc426134	Science Exhibition	Students showcase their science projects	DATE_RANGE	2026-03-10 00:00:00	2026-03-12 00:00:00	2026-02-01 00:00:00	2026-03-15 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:34:35.032	2026-02-01 06:34:35.032	\N
32ccba97-acaf-4578-8b5f-4400ea93153b	Annual Day Celebration	School annual day with cultural programs	SINGLE_DATE	2026-12-20 00:00:00	2026-12-20 00:00:00	2026-11-01 00:00:00	2026-12-25 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:34:35.036	2026-02-01 06:34:35.036	\N
17e84abe-2d3a-4bcb-8b1d-47eaa5a8daed	Annual Sports Day	School annual sports day with various competitions	SINGLE_DATE	2026-02-15 00:00:00	2026-02-15 00:00:00	2026-01-01 00:00:00	2026-02-20 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:34:35.061	2026-02-01 06:34:35.061	\N
adceadc0-cebb-419c-b0cd-f42a752c52b7	Science Exhibition	Students showcase their science projects	DATE_RANGE	2026-03-10 00:00:00	2026-03-12 00:00:00	2026-02-01 00:00:00	2026-03-15 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:34:35.064	2026-02-01 06:34:35.064	\N
72681d92-cf57-4eae-896c-bef6f4a5747f	Annual Day Celebration	School annual day with cultural programs	SINGLE_DATE	2026-12-20 00:00:00	2026-12-20 00:00:00	2026-11-01 00:00:00	2026-12-25 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:34:35.066	2026-02-01 06:34:35.066	\N
9178d9ca-783e-43d3-be21-e5e511e9912e	Annual Sports Day	School annual sports day with various competitions	SINGLE_DATE	2026-02-15 00:00:00	2026-02-15 00:00:00	2026-01-01 00:00:00	2026-02-20 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:34:35.087	2026-02-01 06:34:35.087	\N
85229286-6903-4252-bd4c-c8188b36b721	Science Exhibition	Students showcase their science projects	DATE_RANGE	2026-03-10 00:00:00	2026-03-12 00:00:00	2026-02-01 00:00:00	2026-03-15 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:34:35.09	2026-02-01 06:34:35.09	\N
76e903d5-193e-4a28-87c1-5c823a648365	Annual Day Celebration	School annual day with cultural programs	SINGLE_DATE	2026-12-20 00:00:00	2026-12-20 00:00:00	2026-11-01 00:00:00	2026-12-25 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:34:35.092	2026-02-01 06:34:35.092	\N
b5edc5e1-1807-4a60-8a78-ee9f2a27450b	Annual Sports Day	School annual sports day with various competitions	SINGLE_DATE	2026-02-15 00:00:00	2026-02-15 00:00:00	2026-01-01 00:00:00	2026-02-20 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.221	2026-02-01 06:35:18.221	\N
6f7c61bd-4633-4786-a165-d4f41c22d068	Science Exhibition	Students showcase their science projects	DATE_RANGE	2026-03-10 00:00:00	2026-03-12 00:00:00	2026-02-01 00:00:00	2026-03-15 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.224	2026-02-01 06:35:18.224	\N
c80cd895-0d36-46bd-9887-9ff22e544f66	Annual Day Celebration	School annual day with cultural programs	SINGLE_DATE	2026-12-20 00:00:00	2026-12-20 00:00:00	2026-11-01 00:00:00	2026-12-25 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.228	2026-02-01 06:35:18.228	\N
1a847ab5-36d9-46ea-945e-66ecef3e4912	Annual Sports Day	School annual sports day with various competitions	SINGLE_DATE	2026-02-15 00:00:00	2026-02-15 00:00:00	2026-01-01 00:00:00	2026-02-20 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.253	2026-02-01 06:35:18.253	\N
05d70a8b-7b89-41a9-8b2c-87cd8ce1c2e3	Science Exhibition	Students showcase their science projects	DATE_RANGE	2026-03-10 00:00:00	2026-03-12 00:00:00	2026-02-01 00:00:00	2026-03-15 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.257	2026-02-01 06:35:18.257	\N
c651a511-f124-45ee-824c-6b5a2d7569d9	Annual Day Celebration	School annual day with cultural programs	SINGLE_DATE	2026-12-20 00:00:00	2026-12-20 00:00:00	2026-11-01 00:00:00	2026-12-25 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.262	2026-02-01 06:35:18.262	\N
019e2365-e789-4e2a-912b-d667c6cd0ac0	Annual Sports Day	School annual sports day with various competitions	SINGLE_DATE	2026-02-15 00:00:00	2026-02-15 00:00:00	2026-01-01 00:00:00	2026-02-20 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.283	2026-02-01 06:35:18.283	\N
21ef7cf6-8210-48fe-b45a-792591fe9b91	Science Exhibition	Students showcase their science projects	DATE_RANGE	2026-03-10 00:00:00	2026-03-12 00:00:00	2026-02-01 00:00:00	2026-03-15 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.285	2026-02-01 06:35:18.285	\N
234b35c0-5180-4ff1-a233-aa15ccc87fe4	Annual Day Celebration	School annual day with cultural programs	SINGLE_DATE	2026-12-20 00:00:00	2026-12-20 00:00:00	2026-11-01 00:00:00	2026-12-25 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.288	2026-02-01 06:35:18.288	\N
\.


--
-- Data for Name: exam_calendar; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.exam_calendar (id, class_id, exam_id, title, visible_from, visible_to, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
3b7bdb2e-cc70-4b2e-9aaa-dfc55328d92d	99965d57-d9a6-46ca-a506-b0af51d3cbed	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.744	2026-01-31 21:07:37.744	\N
c4c970f2-a920-4af8-b2d3-02840410eb5c	b9dcdb9e-4ff1-4492-98c9-eb0bb77d12aa	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.757	2026-01-31 21:07:37.757	\N
fb63cf44-4e54-4f37-8331-be17c5bc6fa2	c03ad09c-d156-431e-a6de-54842ef464f2	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.765	2026-01-31 21:07:37.765	\N
9303d9d1-b938-4ff1-b6a7-2e14c96db21b	90111446-8b2c-4c41-9352-3e89e306505d	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.774	2026-01-31 21:07:37.774	\N
2a06657a-342e-4d75-960f-ef71679eff2d	aba77e33-5439-44af-a2d4-7cbebbfe574c	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.783	2026-01-31 21:07:37.783	\N
be80d37c-c6b5-4635-8d19-02deeae9337c	d690284e-3d0a-42c3-881e-1c436d95ed70	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.792	2026-01-31 21:07:37.792	\N
f40dbdc5-899f-49e8-9bea-a14c4311dd81	bb84eddb-f8f3-4a7e-a307-72ff03e4829d	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.8	2026-01-31 21:07:37.8	\N
973f9216-7750-49ed-91ca-493c578e6369	90b7bc33-30cd-49c1-9dca-415325b8b27b	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.809	2026-01-31 21:07:37.809	\N
00c9e821-c0c5-4711-b8da-4327d1a6d100	66c44981-b56e-494c-ba81-f29f01ce63bf	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.817	2026-01-31 21:07:37.817	\N
1fca4c15-f1a7-476a-bebe-50a54190a67b	3d0451c5-1a86-4148-a647-951fe70bb77c	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.828	2026-01-31 21:07:37.828	\N
6b6381da-35d4-4330-aa89-e5f71a76525e	fc4b806a-d23f-4dae-b88a-5b6039a471fd	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.839	2026-01-31 21:07:37.839	\N
5e01a572-1fd7-4916-bd70-30b68f323c58	b17bccf2-85ab-4823-a330-d65c0a1dc6b2	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.865	2026-01-31 21:07:37.865	\N
e0909d5a-d0ad-4033-bd86-527a8f072a16	dbc7856d-e503-49ef-b7db-c7fa8fcbb6b8	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.876	2026-01-31 21:07:37.876	\N
19036c98-bb4a-41ca-b1a1-678714f366b0	64f9c27d-1919-42bb-8676-186cb5b3cb83	ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.884	2026-01-31 21:07:37.884	\N
d6294988-3a7e-4875-ae7b-0dd6572c96f0	0fa6a2ca-ed5b-4c55-aed5-9d0471755e3c	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.901	2026-01-31 21:07:37.901	\N
a1c33dd5-e9f8-47a7-aecc-753a83c6b677	af13ec7a-71d8-4166-ba68-d515846bd235	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.91	2026-01-31 21:07:37.91	\N
eee2e9f2-9c8b-47a5-80a1-fdfdf63aedfe	1a62f98d-09ef-45a0-89d7-2ba15237b4e0	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.919	2026-01-31 21:07:37.919	\N
9b5a46f2-cfcf-4301-8d44-a1f8ff64a5ea	5b733e1f-7300-4994-aa66-717d94925115	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.926	2026-01-31 21:07:37.926	\N
7fa977e7-f516-4f17-a88b-72415c3d4af8	0eb92e39-b7e6-4a8e-9bfb-1517fb0b5ce1	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.937	2026-01-31 21:07:37.937	\N
a0930960-e8a8-4a2d-bd17-84af970932ba	dd567ff4-dd17-42b2-82f4-d0e991072a3e	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.947	2026-01-31 21:07:37.947	\N
0b23e7f3-fc71-4f41-83d2-f7f25a915200	4d9626ce-1439-4238-8a7d-119f1ae0526a	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.955	2026-01-31 21:07:37.955	\N
54917eb0-5e52-446e-9693-04979ac97068	9b22675d-a673-486f-ae61-3be3c3cd6b0a	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.966	2026-01-31 21:07:37.966	\N
282413ce-7bad-46f3-be9f-7a2ca18dfa75	3ae5054e-52d5-46dd-8f65-cfaf46434997	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.977	2026-01-31 21:07:37.977	\N
9ec168bf-a1fa-4bd1-9fc9-9cd25541d798	42eae334-bb4f-4b14-8870-6e6cd3e756b7	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.989	2026-01-31 21:07:37.989	\N
749b7f6f-a08e-41c0-b2b3-85888f3b1aeb	f03a0250-0254-4f32-9be7-ab1e0c46a6e1	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.999	2026-01-31 21:07:37.999	\N
9cd30afe-d533-4715-bc82-8aae42cd3263	ae551295-5d18-4111-a9a6-3385262c1e9d	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.011	2026-01-31 21:07:38.011	\N
91ea92cd-5c7f-4cdf-912c-641a98bfe0da	aeeb944d-d159-4f3f-927f-2143bf3452a6	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.023	2026-01-31 21:07:38.023	\N
e0412880-3999-44eb-a41e-591226e2ca0e	f53f923e-a1d5-43e7-b1c3-943ac8b98947	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.032	2026-01-31 21:07:38.032	\N
3439483e-6a6f-4485-a60b-329f5b8456bf	da5c8ab5-1148-4ec5-b709-0c422f2955f6	5a8e7824-1fc2-40ef-8eda-c50581b5aa01	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.041	2026-01-31 21:07:38.041	\N
01becfe2-f572-47a5-ace0-6bfb05d5c0b2	d41a6879-faa6-470e-9382-d467e9cdfb45	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.059	2026-01-31 21:07:38.059	\N
a74e8dc8-7356-4cf5-ac3e-1e60ef82829c	e8df4774-5abb-42fd-b7dd-673080482bb9	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.07	2026-01-31 21:07:38.07	\N
0de7564b-1032-46d2-a5f5-64a637c35cf9	94da982e-86c6-4033-959b-5d6ccb8c3051	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.081	2026-01-31 21:07:38.081	\N
14c55654-1e41-498b-b965-301e729ff4b0	9c28c8ca-66af-43f4-8460-c737c76e0fd7	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.092	2026-01-31 21:07:38.092	\N
b71c0ddc-e513-4931-b0d0-a391f1288ffe	39646555-1b09-4906-8cf4-d0607030e24d	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.102	2026-01-31 21:07:38.102	\N
19252577-36aa-4749-804c-1b2dca9baf4e	a42643d1-33a2-4cb5-9a48-b8ebadefebe9	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.111	2026-01-31 21:07:38.111	\N
5308b794-2064-4c9c-9042-692de485336b	46d4f4bd-a14f-4599-8fbc-087a87c4b5ba	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.121	2026-01-31 21:07:38.121	\N
aa03f213-fcd6-418d-849f-013cbe0a98a5	6a312ff6-b23e-4695-92d5-733e40bfd101	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.13	2026-01-31 21:07:38.13	\N
9a0ffc4e-dc84-479f-ad4c-e221eb6d17e2	083aeda9-6c26-4de6-983f-57f80a880b90	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.14	2026-01-31 21:07:38.14	\N
d02128f8-089e-43f9-baf9-be5f75ea2220	5775ad6f-83a2-473b-8349-ba8ac24d72e4	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.149	2026-01-31 21:07:38.149	\N
776ed347-08bd-4e78-8368-4019fad763aa	4cb89199-dd0c-4a01-85d1-f2a52764fc1c	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.157	2026-01-31 21:07:38.157	\N
4623eb0d-0fe3-4211-8ade-22c80c82d879	9843339a-cbf2-4466-83fe-ed944fc293f9	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.164	2026-01-31 21:07:38.164	\N
163885b1-2bc0-46e7-8e11-55636bbff050	11a888b9-2187-4d73-95cd-028b6652fc1b	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.173	2026-01-31 21:07:38.173	\N
537bcd9b-8d76-49e3-a7a6-22a3733c9ef8	96906a0b-62f7-4d2a-abf7-ce3f434a09d3	c70fb64f-286b-4179-b508-2f1cfc8151d4	Exam Calendar for First Unit Test	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.184	2026-01-31 21:07:38.184	\N
\.


--
-- Data for Name: exam_calendar_items; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.exam_calendar_items (id, "examCalendarId", subject, date, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
55b25b99-0a67-437c-974c-1864ce035d35	3b7bdb2e-cc70-4b2e-9aaa-dfc55328d92d	Mathematics	2026-03-12 15:33:05.82	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.747	2026-01-31 21:07:37.747	\N
29ee859b-ec69-40e2-8e48-61f4b577975c	3b7bdb2e-cc70-4b2e-9aaa-dfc55328d92d	English	2026-03-26 09:31:40.78	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.75	2026-01-31 21:07:37.75	\N
8c9047f8-4013-4c2c-9fb0-de404534cbf0	3b7bdb2e-cc70-4b2e-9aaa-dfc55328d92d	Science	2026-03-18 13:13:28.216	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.752	2026-01-31 21:07:37.752	\N
585a1d36-7963-4962-9103-c99b41017014	3b7bdb2e-cc70-4b2e-9aaa-dfc55328d92d	Social Studies	2026-03-06 17:56:33.579	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.754	2026-01-31 21:07:37.754	\N
c3f60ffb-8579-4006-a66b-1a51cb1e9d68	3b7bdb2e-cc70-4b2e-9aaa-dfc55328d92d	Hindi	2026-03-02 22:18:07.294	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.755	2026-01-31 21:07:37.755	\N
6be012a9-8f81-498c-8234-4aa5575eaa1f	c4c970f2-a920-4af8-b2d3-02840410eb5c	Mathematics	2026-03-29 11:49:26.947	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.758	2026-01-31 21:07:37.758	\N
f47f5916-1905-40e2-8e72-730e3421d4b9	c4c970f2-a920-4af8-b2d3-02840410eb5c	English	2026-03-23 02:54:53.164	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.759	2026-01-31 21:07:37.759	\N
fd701bc7-2457-4952-b1fb-a2853284840a	c4c970f2-a920-4af8-b2d3-02840410eb5c	Science	2026-03-24 05:15:04.471	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.761	2026-01-31 21:07:37.761	\N
a4c514ca-da9c-42b8-8a0a-69ea36b5778e	c4c970f2-a920-4af8-b2d3-02840410eb5c	Social Studies	2026-03-06 16:02:12.386	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.762	2026-01-31 21:07:37.762	\N
b9de921a-b9b7-4dc7-81b4-119d8a61494a	c4c970f2-a920-4af8-b2d3-02840410eb5c	Hindi	2026-03-02 17:08:39.212	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.764	2026-01-31 21:07:37.764	\N
aeb7ae4b-bf01-4ae8-97a7-927c81a4aea9	fb63cf44-4e54-4f37-8331-be17c5bc6fa2	Mathematics	2026-03-05 23:06:06.645	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.767	2026-01-31 21:07:37.767	\N
e25b7347-b127-45fa-8904-5bde691afdf2	fb63cf44-4e54-4f37-8331-be17c5bc6fa2	English	2026-03-07 14:08:12.435	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.769	2026-01-31 21:07:37.769	\N
96213d99-51d5-43b0-b7e5-90599c4b75f4	fb63cf44-4e54-4f37-8331-be17c5bc6fa2	Science	2026-03-30 15:13:09.943	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.77	2026-01-31 21:07:37.77	\N
67719ff8-6d86-4dd7-86fc-d992230a5a3a	fb63cf44-4e54-4f37-8331-be17c5bc6fa2	Social Studies	2026-03-03 04:45:11.059	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.771	2026-01-31 21:07:37.771	\N
53e2bc5e-64ad-45ce-8cc3-ce93dc9919c5	fb63cf44-4e54-4f37-8331-be17c5bc6fa2	Hindi	2026-03-21 20:38:23.875	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.773	2026-01-31 21:07:37.773	\N
dc59f003-008c-4d25-a535-a7223831ec51	9303d9d1-b938-4ff1-b6a7-2e14c96db21b	Mathematics	2026-03-06 20:29:05.284	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.776	2026-01-31 21:07:37.776	\N
1e4ce993-fae1-493d-b7cb-59601ca5e26e	9303d9d1-b938-4ff1-b6a7-2e14c96db21b	English	2026-03-11 21:10:31.413	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.777	2026-01-31 21:07:37.777	\N
de9b8e11-fba6-4b94-9dd0-75dcd71dacbd	9303d9d1-b938-4ff1-b6a7-2e14c96db21b	Science	2026-03-02 22:13:08.742	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.779	2026-01-31 21:07:37.779	\N
81f3fb0b-2e07-423f-a844-648b366dfbf8	9303d9d1-b938-4ff1-b6a7-2e14c96db21b	Social Studies	2026-03-02 15:13:59.317	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.78	2026-01-31 21:07:37.78	\N
3afcb6be-c3f4-40bc-8964-02d3a67528b2	9303d9d1-b938-4ff1-b6a7-2e14c96db21b	Hindi	2026-03-04 19:44:52.664	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.782	2026-01-31 21:07:37.782	\N
8d94a4a8-4aa8-4536-949c-fa9cf0e64392	2a06657a-342e-4d75-960f-ef71679eff2d	Mathematics	2026-03-26 02:52:23.244	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.785	2026-01-31 21:07:37.785	\N
b7cd378c-68c9-4aa1-933d-8eadfae311c0	2a06657a-342e-4d75-960f-ef71679eff2d	English	2026-03-27 05:20:22.367	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.786	2026-01-31 21:07:37.786	\N
645a4082-1003-4681-a4b3-70fcacaf99cb	2a06657a-342e-4d75-960f-ef71679eff2d	Science	2026-03-30 18:25:49.906	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.788	2026-01-31 21:07:37.788	\N
48f9fd62-2002-43cc-8edb-38ec7e6f43c2	2a06657a-342e-4d75-960f-ef71679eff2d	Social Studies	2026-03-13 10:23:26.417	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.789	2026-01-31 21:07:37.789	\N
4babbab6-3dc6-40c7-9792-afd6f434ef52	2a06657a-342e-4d75-960f-ef71679eff2d	Hindi	2026-03-30 21:02:24.283	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.79	2026-01-31 21:07:37.79	\N
a087119b-55a3-4815-b378-8da0a886cfbd	be80d37c-c6b5-4635-8d19-02deeae9337c	Mathematics	2026-03-28 23:21:40.805	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.793	2026-01-31 21:07:37.793	\N
dccd8363-10ec-453f-82d1-f3fbfee28631	be80d37c-c6b5-4635-8d19-02deeae9337c	English	2026-03-11 23:10:10.322	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.794	2026-01-31 21:07:37.794	\N
2da416cc-b4b8-4274-9d84-89d219ee0aa0	be80d37c-c6b5-4635-8d19-02deeae9337c	Science	2026-03-12 14:45:13.881	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.796	2026-01-31 21:07:37.796	\N
c95ccf0f-eee3-43ac-8b40-f4cb3aae816c	be80d37c-c6b5-4635-8d19-02deeae9337c	Social Studies	2026-03-09 11:45:33.033	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.797	2026-01-31 21:07:37.797	\N
270e8958-12f3-4c8a-af1f-ac2746d58e07	be80d37c-c6b5-4635-8d19-02deeae9337c	Hindi	2026-03-28 00:52:08.097	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.798	2026-01-31 21:07:37.798	\N
2e4d6ca2-06af-42a8-8c91-54acee221525	f40dbdc5-899f-49e8-9bea-a14c4311dd81	Mathematics	2026-03-04 04:30:07.449	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.801	2026-01-31 21:07:37.801	\N
08699ecd-139d-434d-8bd9-a19ddbcf0f50	f40dbdc5-899f-49e8-9bea-a14c4311dd81	English	2026-03-15 23:39:20.796	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.803	2026-01-31 21:07:37.803	\N
7dbd6ff1-39fb-4451-afb1-56f1944cf336	f40dbdc5-899f-49e8-9bea-a14c4311dd81	Science	2026-03-24 08:57:21.767	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.804	2026-01-31 21:07:37.804	\N
868fc0a6-8aee-4019-91ac-f31371d945bd	f40dbdc5-899f-49e8-9bea-a14c4311dd81	Social Studies	2026-03-18 10:01:23.487	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.806	2026-01-31 21:07:37.806	\N
2a5e48b3-b7f3-42ca-9cd8-4883ce849cc2	f40dbdc5-899f-49e8-9bea-a14c4311dd81	Hindi	2026-03-20 02:32:52.343	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.807	2026-01-31 21:07:37.807	\N
24048059-e7e1-4625-a214-28deac53dd04	973f9216-7750-49ed-91ca-493c578e6369	Mathematics	2026-03-18 16:08:05.605	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.811	2026-01-31 21:07:37.811	\N
fef685de-d7ff-4ec2-8bb2-bb9cb5b91307	973f9216-7750-49ed-91ca-493c578e6369	English	2026-03-17 06:47:20.368	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.812	2026-01-31 21:07:37.812	\N
79bee215-2583-416c-8ac2-493c5db58908	973f9216-7750-49ed-91ca-493c578e6369	Science	2026-03-19 02:50:03.398	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.813	2026-01-31 21:07:37.813	\N
53990713-b95b-49dd-bee2-8dca059281c8	973f9216-7750-49ed-91ca-493c578e6369	Social Studies	2026-03-10 23:43:38.832	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.814	2026-01-31 21:07:37.814	\N
cf5ee0fc-c0d2-4489-ad8e-108a67d959d1	973f9216-7750-49ed-91ca-493c578e6369	Hindi	2026-03-11 04:17:32.284	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.815	2026-01-31 21:07:37.815	\N
8cc715a4-4423-47c1-9b6d-b86ec4619b40	00c9e821-c0c5-4711-b8da-4327d1a6d100	Mathematics	2026-03-05 14:48:10.066	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.818	2026-01-31 21:07:37.818	\N
9bf23b52-270d-4e42-8190-6e6f92eac444	00c9e821-c0c5-4711-b8da-4327d1a6d100	English	2026-03-17 18:10:09.493	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.82	2026-01-31 21:07:37.82	\N
c2547448-60da-47eb-a953-600db6a541c1	00c9e821-c0c5-4711-b8da-4327d1a6d100	Science	2026-03-13 04:04:55.156	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.821	2026-01-31 21:07:37.821	\N
6838abc3-ae9a-409b-adb4-49b12cfe8c2e	00c9e821-c0c5-4711-b8da-4327d1a6d100	Social Studies	2026-03-28 17:56:22.354	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.823	2026-01-31 21:07:37.823	\N
aefe3572-4826-47d4-8e0c-0013c17080cd	00c9e821-c0c5-4711-b8da-4327d1a6d100	Hindi	2026-03-05 17:23:11.759	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.826	2026-01-31 21:07:37.826	\N
7eed9a4d-eb51-4d89-8967-766a12918d6c	1fca4c15-f1a7-476a-bebe-50a54190a67b	Mathematics	2026-03-05 09:26:13.446	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.829	2026-01-31 21:07:37.829	\N
b411eca7-5f37-4156-a597-e611aee417b9	1fca4c15-f1a7-476a-bebe-50a54190a67b	English	2026-03-10 12:37:02.824	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.832	2026-01-31 21:07:37.832	\N
27d4e65d-af8c-40aa-bc1c-1fa26fa0ec79	1fca4c15-f1a7-476a-bebe-50a54190a67b	Science	2026-03-04 07:36:14.272	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.834	2026-01-31 21:07:37.834	\N
c2a4365b-91ce-4d77-a944-55d3d7d8c61b	1fca4c15-f1a7-476a-bebe-50a54190a67b	Social Studies	2026-03-23 05:43:31.85	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.835	2026-01-31 21:07:37.835	\N
608c31bb-5944-438e-8949-8c0c74572652	1fca4c15-f1a7-476a-bebe-50a54190a67b	Hindi	2026-03-11 03:30:33.476	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.838	2026-01-31 21:07:37.838	\N
92d7523e-1783-4c6c-9f97-5933e3a98578	6b6381da-35d4-4330-aa89-e5f71a76525e	Mathematics	2026-03-29 20:06:13.494	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.841	2026-01-31 21:07:37.841	\N
bd456055-21b7-4041-9639-caa457aa2d64	6b6381da-35d4-4330-aa89-e5f71a76525e	English	2026-03-21 02:07:45.965	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.843	2026-01-31 21:07:37.843	\N
e6836c4b-9d90-4ea2-b093-424c0a11c7f7	6b6381da-35d4-4330-aa89-e5f71a76525e	Science	2026-03-16 10:32:42.839	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.859	2026-01-31 21:07:37.859	\N
4c28a256-f081-4abc-b0a0-76c9d2251afd	6b6381da-35d4-4330-aa89-e5f71a76525e	Social Studies	2026-03-14 11:10:09.513	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.861	2026-01-31 21:07:37.861	\N
fe0538c0-2aae-4b0c-b4a9-de79f8e8f66b	6b6381da-35d4-4330-aa89-e5f71a76525e	Hindi	2026-03-09 06:18:44.576	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.863	2026-01-31 21:07:37.863	\N
f2871ab6-9795-4fa5-aad7-f031580465e7	5e01a572-1fd7-4916-bd70-30b68f323c58	Mathematics	2026-03-08 23:48:36.298	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.867	2026-01-31 21:07:37.867	\N
c0750ac8-0352-4473-a0e8-5e56eea99f3c	5e01a572-1fd7-4916-bd70-30b68f323c58	English	2026-03-28 06:51:14.037	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.869	2026-01-31 21:07:37.869	\N
669dce18-fdc5-42c0-9a02-3aecf9141dc9	5e01a572-1fd7-4916-bd70-30b68f323c58	Science	2026-03-17 18:05:27.426	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.87	2026-01-31 21:07:37.87	\N
2a9265e2-e74e-4953-b1eb-0da3c9a5c7c3	5e01a572-1fd7-4916-bd70-30b68f323c58	Social Studies	2026-03-07 14:35:05.444	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.872	2026-01-31 21:07:37.872	\N
d71c1828-647d-4239-a453-5861fc4cf31c	5e01a572-1fd7-4916-bd70-30b68f323c58	Hindi	2026-03-14 14:51:36.581	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.874	2026-01-31 21:07:37.874	\N
46484839-8e08-4be1-8e4e-da35bd211f47	e0909d5a-d0ad-4033-bd86-527a8f072a16	Mathematics	2026-03-27 20:53:30.977	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.877	2026-01-31 21:07:37.877	\N
57545225-08d6-4e6b-a125-015bb2f36d3e	e0909d5a-d0ad-4033-bd86-527a8f072a16	English	2026-03-25 01:54:58.508	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.879	2026-01-31 21:07:37.879	\N
eba28f44-7453-46e5-b73f-efbb57a84569	e0909d5a-d0ad-4033-bd86-527a8f072a16	Science	2026-03-08 02:34:26.69	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.88	2026-01-31 21:07:37.88	\N
2ec7717c-fc03-40a9-848a-bfb07b9c4b80	e0909d5a-d0ad-4033-bd86-527a8f072a16	Social Studies	2026-03-30 05:06:13.902	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.881	2026-01-31 21:07:37.881	\N
642879d8-fa10-4786-985c-7f35446295d4	e0909d5a-d0ad-4033-bd86-527a8f072a16	Hindi	2026-03-26 14:48:12.037	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.882	2026-01-31 21:07:37.882	\N
b2a56611-e700-44b2-944a-bc4a558bb6bb	19036c98-bb4a-41ca-b1a1-678714f366b0	Mathematics	2026-03-28 22:25:22.094	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.885	2026-01-31 21:07:37.885	\N
a64a8edb-68d4-4eea-8989-45a90ce1ba5a	19036c98-bb4a-41ca-b1a1-678714f366b0	English	2026-03-26 01:13:34.303	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.886	2026-01-31 21:07:37.886	\N
c5d986a3-ac7f-42f7-a56f-4eb93978eb92	19036c98-bb4a-41ca-b1a1-678714f366b0	Science	2026-03-28 14:38:53.74	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.888	2026-01-31 21:07:37.888	\N
a7bafa48-cba8-4796-b7d8-3e4c978bdf0f	19036c98-bb4a-41ca-b1a1-678714f366b0	Social Studies	2026-03-02 02:26:59.499	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.889	2026-01-31 21:07:37.889	\N
0ac214fd-67ab-4849-b24c-ba6f6f53e630	19036c98-bb4a-41ca-b1a1-678714f366b0	Hindi	2026-03-02 21:58:21.463	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:37.89	2026-01-31 21:07:37.89	\N
e900b627-5787-4210-b4a3-e0e3b19aa320	d6294988-3a7e-4875-ae7b-0dd6572c96f0	Mathematics	2026-03-26 21:45:56.926	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.902	2026-01-31 21:07:37.902	\N
105d0d70-01c0-4ade-9887-11b5bfcb9aeb	d6294988-3a7e-4875-ae7b-0dd6572c96f0	English	2026-03-19 22:00:26.895	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.904	2026-01-31 21:07:37.904	\N
75a4254b-d4cd-4fb8-950b-5a2c7dcaeb36	d6294988-3a7e-4875-ae7b-0dd6572c96f0	Science	2026-03-05 04:26:47.037	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.906	2026-01-31 21:07:37.906	\N
f0b1895a-6e5e-4cea-9a7c-b6aba1158325	d6294988-3a7e-4875-ae7b-0dd6572c96f0	Social Studies	2026-03-01 11:24:33.649	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.907	2026-01-31 21:07:37.907	\N
f6bb92cb-ffc9-47b3-ba7a-619e7209e0f6	d6294988-3a7e-4875-ae7b-0dd6572c96f0	Hindi	2026-03-03 21:23:02.417	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.909	2026-01-31 21:07:37.909	\N
eb026b0a-208d-4196-a059-039d9798cc66	a1c33dd5-e9f8-47a7-aecc-753a83c6b677	Mathematics	2026-03-21 04:25:42.164	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.912	2026-01-31 21:07:37.912	\N
7b823af6-1b97-49cc-ba4f-ece7188c5aac	a1c33dd5-e9f8-47a7-aecc-753a83c6b677	English	2026-03-08 01:07:06.352	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.914	2026-01-31 21:07:37.914	\N
e8eb7929-fae7-423e-92e1-8f304eed20eb	a1c33dd5-e9f8-47a7-aecc-753a83c6b677	Science	2026-03-01 01:51:46.195	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.915	2026-01-31 21:07:37.915	\N
bfc8a2b9-9c5a-4814-a9df-2b0a0fff1310	a1c33dd5-e9f8-47a7-aecc-753a83c6b677	Social Studies	2026-03-29 02:39:17.495	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.916	2026-01-31 21:07:37.916	\N
8409a64c-4d27-4500-b767-dcea2837b6e2	a1c33dd5-e9f8-47a7-aecc-753a83c6b677	Hindi	2026-03-13 00:45:53.518	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.917	2026-01-31 21:07:37.917	\N
bdc39747-2d60-48b1-bcba-4608132ed3c5	eee2e9f2-9c8b-47a5-80a1-fdfdf63aedfe	Mathematics	2026-03-13 11:54:54.889	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.92	2026-01-31 21:07:37.92	\N
0d6a13ee-f22c-4f23-9d86-d8ca3afa9c45	eee2e9f2-9c8b-47a5-80a1-fdfdf63aedfe	English	2026-03-17 18:56:37.055	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.921	2026-01-31 21:07:37.921	\N
8b234903-8fe6-4fe1-8e4c-23c9af94b95c	eee2e9f2-9c8b-47a5-80a1-fdfdf63aedfe	Science	2026-03-28 11:29:05.663	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.922	2026-01-31 21:07:37.922	\N
4c7d0e28-d3cd-48dc-9099-133cf25920dc	eee2e9f2-9c8b-47a5-80a1-fdfdf63aedfe	Social Studies	2026-03-10 05:45:43.387	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.923	2026-01-31 21:07:37.923	\N
9623f2e0-e6ef-4d6e-aad9-bece6576b6f9	eee2e9f2-9c8b-47a5-80a1-fdfdf63aedfe	Hindi	2026-03-14 13:42:52.468	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.925	2026-01-31 21:07:37.925	\N
6e9648c2-5c90-45af-b439-5a7ae5e45130	9b5a46f2-cfcf-4301-8d44-a1f8ff64a5ea	Mathematics	2026-03-09 17:22:03.09	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.928	2026-01-31 21:07:37.928	\N
9630e7cc-ee29-43b5-9012-e4f380e8c0a5	9b5a46f2-cfcf-4301-8d44-a1f8ff64a5ea	English	2026-03-26 03:54:41.087	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.93	2026-01-31 21:07:37.93	\N
e6a75491-867c-41f7-a595-16fa7662068b	9b5a46f2-cfcf-4301-8d44-a1f8ff64a5ea	Science	2026-03-10 23:49:58.741	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.932	2026-01-31 21:07:37.932	\N
dc91a09c-5c47-4224-8ce6-6f471b5ac165	9b5a46f2-cfcf-4301-8d44-a1f8ff64a5ea	Social Studies	2026-03-27 11:47:09.475	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.934	2026-01-31 21:07:37.934	\N
fe82992e-b2b3-4eb4-ad49-d3cbddc6f815	9b5a46f2-cfcf-4301-8d44-a1f8ff64a5ea	Hindi	2026-03-29 14:24:45	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.935	2026-01-31 21:07:37.935	\N
75fc6c3d-40da-4e54-a636-b455c5098aa7	7fa977e7-f516-4f17-a88b-72415c3d4af8	Mathematics	2026-03-19 15:04:36.258	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.938	2026-01-31 21:07:37.938	\N
9914043c-7aec-4dc4-8481-20efb713181e	7fa977e7-f516-4f17-a88b-72415c3d4af8	English	2026-03-01 19:18:40.516	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.939	2026-01-31 21:07:37.939	\N
c6165657-cf3c-413f-b769-d1d47c8c8a41	7fa977e7-f516-4f17-a88b-72415c3d4af8	Science	2026-03-23 16:42:35.033	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.941	2026-01-31 21:07:37.941	\N
1a14154f-e46c-4096-97ca-a089f08a29b4	7fa977e7-f516-4f17-a88b-72415c3d4af8	Social Studies	2026-03-29 15:09:32.579	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.943	2026-01-31 21:07:37.943	\N
9285d7db-2c15-4e45-89b5-6e79c0214e90	7fa977e7-f516-4f17-a88b-72415c3d4af8	Hindi	2026-03-09 08:42:52.518	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.945	2026-01-31 21:07:37.945	\N
39faba1a-afca-4e3b-9021-7f24b59f14d0	a0930960-e8a8-4a2d-bd17-84af970932ba	Mathematics	2026-03-29 00:57:31.699	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.949	2026-01-31 21:07:37.949	\N
fc6fd968-c791-44a3-b0dc-30e94aa8754e	a0930960-e8a8-4a2d-bd17-84af970932ba	English	2026-03-02 00:56:41.169	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.95	2026-01-31 21:07:37.95	\N
42b9d4d7-e335-4f1c-a12b-eb3491be7210	a0930960-e8a8-4a2d-bd17-84af970932ba	Science	2026-03-04 23:54:15.075	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.951	2026-01-31 21:07:37.951	\N
51a47497-b8c6-48ac-9303-56b90a5f0608	a0930960-e8a8-4a2d-bd17-84af970932ba	Social Studies	2026-03-03 19:01:41.244	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.952	2026-01-31 21:07:37.952	\N
663f2d5f-8b4e-4941-999b-da124cc08428	a0930960-e8a8-4a2d-bd17-84af970932ba	Hindi	2026-03-03 12:04:04.553	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.953	2026-01-31 21:07:37.953	\N
405614bf-fade-4054-803e-6f95f366a598	0b23e7f3-fc71-4f41-83d2-f7f25a915200	Mathematics	2026-03-19 09:45:43.595	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.956	2026-01-31 21:07:37.956	\N
c0d3861a-4c58-4a65-a816-07314617e652	0b23e7f3-fc71-4f41-83d2-f7f25a915200	English	2026-03-22 23:04:54.522	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.958	2026-01-31 21:07:37.958	\N
dc976bd4-f6f1-4cec-b451-78c9cf9e5a89	0b23e7f3-fc71-4f41-83d2-f7f25a915200	Science	2026-03-15 20:22:04.557	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.96	2026-01-31 21:07:37.96	\N
42c4ed2b-e00d-4a0b-ab89-1b49e0139fd0	0b23e7f3-fc71-4f41-83d2-f7f25a915200	Social Studies	2026-03-18 00:06:32.355	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.962	2026-01-31 21:07:37.962	\N
dc204090-a66f-401e-85af-166cf54e1a8b	0b23e7f3-fc71-4f41-83d2-f7f25a915200	Hindi	2026-03-19 14:55:52.8	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.963	2026-01-31 21:07:37.963	\N
ff711e55-e2b5-4b6b-b966-8e11cd86ea2e	54917eb0-5e52-446e-9693-04979ac97068	Mathematics	2026-03-11 13:13:54.178	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.967	2026-01-31 21:07:37.967	\N
773a4615-cbd1-4e67-b555-642f9afbaae5	54917eb0-5e52-446e-9693-04979ac97068	English	2026-03-09 17:52:04.841	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.97	2026-01-31 21:07:37.97	\N
351ac193-f1ed-4f40-8d01-16ec2dd75f27	54917eb0-5e52-446e-9693-04979ac97068	Science	2026-03-10 22:23:23.833	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.972	2026-01-31 21:07:37.972	\N
8af67571-9af3-442c-804e-0b860ab6786c	54917eb0-5e52-446e-9693-04979ac97068	Social Studies	2026-03-01 04:10:14.193	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.973	2026-01-31 21:07:37.973	\N
49494d23-b328-4dbe-b4e5-7f33aecc3a0c	54917eb0-5e52-446e-9693-04979ac97068	Hindi	2026-03-07 13:35:05.724	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.976	2026-01-31 21:07:37.976	\N
14e0ca40-0408-44c6-9c2e-db0f646fc61c	282413ce-7bad-46f3-be9f-7a2ca18dfa75	Mathematics	2026-03-02 08:38:50.46	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.979	2026-01-31 21:07:37.979	\N
217d4dfa-fde0-42e6-bbcf-3f9f48b7d412	282413ce-7bad-46f3-be9f-7a2ca18dfa75	English	2026-03-20 12:56:04.097	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.981	2026-01-31 21:07:37.981	\N
ec20183d-bd43-4c95-ac19-4dc1d68c24f7	282413ce-7bad-46f3-be9f-7a2ca18dfa75	Science	2026-03-30 16:06:32.13	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.983	2026-01-31 21:07:37.983	\N
d89602fe-4071-44ba-9335-b251b9685c3c	282413ce-7bad-46f3-be9f-7a2ca18dfa75	Social Studies	2026-03-05 07:33:56.407	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.985	2026-01-31 21:07:37.985	\N
f1c96083-7e86-43fe-b9c0-885d144d7c70	282413ce-7bad-46f3-be9f-7a2ca18dfa75	Hindi	2026-03-25 00:25:09.629	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.987	2026-01-31 21:07:37.987	\N
50454e4c-be36-4b13-98c3-4dd8575b30bc	9ec168bf-a1fa-4bd1-9fc9-9cd25541d798	Mathematics	2026-03-27 10:09:35.543	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.991	2026-01-31 21:07:37.991	\N
fe26e817-1d74-4649-969b-1e48576285e8	9ec168bf-a1fa-4bd1-9fc9-9cd25541d798	English	2026-03-20 16:22:22.552	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.993	2026-01-31 21:07:37.993	\N
e4fdd1d9-2ac6-4b86-99db-a32d172a161b	9ec168bf-a1fa-4bd1-9fc9-9cd25541d798	Science	2026-03-01 04:35:00.795	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.994	2026-01-31 21:07:37.994	\N
9fb929a7-e0ce-4838-b7e6-d25a21bf3bc6	9ec168bf-a1fa-4bd1-9fc9-9cd25541d798	Social Studies	2026-03-05 07:10:10.73	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.996	2026-01-31 21:07:37.996	\N
6b14ce16-15b6-45bd-9cdf-b55acd300560	9ec168bf-a1fa-4bd1-9fc9-9cd25541d798	Hindi	2026-03-03 19:06:02.019	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.997	2026-01-31 21:07:37.997	\N
5e4b63ac-6ab3-4446-a74b-c8fed75630ed	749b7f6f-a08e-41c0-b2b3-85888f3b1aeb	Mathematics	2026-03-18 11:48:36.816	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.001	2026-01-31 21:07:38.001	\N
14158f05-0660-4149-ab09-02307f0a7427	749b7f6f-a08e-41c0-b2b3-85888f3b1aeb	English	2026-03-08 23:04:28.965	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.004	2026-01-31 21:07:38.004	\N
975d4dde-5975-4d05-9e0e-62e21de7aee5	749b7f6f-a08e-41c0-b2b3-85888f3b1aeb	Science	2026-03-02 07:14:48.56	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.006	2026-01-31 21:07:38.006	\N
aa2dc8e2-3267-4d5d-8663-76e93eb17400	749b7f6f-a08e-41c0-b2b3-85888f3b1aeb	Social Studies	2026-03-17 01:47:58.118	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.008	2026-01-31 21:07:38.008	\N
b454cd65-47f6-490f-b816-9af3853784a9	749b7f6f-a08e-41c0-b2b3-85888f3b1aeb	Hindi	2026-03-09 02:41:56.645	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.01	2026-01-31 21:07:38.01	\N
9d8dd45e-f13b-48e5-b422-4cf99b045dca	9cd30afe-d533-4715-bc82-8aae42cd3263	Mathematics	2026-03-07 19:18:10.834	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.013	2026-01-31 21:07:38.013	\N
b3d29216-0660-4faf-b3ae-abae2841d513	9cd30afe-d533-4715-bc82-8aae42cd3263	English	2026-03-14 08:20:50.742	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.014	2026-01-31 21:07:38.014	\N
04126afc-9b58-4c8a-9e17-2d8e0321922e	9cd30afe-d533-4715-bc82-8aae42cd3263	Science	2026-03-05 23:39:59.277	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.016	2026-01-31 21:07:38.016	\N
13ff9079-f6f8-49f8-981f-a2b29d0818de	9cd30afe-d533-4715-bc82-8aae42cd3263	Social Studies	2026-03-23 19:23:24.574	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.018	2026-01-31 21:07:38.018	\N
d43e4976-5e7b-4d53-b209-8b79903e5496	9cd30afe-d533-4715-bc82-8aae42cd3263	Hindi	2026-03-01 09:23:21.37	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.021	2026-01-31 21:07:38.021	\N
6af00e9b-ee0f-4d0a-89f3-904c233f930e	91ea92cd-5c7f-4cdf-912c-641a98bfe0da	Mathematics	2026-03-06 00:56:04.778	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.024	2026-01-31 21:07:38.024	\N
3571a7ad-ea77-4711-aab2-ea350b627c98	91ea92cd-5c7f-4cdf-912c-641a98bfe0da	English	2026-03-20 07:40:38.112	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.026	2026-01-31 21:07:38.026	\N
cd1dd54a-5a24-4521-9553-cf21ceb8b919	91ea92cd-5c7f-4cdf-912c-641a98bfe0da	Science	2026-03-02 07:44:32.873	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.027	2026-01-31 21:07:38.027	\N
5e07e9b8-d1e9-4c99-aa6e-da4166a32c9a	91ea92cd-5c7f-4cdf-912c-641a98bfe0da	Social Studies	2026-03-17 10:01:02.239	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.029	2026-01-31 21:07:38.029	\N
bd170f0c-b714-4d60-a023-488cf0b14336	91ea92cd-5c7f-4cdf-912c-641a98bfe0da	Hindi	2026-03-26 21:00:00.604	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.031	2026-01-31 21:07:38.031	\N
fbad1ebd-b254-44a9-a252-67b775e16899	e0412880-3999-44eb-a41e-591226e2ca0e	Mathematics	2026-03-10 16:08:56.128	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.034	2026-01-31 21:07:38.034	\N
9adf45ac-3671-44f8-92e3-cb29d094225c	e0412880-3999-44eb-a41e-591226e2ca0e	English	2026-03-24 07:29:15.448	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.035	2026-01-31 21:07:38.035	\N
b4e98ef0-62f3-4110-9bad-3b6b3f28c86d	e0412880-3999-44eb-a41e-591226e2ca0e	Science	2026-03-03 02:17:08.103	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.037	2026-01-31 21:07:38.037	\N
18490b72-d73d-4c88-975d-001bfb80c9b5	e0412880-3999-44eb-a41e-591226e2ca0e	Social Studies	2026-03-04 20:12:44.219	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.038	2026-01-31 21:07:38.038	\N
dd7759d2-a4bd-45ee-8a3f-15436b3529ef	e0412880-3999-44eb-a41e-591226e2ca0e	Hindi	2026-03-29 18:03:49.302	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.039	2026-01-31 21:07:38.039	\N
7fd14c7c-f5d6-4ccb-9b1e-fb01c6b75847	3439483e-6a6f-4485-a60b-329f5b8456bf	Mathematics	2026-03-27 09:45:47.751	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.042	2026-01-31 21:07:38.042	\N
f46664e1-6f2b-4295-b5b2-a508f4ed42d6	3439483e-6a6f-4485-a60b-329f5b8456bf	English	2026-03-05 08:59:02.999	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.044	2026-01-31 21:07:38.044	\N
8233c64f-bef0-4d5b-b96c-4c563894f6d7	3439483e-6a6f-4485-a60b-329f5b8456bf	Science	2026-03-08 04:18:31.046	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.046	2026-01-31 21:07:38.046	\N
221ba0e2-2898-4eea-87e0-0bfaf1bcc5e6	3439483e-6a6f-4485-a60b-329f5b8456bf	Social Studies	2026-03-16 20:18:18.687	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.048	2026-01-31 21:07:38.048	\N
93e54d2d-028d-46bc-b01d-0aea47dc0c4d	3439483e-6a6f-4485-a60b-329f5b8456bf	Hindi	2026-03-14 22:32:16.676	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.05	2026-01-31 21:07:38.05	\N
0bc36f7b-d0f5-4819-9d25-f1aa7eb28f67	01becfe2-f572-47a5-ace0-6bfb05d5c0b2	Mathematics	2026-03-13 10:21:08.085	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.061	2026-01-31 21:07:38.061	\N
44440933-aae8-4856-bb2d-4ad95996d6cc	01becfe2-f572-47a5-ace0-6bfb05d5c0b2	English	2026-03-29 18:51:22.564	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.063	2026-01-31 21:07:38.063	\N
2ca8d292-ba70-4ac8-992e-9c7fd95e2872	01becfe2-f572-47a5-ace0-6bfb05d5c0b2	Science	2026-03-02 10:01:19.987	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.065	2026-01-31 21:07:38.065	\N
6de2c485-bfac-4998-bce8-c04585cdfd40	01becfe2-f572-47a5-ace0-6bfb05d5c0b2	Social Studies	2026-03-12 15:16:22.282	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.067	2026-01-31 21:07:38.067	\N
a2ef3329-3ef5-428e-bf9d-530e2a6abc98	01becfe2-f572-47a5-ace0-6bfb05d5c0b2	Hindi	2026-03-21 22:56:16.324	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.068	2026-01-31 21:07:38.068	\N
fa9fa081-7396-4aff-a3c5-dd1f4260f2e5	a74e8dc8-7356-4cf5-ac3e-1e60ef82829c	Mathematics	2026-03-19 03:38:03.118	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.073	2026-01-31 21:07:38.073	\N
6b5101b6-09e0-4f7c-b842-3c6737c0dc1e	a74e8dc8-7356-4cf5-ac3e-1e60ef82829c	English	2026-03-19 13:31:33.164	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.074	2026-01-31 21:07:38.074	\N
f6563b4f-1135-4759-bae9-abe9116ea50f	a74e8dc8-7356-4cf5-ac3e-1e60ef82829c	Science	2026-03-28 16:26:28.89	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.076	2026-01-31 21:07:38.076	\N
15f3b691-9786-4ab3-baef-cdc7ce94f1d8	a74e8dc8-7356-4cf5-ac3e-1e60ef82829c	Social Studies	2026-03-26 10:48:49.093	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.077	2026-01-31 21:07:38.077	\N
e770b30f-aa15-4c37-a50f-9bef123f3c34	a74e8dc8-7356-4cf5-ac3e-1e60ef82829c	Hindi	2026-03-20 19:30:50.079	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.079	2026-01-31 21:07:38.079	\N
e247d6b1-cc26-47ce-8797-af607b9e52ba	0de7564b-1032-46d2-a5f5-64a637c35cf9	Mathematics	2026-03-19 02:34:05.34	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.082	2026-01-31 21:07:38.082	\N
591ac76f-2844-4bf8-b4bf-c5a4f33191e1	0de7564b-1032-46d2-a5f5-64a637c35cf9	English	2026-03-05 00:29:30.825	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.084	2026-01-31 21:07:38.084	\N
1f8f7b1a-6cb2-42be-9e29-c29a0badb145	0de7564b-1032-46d2-a5f5-64a637c35cf9	Science	2026-03-22 06:40:38.98	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.085	2026-01-31 21:07:38.085	\N
19abe6e4-dbe4-407a-ba90-ec25f20b49bf	0de7564b-1032-46d2-a5f5-64a637c35cf9	Social Studies	2026-03-13 17:45:05.343	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.087	2026-01-31 21:07:38.087	\N
dc393c5c-30b2-4c43-a797-fe6b2cf421fe	0de7564b-1032-46d2-a5f5-64a637c35cf9	Hindi	2026-03-25 07:32:29.042	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.09	2026-01-31 21:07:38.09	\N
69bfb01b-b5fc-494b-9376-8937ef3edc84	14c55654-1e41-498b-b965-301e729ff4b0	Mathematics	2026-03-05 12:51:22.588	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.094	2026-01-31 21:07:38.094	\N
b1a7c124-d090-4143-b001-c418f2ce387c	14c55654-1e41-498b-b965-301e729ff4b0	English	2026-03-11 03:25:08.969	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.096	2026-01-31 21:07:38.096	\N
8331941b-8281-438e-9a6e-db9a138d3b89	14c55654-1e41-498b-b965-301e729ff4b0	Science	2026-03-29 15:23:29.733	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.097	2026-01-31 21:07:38.097	\N
4201d7bc-d13b-4b90-bd10-5fe8018f33b7	14c55654-1e41-498b-b965-301e729ff4b0	Social Studies	2026-03-19 05:29:55.915	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.099	2026-01-31 21:07:38.099	\N
475c1b0f-94c6-4f1c-925d-e481a9000ff6	14c55654-1e41-498b-b965-301e729ff4b0	Hindi	2026-03-25 05:23:58.662	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.1	2026-01-31 21:07:38.1	\N
50ab8f3e-a7ba-48db-b30b-98da115a4650	b71c0ddc-e513-4931-b0d0-a391f1288ffe	Mathematics	2026-03-08 14:49:51.766	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.103	2026-01-31 21:07:38.103	\N
3a999bf5-7352-4ca3-ae6a-ffd0e766c241	b71c0ddc-e513-4931-b0d0-a391f1288ffe	English	2026-03-07 17:01:41.583	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.104	2026-01-31 21:07:38.104	\N
d44ab72c-8c04-4e33-9703-a6bd026b7c36	b71c0ddc-e513-4931-b0d0-a391f1288ffe	Science	2026-03-26 00:29:56.474	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.105	2026-01-31 21:07:38.105	\N
ae0cfcdf-ae97-4e60-8668-d7e6627d3eff	b71c0ddc-e513-4931-b0d0-a391f1288ffe	Social Studies	2026-03-13 22:09:23.206	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.106	2026-01-31 21:07:38.106	\N
2fb843f7-6787-4bc1-8ee3-b4a3d64afe80	b71c0ddc-e513-4931-b0d0-a391f1288ffe	Hindi	2026-03-06 03:05:33.615	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.109	2026-01-31 21:07:38.109	\N
8a51c55a-7fba-4bea-a10f-7d33b83a1807	19252577-36aa-4749-804c-1b2dca9baf4e	Mathematics	2026-03-23 04:31:53.493	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.112	2026-01-31 21:07:38.112	\N
2dfa96b1-fe7b-4777-bb99-63c2d0a9b9a2	19252577-36aa-4749-804c-1b2dca9baf4e	English	2026-03-20 07:16:15.55	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.114	2026-01-31 21:07:38.114	\N
46d1e67b-59c3-4651-ab57-989e8147bfe9	19252577-36aa-4749-804c-1b2dca9baf4e	Science	2026-03-30 09:09:01.522	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.116	2026-01-31 21:07:38.116	\N
83443644-25bd-4e75-822f-86dfdd867539	19252577-36aa-4749-804c-1b2dca9baf4e	Social Studies	2026-03-14 08:19:46.203	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.118	2026-01-31 21:07:38.118	\N
cab5348b-4650-4f50-9f79-0c5c26108b58	19252577-36aa-4749-804c-1b2dca9baf4e	Hindi	2026-03-14 02:03:44.555	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.119	2026-01-31 21:07:38.119	\N
92503f98-41ad-456e-83bc-b79e65d21604	5308b794-2064-4c9c-9042-692de485336b	Mathematics	2026-03-27 22:43:54.289	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.123	2026-01-31 21:07:38.123	\N
e67d6f0d-e6b5-499e-84b7-a3a39e36cafa	5308b794-2064-4c9c-9042-692de485336b	English	2026-03-12 14:34:25.649	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.125	2026-01-31 21:07:38.125	\N
9cbc08cd-4e13-407a-a62d-104feec6c7ca	5308b794-2064-4c9c-9042-692de485336b	Science	2026-03-24 09:57:41.163	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.126	2026-01-31 21:07:38.126	\N
c05252a0-81d6-446e-af1e-4ad5f344d312	5308b794-2064-4c9c-9042-692de485336b	Social Studies	2026-03-04 06:35:57.952	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.127	2026-01-31 21:07:38.127	\N
120fbb15-bc55-4549-91b3-e7640f335bca	5308b794-2064-4c9c-9042-692de485336b	Hindi	2026-03-25 22:25:31.065	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.129	2026-01-31 21:07:38.129	\N
93f2e133-618f-4ae0-9510-515997190b12	aa03f213-fcd6-418d-849f-013cbe0a98a5	Mathematics	2026-03-15 17:33:04.833	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.132	2026-01-31 21:07:38.132	\N
60509bcc-5631-4eef-a09f-ecf17f4679e3	aa03f213-fcd6-418d-849f-013cbe0a98a5	English	2026-03-11 08:08:02.185	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.134	2026-01-31 21:07:38.134	\N
f955db22-fc75-46fc-9bf8-24a50ee84627	aa03f213-fcd6-418d-849f-013cbe0a98a5	Science	2026-03-01 10:02:01.959	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.135	2026-01-31 21:07:38.135	\N
7648806f-e262-4a55-b538-ae4512fb000d	aa03f213-fcd6-418d-849f-013cbe0a98a5	Social Studies	2026-03-25 19:10:41.182	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.137	2026-01-31 21:07:38.137	\N
c212f053-ea7b-4a3b-a420-4373b079857b	aa03f213-fcd6-418d-849f-013cbe0a98a5	Hindi	2026-03-25 00:20:35.255	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.138	2026-01-31 21:07:38.138	\N
8bdff0cc-8b62-4e45-9bbd-8870a157caf0	9a0ffc4e-dc84-479f-ad4c-e221eb6d17e2	Mathematics	2026-03-20 16:14:00.807	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.141	2026-01-31 21:07:38.141	\N
c8f81f93-1ce7-465c-8eee-907fa5f70ea1	9a0ffc4e-dc84-479f-ad4c-e221eb6d17e2	English	2026-03-07 10:27:58.226	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.142	2026-01-31 21:07:38.142	\N
d129ad55-4ac9-41e7-8949-2fec1578b419	9a0ffc4e-dc84-479f-ad4c-e221eb6d17e2	Science	2026-03-15 21:21:20.085	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.144	2026-01-31 21:07:38.144	\N
56183fcc-0ada-42e4-87f3-7490f78fe749	9a0ffc4e-dc84-479f-ad4c-e221eb6d17e2	Social Studies	2026-03-16 00:31:19.868	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.145	2026-01-31 21:07:38.145	\N
22d105dd-b972-4133-b309-e291b6ed6ba4	9a0ffc4e-dc84-479f-ad4c-e221eb6d17e2	Hindi	2026-03-18 05:52:26.964	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.147	2026-01-31 21:07:38.147	\N
d24360bc-098a-4cce-b1fe-e7eb1f1927a1	d02128f8-089e-43f9-baf9-be5f75ea2220	Mathematics	2026-03-11 11:33:43.064	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.15	2026-01-31 21:07:38.15	\N
d6086a1e-ec6e-4f62-81c7-40ff34fd22e3	d02128f8-089e-43f9-baf9-be5f75ea2220	English	2026-03-29 01:51:08.533	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.152	2026-01-31 21:07:38.152	\N
466f7681-d00f-4e5e-90aa-d24859b797ef	d02128f8-089e-43f9-baf9-be5f75ea2220	Science	2026-03-19 23:23:34.208	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.153	2026-01-31 21:07:38.153	\N
7953cddb-96a3-4ab0-887d-59dfdfe66520	d02128f8-089e-43f9-baf9-be5f75ea2220	Social Studies	2026-03-08 11:30:46.616	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.154	2026-01-31 21:07:38.154	\N
4149f3b9-ebaa-41da-bb1c-d8061c671da1	d02128f8-089e-43f9-baf9-be5f75ea2220	Hindi	2026-03-02 16:46:26.1	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.156	2026-01-31 21:07:38.156	\N
6158c5be-b429-432a-bed9-d33efccce079	776ed347-08bd-4e78-8368-4019fad763aa	Mathematics	2026-03-18 20:21:34.744	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.158	2026-01-31 21:07:38.158	\N
53d6e783-1819-4a0a-b45e-cc9f46fcdd61	776ed347-08bd-4e78-8368-4019fad763aa	English	2026-03-04 20:56:40.139	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.16	2026-01-31 21:07:38.16	\N
99be86ba-be67-45a1-b33f-41a77d7848a6	776ed347-08bd-4e78-8368-4019fad763aa	Science	2026-03-14 01:25:14.524	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.161	2026-01-31 21:07:38.161	\N
ba242c18-c926-4d7e-ac2f-d2205d8279f2	776ed347-08bd-4e78-8368-4019fad763aa	Social Studies	2026-03-06 23:58:36.847	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.162	2026-01-31 21:07:38.162	\N
6b8c38e1-7854-47d0-b075-0a4e8ab01ef5	776ed347-08bd-4e78-8368-4019fad763aa	Hindi	2026-03-05 23:35:26.464	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.163	2026-01-31 21:07:38.163	\N
589745bc-a232-4116-9587-ba453893143d	4623eb0d-0fe3-4211-8ade-22c80c82d879	Mathematics	2026-03-08 12:21:15.929	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.166	2026-01-31 21:07:38.166	\N
8ee732e1-5151-44c0-8896-7ccd903f6fdf	4623eb0d-0fe3-4211-8ade-22c80c82d879	English	2026-03-22 21:01:54.474	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.167	2026-01-31 21:07:38.167	\N
434383f8-fdd2-49d5-8847-4c656a72f36f	4623eb0d-0fe3-4211-8ade-22c80c82d879	Science	2026-03-06 15:21:13.285	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.169	2026-01-31 21:07:38.169	\N
78038c53-ae2d-46eb-a12b-99dc70d5d6f6	4623eb0d-0fe3-4211-8ade-22c80c82d879	Social Studies	2026-03-14 11:09:14.704	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.17	2026-01-31 21:07:38.17	\N
26a15474-8ec9-48c8-b031-96e52d540df1	4623eb0d-0fe3-4211-8ade-22c80c82d879	Hindi	2026-03-01 13:58:25.279	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.171	2026-01-31 21:07:38.171	\N
f07f1a75-c514-476a-9e3f-abe0b165867d	163885b1-2bc0-46e7-8e11-55636bbff050	Mathematics	2026-03-24 10:11:42.989	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.175	2026-01-31 21:07:38.175	\N
3f657cd9-efa2-445e-bdb5-35ce900f7fdb	163885b1-2bc0-46e7-8e11-55636bbff050	English	2026-03-13 16:17:07.693	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.177	2026-01-31 21:07:38.177	\N
7e2678ab-6287-49f9-b04a-ea461b0cb7e6	163885b1-2bc0-46e7-8e11-55636bbff050	Science	2026-03-02 02:26:23.168	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.178	2026-01-31 21:07:38.178	\N
25db1d66-2451-4a11-ac15-b70652f21773	163885b1-2bc0-46e7-8e11-55636bbff050	Social Studies	2026-03-01 17:29:22.182	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.18	2026-01-31 21:07:38.18	\N
78eb1af2-88ba-4558-8e94-b603332ac917	163885b1-2bc0-46e7-8e11-55636bbff050	Hindi	2026-03-26 14:39:00.091	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.182	2026-01-31 21:07:38.182	\N
24a353fa-40d5-406f-ab64-725c7317be2c	537bcd9b-8d76-49e3-a7a6-22a3733c9ef8	Mathematics	2026-03-29 03:43:42.765	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.185	2026-01-31 21:07:38.185	\N
5a7edcdb-3705-45f6-991d-08e80e293b07	537bcd9b-8d76-49e3-a7a6-22a3733c9ef8	English	2026-03-11 04:59:53.697	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.186	2026-01-31 21:07:38.186	\N
e008b829-c780-41df-8161-80e63ad8ef18	537bcd9b-8d76-49e3-a7a6-22a3733c9ef8	Science	2026-03-07 03:44:23.017	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.188	2026-01-31 21:07:38.188	\N
44548603-f582-4412-88a5-6979bde2a9ee	537bcd9b-8d76-49e3-a7a6-22a3733c9ef8	Social Studies	2026-03-10 13:38:01.22	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.189	2026-01-31 21:07:38.189	\N
35e76f59-d2bf-44f9-9752-80d992448b8a	537bcd9b-8d76-49e3-a7a6-22a3733c9ef8	Hindi	2026-03-06 20:12:39.532	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.19	2026-01-31 21:07:38.19	\N
\.


--
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.exams (id, school_id, year, name, type) FROM stdin;
ddc00a1b-7dcb-45e9-b197-7e85d8d886bd	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	First Unit Test	UNIT_TEST
9f93cc4e-9b99-4701-a070-70f1fe7f2d1a	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	Second Unit Test	SEMESTER
11cbe21e-de02-4e9e-aaf2-8a53855d5deb	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	First Semester	FINAL
3c74c3c9-35f8-4ac9-96d2-3356d98bec66	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	Second Semester	UNIT_TEST
3a5f7b51-a1e7-44aa-a3e1-3165f3e307fd	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	Annual Exam	SEMESTER
5a8e7824-1fc2-40ef-8eda-c50581b5aa01	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	First Unit Test	UNIT_TEST
6a324f9b-469e-43dc-8381-a5583b18aec5	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	Second Unit Test	SEMESTER
f78761f9-fd6f-447d-8967-77a2b1af4394	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	First Semester	FINAL
6ce43149-f459-43a9-bb66-9fc98b7245f5	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	Second Semester	UNIT_TEST
09a04463-c209-4ad9-9b18-cd35273f4ef9	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	Annual Exam	SEMESTER
c70fb64f-286b-4179-b508-2f1cfc8151d4	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	First Unit Test	UNIT_TEST
8a3a9ba5-faca-4fc7-8233-724ec35e2298	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	Second Unit Test	SEMESTER
29cd712e-f814-468f-832a-9797e8ca4e53	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	First Semester	FINAL
0f179dec-eaec-4efd-a297-ed6b4d22c59a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	Second Semester	UNIT_TEST
de6227b9-b00d-444d-a0d6-e2ac537a00c3	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	Annual Exam	SEMESTER
98050d53-e983-4317-87f6-64d3c395cfd0	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	First Unit Test	UNIT_TEST
8c0e43ed-d8d4-477c-9237-3bdc1ec19e0d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	Second Unit Test	SEMESTER
fe674880-fbd1-44a9-8438-7b5d208ce4ed	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	First Semester	FINAL
23e5dac9-73c1-4f5f-8b46-998aab559972	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	Second Semester	UNIT_TEST
7f7693e0-9fb5-4eea-9031-0aa318d8c312	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	Annual Exam	SEMESTER
b912a641-7c1f-47e2-83df-44a3d67671ad	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	First Unit Test	UNIT_TEST
51722f7b-c9e7-4528-b28e-fcffe5726840	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	Second Unit Test	SEMESTER
a46f8200-d5c7-46ad-a83a-7ae58db833c8	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	First Semester	FINAL
b9381491-c3b6-40f2-8317-a18ced82745d	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	Second Semester	UNIT_TEST
0248214c-cd61-4587-a17a-f54a2b6ef4c1	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	Annual Exam	SEMESTER
d5c9d5cb-1ffe-412b-a13c-2f5e2914d9f1	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	First Unit Test	UNIT_TEST
52c69ffa-9f06-4826-8fc3-ffbbacfc3ab0	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	Second Unit Test	SEMESTER
1b224a39-5591-40e9-ade5-1bf53c1b135d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	First Semester	FINAL
4e78fce4-b266-427a-85e9-bbaf7041f8f7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	Second Semester	UNIT_TEST
974ed96b-82c9-4b80-a9de-2fbcdf1e91c8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	Annual Exam	SEMESTER
83af9222-8ddc-4f39-9211-a11c4f2c3811	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	First Unit Test	UNIT_TEST
eea56292-92c4-4ae8-a852-9e4923b2d60c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	Second Unit Test	SEMESTER
39b817f6-e7e3-421a-9846-7aeaee0f862c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	First Semester	FINAL
36bbeba1-8a84-4c60-84f4-f03798248c9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	Second Semester	UNIT_TEST
8689eab3-ce80-4157-a8d2-567c30924952	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	Annual Exam	SEMESTER
dca69083-5761-4670-981e-810341071022	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	First Unit Test	UNIT_TEST
d6ca3a4c-5532-4638-8df3-30776b2b989b	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	Second Unit Test	SEMESTER
578d9521-6d3b-4941-bf4e-7e3015d641e4	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	First Semester	FINAL
8c51699a-bf96-43db-9a1e-2dca8640eddc	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	Second Semester	UNIT_TEST
ce2a6a3c-bfb1-4ce7-ab51-3b797322b79b	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	Annual Exam	SEMESTER
a10b8100-a0db-4c57-ae34-c9e5023e982e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	First Unit Test	UNIT_TEST
b1a02834-61e3-4f50-a49d-d47277d3fc89	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	Second Unit Test	SEMESTER
0095185b-f20a-485f-b33d-e77aa20b2b1a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	First Semester	FINAL
7b418060-dec8-47b6-8dc3-bc8b93cd5364	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	Second Semester	UNIT_TEST
70413967-23b5-47de-a0da-10a901483dc0	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	Annual Exam	SEMESTER
c7e3ade4-d2be-43db-89c2-3d0f10be68fa	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	First Unit Test	UNIT_TEST
66d43d22-2f76-4db7-9c02-868a98f7a338	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	Second Unit Test	SEMESTER
f2b5cf44-bae7-4323-838a-df0ffdfd2094	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	First Semester	FINAL
3a9cda13-b35e-4331-b6ce-926dab9b8364	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	Second Semester	UNIT_TEST
b5d53bcf-c2d5-4805-85e7-8a8f3fe492a1	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	2026	Annual Exam	SEMESTER
e9962183-9659-42d7-a24f-00e7140a0395	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	First Unit Test	UNIT_TEST
6b0c8077-c068-4b20-83e9-3e6b2fb77207	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	Second Unit Test	SEMESTER
7bcd4efa-8fba-493b-b429-30835c0c5431	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	First Semester	FINAL
b4e687fb-d789-496a-87bd-029d7cd023fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	Second Semester	UNIT_TEST
61deef16-e6a3-4e82-991b-dc68c0f51394	3a8d3873-81bc-4b79-ad76-5e335848ded1	2026	Annual Exam	SEMESTER
bcb2bdbe-dae8-4bc4-8485-9a9aba3e912a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	First Unit Test	UNIT_TEST
185ee6d7-5cb1-42ef-b078-fb44bc19bf11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	Second Unit Test	SEMESTER
5ff390a2-10b6-4204-b6c4-b3939b79556b	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	First Semester	FINAL
c904d3db-aeb4-476f-a994-0c00392639eb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	Second Semester	UNIT_TEST
bd857b52-fc66-4b56-af61-d77d5b907bb4	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2026	Annual Exam	SEMESTER
\.


--
-- Data for Name: fee_installments; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.fee_installments (id, fee_id, school_id, student_id, installement_number, payment_status, amount, remaining_amount, paid_amount, paid_at, receipt_file_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
f3dfa036-1980-44f3-ad70-f45360ce2ca6	66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	1	PAID	4166	0	4166	2026-01-07 07:27:01.711	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.842	2026-01-31 21:07:35.842	\N
91da602e-65aa-485d-a4d5-f9fd3daceec6	66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	2	PAID	4166	0	4166	2026-01-30 06:20:34.66	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.846	2026-01-31 21:07:35.846	\N
6c043764-4911-4903-99f5-a040fe7d2da0	66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	3	PAID	4166	0	4166	2026-01-28 09:58:08.519	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.847	2026-01-31 21:07:35.847	\N
db486aed-3478-4690-acd9-e4d6dd869d4d	66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	4	PAID	4166	0	4166	2026-01-17 02:37:30.879	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.849	2026-01-31 21:07:35.849	\N
6e39ccfb-d855-47ef-890a-32bde31bace8	66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	5	PAID	4166	0	4166	2026-01-30 04:21:28.297	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.851	2026-01-31 21:07:35.851	\N
76c8cf86-1711-4b98-a6a6-3d221c272274	66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	6	PAID	4166	0	4166	2026-01-25 22:01:34.321	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.853	2026-01-31 21:07:35.853	\N
2c8fad90-fd28-4475-9877-3db05e1b3a4e	66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.854	2026-01-31 21:07:35.854	\N
73d228bd-a5b9-4cca-88d1-0bd1b6fe9b5e	66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.856	2026-01-31 21:07:35.856	\N
7ad01810-e4da-41ff-89e0-631b837c16b7	66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.858	2026-01-31 21:07:35.858	\N
fdfa0cfd-74e6-4da3-83f4-87af697d9c64	66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.86	2026-01-31 21:07:35.86	\N
0cd27e61-2723-4a17-8b72-0f2ad624d0a3	66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.862	2026-01-31 21:07:35.862	\N
e049a6dd-3c40-4e6f-a156-8337ead85c73	66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.864	2026-01-31 21:07:35.864	\N
570fdf59-01ab-4174-a660-d5bfa071cbce	02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	1	PAID	4166	0	4166	2026-01-29 04:22:48.983	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.867	2026-01-31 21:07:35.867	\N
b5643407-510b-4951-8e65-0b201b766dd9	02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	2	PAID	4166	0	4166	2026-01-10 16:10:37.204	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.869	2026-01-31 21:07:35.869	\N
f5002dec-5966-4a13-8278-4bde1758a229	02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	3	PAID	4166	0	4166	2026-01-04 07:27:13.355	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.871	2026-01-31 21:07:35.871	\N
0101882f-4813-4606-9f42-5483820b8ff4	02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	4	PAID	4166	0	4166	2026-01-06 08:19:30.352	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.873	2026-01-31 21:07:35.873	\N
f695642c-3596-45d8-9376-8d8a3d9311c8	02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	5	PAID	4166	0	4166	2026-01-17 15:13:43.372	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.875	2026-01-31 21:07:35.875	\N
11421f89-b058-4e17-b217-f51129cb01ce	02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	6	PAID	4166	0	4166	2026-01-09 07:14:23.445	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.877	2026-01-31 21:07:35.877	\N
4711d16b-d02a-4a5d-a619-1ee69834d9d7	02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.878	2026-01-31 21:07:35.878	\N
fa58e800-5903-4714-88a8-29b97d8366c2	02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.881	2026-01-31 21:07:35.881	\N
e5abe96f-3ef8-401a-919b-59c73b17a595	02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.883	2026-01-31 21:07:35.883	\N
d62ba7fc-e96e-41ae-9e8a-256bfaa2b13b	02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.886	2026-01-31 21:07:35.886	\N
96218fd8-f5d3-4bb8-9853-0eabf3b34c34	02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.888	2026-01-31 21:07:35.888	\N
342c19d5-2936-4d9d-9d26-dc0339ac9619	02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.89	2026-01-31 21:07:35.89	\N
44541dd0-0215-4ba1-b780-46326fffe288	fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	1	PAID	4166	0	4166	2026-01-07 22:45:18.986	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.894	2026-01-31 21:07:35.894	\N
b05f6b8a-1726-4d4a-ad6e-940bee800b39	fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	2	PAID	4166	0	4166	2026-01-17 22:59:55.293	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.897	2026-01-31 21:07:35.897	\N
8f69fcc1-195f-4242-8975-e845c7ef208f	fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	3	PAID	4166	0	4166	2026-01-15 23:57:35.31	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.898	2026-01-31 21:07:35.898	\N
58395b84-4ebb-4855-a05a-dfdcd137bda0	fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	4	PAID	4166	0	4166	2026-01-20 03:50:12.965	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.9	2026-01-31 21:07:35.9	\N
8829bfc1-a25b-4bcd-b554-335f676c5526	fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	5	PAID	4166	0	4166	2026-01-25 04:43:27.479	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.902	2026-01-31 21:07:35.902	\N
93647745-ef54-472d-8db6-06e52a9b7e9b	fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	6	PAID	4166	0	4166	2026-01-06 08:21:37.604	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.905	2026-01-31 21:07:35.905	\N
a1defb65-23e3-4b14-b6f8-f6124692df1c	fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.907	2026-01-31 21:07:35.907	\N
649f2a59-9a95-4dba-93e2-c349d3a463d5	fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.91	2026-01-31 21:07:35.91	\N
d14d52f1-7769-4466-87ca-e63ff8671c25	fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.911	2026-01-31 21:07:35.911	\N
d05c9d3c-37cc-4a74-af90-96038994b459	fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.913	2026-01-31 21:07:35.913	\N
5838502e-1ace-4970-bb7d-2a301b35819a	fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.915	2026-01-31 21:07:35.915	\N
f1708a29-fbda-45dd-9a54-b3139febf683	fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.917	2026-01-31 21:07:35.917	\N
c765c519-5f7a-4d97-a528-52a163bd589c	08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	1	PAID	4166	0	4166	2026-01-02 10:06:39.261	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.923	2026-01-31 21:07:35.923	\N
a7f18644-be47-4239-bfd4-d8ab1b01630e	08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	2	PAID	4166	0	4166	2026-01-28 00:47:53.513	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.926	2026-01-31 21:07:35.926	\N
f00b004e-1d5b-40d1-aeb1-38c82c82cecc	08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	3	PAID	4166	0	4166	2026-01-30 15:41:07.269	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.928	2026-01-31 21:07:35.928	\N
2ab88ee8-7b07-4cf2-a7af-5ef9745684a7	08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	4	PAID	4166	0	4166	2026-01-23 01:27:17.554	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.93	2026-01-31 21:07:35.93	\N
17c1f8fa-93ea-4423-99d1-7197994e755a	08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	5	PAID	4166	0	4166	2026-01-09 17:10:32.208	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.932	2026-01-31 21:07:35.932	\N
322375b1-e370-4e8b-8305-4333e982b4d8	08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	6	PAID	4166	0	4166	2026-01-27 01:10:50.632	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.935	2026-01-31 21:07:35.935	\N
ccf0b034-dd5c-4f0b-830b-cc6fd2945c7e	08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.937	2026-01-31 21:07:35.937	\N
bf16babc-428d-45a4-8b31-2a3cd3bd6e78	08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.94	2026-01-31 21:07:35.94	\N
1addd0c0-a845-4e26-aeb0-b7ae607b3543	08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.941	2026-01-31 21:07:35.941	\N
b2216846-5732-4cc7-952e-34ec0b304305	08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.943	2026-01-31 21:07:35.943	\N
cd19c8fb-591f-4d72-a516-68ac9d2b02bb	08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.946	2026-01-31 21:07:35.946	\N
9a9e0a3b-d044-4bcd-bc2f-13dbae772667	08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.948	2026-01-31 21:07:35.948	\N
a10b9efa-8b03-458b-92c0-931f31bc23f7	d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	1	PAID	4166	0	4166	2026-01-02 12:23:46.012	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.952	2026-01-31 21:07:35.952	\N
bda29e52-69ae-4a80-9af8-f421a9d99a70	d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	2	PAID	4166	0	4166	2026-01-17 06:45:36.254	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.956	2026-01-31 21:07:35.956	\N
66e24933-d183-4838-930c-916f8f757fbc	d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	3	PAID	4166	0	4166	2026-01-23 05:09:53.285	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.958	2026-01-31 21:07:35.958	\N
e38382f3-68ad-4535-ab0e-87e91c33bf5b	d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	4	PAID	4166	0	4166	2026-01-18 16:44:50.677	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.959	2026-01-31 21:07:35.959	\N
f54c8619-d908-4dff-881a-c350d121171e	d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	5	PAID	4166	0	4166	2026-01-02 16:15:18.293	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.962	2026-01-31 21:07:35.962	\N
e98f70cc-6644-41d5-993a-65183967391c	d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	6	PAID	4166	0	4166	2026-01-17 15:59:16.274	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.964	2026-01-31 21:07:35.964	\N
c0b9908a-944c-4520-9ddc-59b5bc01d534	d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.966	2026-01-31 21:07:35.966	\N
b0c8737e-d0f8-4885-bd05-b3d67ba1b535	d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.969	2026-01-31 21:07:35.969	\N
3952b0ac-e741-48e3-bfa2-fb4a31a7fd15	d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.97	2026-01-31 21:07:35.97	\N
8d67fbe6-56c7-4639-a240-8c6907e2660b	d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.972	2026-01-31 21:07:35.972	\N
e81e22c2-a96a-4f32-b52b-4e33953d3d8e	d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.974	2026-01-31 21:07:35.974	\N
69962c33-c162-48b1-aaf3-cc909c0af0eb	d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.975	2026-01-31 21:07:35.975	\N
bf9058db-1ab8-4f28-b5fb-a980db2d5a26	a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	1	PAID	4166	0	4166	2026-01-05 02:36:56.129	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.978	2026-01-31 21:07:35.978	\N
88a15044-2b6b-4313-8df6-1e9699825e49	a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	2	PAID	4166	0	4166	2026-01-27 20:33:27.358	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.98	2026-01-31 21:07:35.98	\N
c4521593-3d26-419d-8cc8-e28e3d9c6038	a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	3	PAID	4166	0	4166	2026-01-28 11:14:02.889	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.982	2026-01-31 21:07:35.982	\N
854345a6-2b47-4ac1-953b-32fd93136158	a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	4	PAID	4166	0	4166	2026-01-10 14:34:20.364	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.983	2026-01-31 21:07:35.983	\N
4e54306a-f737-4994-9294-35d8191aa674	a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	5	PAID	4166	0	4166	2026-01-09 12:38:52.076	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.985	2026-01-31 21:07:35.985	\N
c51cf49c-7e26-4bfd-af0b-9a16ac835d31	a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	6	PAID	4166	0	4166	2026-01-18 08:58:16.24	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.986	2026-01-31 21:07:35.986	\N
18cb8dbf-2cb9-43ab-8079-c7740f669e7b	a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.988	2026-01-31 21:07:35.988	\N
3ce76832-ee26-4252-bc49-7b1578751dba	a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.99	2026-01-31 21:07:35.99	\N
4b87cf24-e0df-4bd1-917d-2da43600c507	a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.991	2026-01-31 21:07:35.991	\N
96425092-950e-442f-b686-b68f0841366a	a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.993	2026-01-31 21:07:35.993	\N
cee68d34-43b0-4338-aae4-c0b361085eb9	a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.995	2026-01-31 21:07:35.995	\N
99e301bc-397f-4317-a061-26d91b36dbc5	a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.996	2026-01-31 21:07:35.996	\N
ad2a887a-a9bd-4452-a8df-aea69dd05330	960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	1	PAID	4166	0	4166	2026-01-15 16:34:32.436	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36	2026-01-31 21:07:36	\N
a50e22d5-1d40-46cf-ad09-c54ff584eb21	960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	2	PAID	4166	0	4166	2026-01-13 08:58:33.364	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.002	2026-01-31 21:07:36.002	\N
09e55abc-90e7-4277-a12c-483a750f8241	960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	3	PAID	4166	0	4166	2026-01-07 09:44:57.58	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.005	2026-01-31 21:07:36.005	\N
05764581-dd41-40f7-afa0-d6a2fac91731	960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	4	PAID	4166	0	4166	2026-01-27 03:46:52.506	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.008	2026-01-31 21:07:36.008	\N
53814bff-8703-40d6-a14a-3170809dd532	960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	5	PAID	4166	0	4166	2026-01-24 09:10:51.435	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.01	2026-01-31 21:07:36.01	\N
88457e59-8b3e-4d97-950a-6b474a309f75	960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	6	PAID	4166	0	4166	2026-01-16 00:48:00.6	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.012	2026-01-31 21:07:36.012	\N
42ce1db7-1aba-418f-94dd-a779ebe27fae	960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.014	2026-01-31 21:07:36.014	\N
e3be6565-52b1-4689-92a6-aee60a00be4e	960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.016	2026-01-31 21:07:36.016	\N
5745d840-1bf8-47e2-91f8-3d321626ce30	960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.018	2026-01-31 21:07:36.018	\N
1ecc08bb-50ec-4ddc-bf21-a0d3af1e7f6b	960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.02	2026-01-31 21:07:36.02	\N
9adacdee-821e-4bf7-a439-d5734fa4063b	960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.022	2026-01-31 21:07:36.022	\N
8d4bdd9a-d0dc-4a25-b11a-e4e75a6aeeb6	960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.024	2026-01-31 21:07:36.024	\N
dc4467e6-edf7-4edc-9d48-988daa59377b	54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	1	PAID	4166	0	4166	2026-01-18 00:04:49.098	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.028	2026-01-31 21:07:36.028	\N
66c01942-2322-4c70-b8a6-1d364ebe4960	54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	2	PAID	4166	0	4166	2026-01-21 19:59:38.547	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.03	2026-01-31 21:07:36.03	\N
0d54598f-b237-4137-81e7-7c17ca9ba10d	54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	3	PAID	4166	0	4166	2026-01-18 15:18:23.851	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.032	2026-01-31 21:07:36.032	\N
12995a51-6136-47f0-b4ce-aa522220088b	54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	4	PAID	4166	0	4166	2026-01-31 07:00:15.492	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.034	2026-01-31 21:07:36.034	\N
5dc0aec9-6d44-4823-8788-7a70513f1475	54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	5	PAID	4166	0	4166	2026-01-23 19:40:46.183	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.036	2026-01-31 21:07:36.036	\N
d1146582-267a-4de1-9b5a-038f40a11f28	54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	6	PAID	4166	0	4166	2026-01-03 21:46:08.19	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.038	2026-01-31 21:07:36.038	\N
7d5cb290-df4e-41de-8af2-c61b56ea109f	54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.04	2026-01-31 21:07:36.04	\N
3a0751d2-47ca-4254-93d4-064679a88a9f	54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.042	2026-01-31 21:07:36.042	\N
ad88972f-f1bd-4270-9152-3cd49519a5aa	54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.045	2026-01-31 21:07:36.045	\N
62c34bb2-e08b-460d-b739-4ce71eadf927	54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.047	2026-01-31 21:07:36.047	\N
1846b7ff-42e2-4b84-b9b0-4d1853a307f3	54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.049	2026-01-31 21:07:36.049	\N
8b4288bd-6cee-4153-9acc-47a2e45a27f0	54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.051	2026-01-31 21:07:36.051	\N
78f24c8d-2656-4dbb-af5b-87c8719fd677	2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	1	PAID	4166	0	4166	2026-01-22 00:28:22.684	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.055	2026-01-31 21:07:36.055	\N
f9b7c128-6cb4-423e-bb20-06bb0823d08d	2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	2	PAID	4166	0	4166	2026-01-04 01:33:22.763	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.057	2026-01-31 21:07:36.057	\N
a6805685-1c66-4572-ab49-7cb527c97b64	2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	3	PAID	4166	0	4166	2026-01-11 03:12:00.423	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.059	2026-01-31 21:07:36.059	\N
1985f25c-28e7-42af-9371-21ae29dd80e2	2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	4	PAID	4166	0	4166	2026-01-24 07:20:12.152	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.061	2026-01-31 21:07:36.061	\N
41493b69-b701-486d-8fcf-4f4edae4a8ed	2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	5	PAID	4166	0	4166	2026-01-01 14:47:16.889	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.063	2026-01-31 21:07:36.063	\N
abd68b39-b90b-4295-ac72-89f174446640	2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	6	PAID	4166	0	4166	2026-01-20 04:43:42.557	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.065	2026-01-31 21:07:36.065	\N
cc996480-abb1-4453-a3e4-b96dcf61294c	2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.067	2026-01-31 21:07:36.067	\N
a167c053-2c0c-4994-8f5b-18bfa69331cd	2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.07	2026-01-31 21:07:36.07	\N
4f75dfed-b3d3-4ae4-a9a2-934d04c20bf2	2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.072	2026-01-31 21:07:36.072	\N
ed7378b5-f7f1-43ef-b0e4-211ca9933ed7	2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.074	2026-01-31 21:07:36.074	\N
85e9164e-7a29-4f07-8901-72dbf81e9ca7	2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.075	2026-01-31 21:07:36.075	\N
f203391a-9bfb-41ee-b0ff-357b14bb23b4	2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.077	2026-01-31 21:07:36.077	\N
649aa77d-cd5e-4355-a198-49886e6bdcb4	c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	1	PAID	4166	0	4166	2026-01-24 01:25:12.393	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.081	2026-01-31 21:07:36.081	\N
79b8e382-6e41-4acb-8300-af347d72ac6d	c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	2	PAID	4166	0	4166	2026-01-28 22:10:51.095	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.083	2026-01-31 21:07:36.083	\N
de83ffcb-be05-4597-a871-b3281db544ba	c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	3	PAID	4166	0	4166	2026-01-10 02:42:03.585	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.084	2026-01-31 21:07:36.084	\N
9e76201f-39b1-47de-b6ad-db99d6877619	c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	4	PAID	4166	0	4166	2026-01-08 06:45:43.463	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.086	2026-01-31 21:07:36.086	\N
f2927ae8-c1ef-4514-91d2-1865c0228029	c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	5	PAID	4166	0	4166	2026-01-22 03:12:48.774	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.088	2026-01-31 21:07:36.088	\N
5bca6532-8932-48cc-8000-9de54bd8d54a	c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	6	PAID	4166	0	4166	2026-01-16 10:20:02.98	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.089	2026-01-31 21:07:36.089	\N
4f3b5a6b-a3aa-4bed-81c6-fec1e43d55f3	c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.091	2026-01-31 21:07:36.091	\N
7bc1077a-eb81-47ed-b848-ab32e2d8433b	c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.093	2026-01-31 21:07:36.093	\N
d59ce903-167c-4602-b831-0bedceb9f1f9	c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.094	2026-01-31 21:07:36.094	\N
47619e3c-6ce2-4889-a1de-bdebf6691292	c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.097	2026-01-31 21:07:36.097	\N
4f8ed0ab-1976-4aec-92e1-8c23fc2b60c3	c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.099	2026-01-31 21:07:36.099	\N
211715ba-a201-47bc-b742-96ff6121f11a	c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.101	2026-01-31 21:07:36.101	\N
98264b26-09d8-4607-a3fe-eaa4a253e692	51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	1	PAID	4166	0	4166	2026-01-24 14:25:36.433	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.104	2026-01-31 21:07:36.104	\N
74d58b83-66f3-49e7-a4ef-30f3a05bc3b0	80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.156	2026-01-31 21:07:36.156	\N
2a136881-85d3-4f5c-b309-c2d50d9b3f8a	51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	2	PAID	4166	0	4166	2026-01-14 08:25:21.569	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.105	2026-01-31 21:07:36.105	\N
d9662e9f-2800-472b-b87f-e646476c7096	51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	3	PAID	4166	0	4166	2026-01-03 12:02:24.528	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.107	2026-01-31 21:07:36.107	\N
36b5ee45-ea34-41c1-b907-739d1b9bebbf	51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	4	PAID	4166	0	4166	2026-01-26 23:42:07.621	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.108	2026-01-31 21:07:36.108	\N
4d51d783-f85e-432e-9f3c-b1a6e080ffea	51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	5	PAID	4166	0	4166	2026-01-17 20:24:36.764	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.11	2026-01-31 21:07:36.11	\N
c51c510c-b8e5-4d77-9563-b51579398c5c	51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	6	PAID	4166	0	4166	2026-01-06 18:13:36.656	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.112	2026-01-31 21:07:36.112	\N
ec189634-7e5c-4a92-ac5e-d6070a8b5bea	51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.114	2026-01-31 21:07:36.114	\N
bc3527a1-549b-4776-91b1-ce5f5f8b4d47	51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.115	2026-01-31 21:07:36.115	\N
f5784e17-da16-4ab9-b271-62a9aba6ecc3	51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.117	2026-01-31 21:07:36.117	\N
2f1fba95-a24d-4170-82a0-b0b70e3543a9	51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.118	2026-01-31 21:07:36.118	\N
ca2415cb-f4a7-438a-97fa-a9e3bac4ecd1	51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.12	2026-01-31 21:07:36.12	\N
eec66d84-21fa-42d7-992b-55531c23ab74	51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.121	2026-01-31 21:07:36.121	\N
a59a6652-c4c5-4b54-93db-f4575d7e0852	8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	1	PAID	4166	0	4166	2026-01-09 08:29:17.976	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.126	2026-01-31 21:07:36.126	\N
3be22b66-6d5e-42e9-bc83-97956855b8bb	8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	2	PAID	4166	0	4166	2026-01-17 08:49:05.345	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.127	2026-01-31 21:07:36.127	\N
076717e9-6e1e-4c27-9866-cd2e1283a0eb	8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	3	PAID	4166	0	4166	2026-01-09 06:49:55.248	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.129	2026-01-31 21:07:36.129	\N
8d20d426-5960-4447-9a64-f616836bc410	8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	4	PAID	4166	0	4166	2026-01-28 09:45:12.386	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.131	2026-01-31 21:07:36.131	\N
06a55bd3-970c-4143-a3fa-0eabb06e98e9	8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	5	PAID	4166	0	4166	2026-01-05 18:32:28.753	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.132	2026-01-31 21:07:36.132	\N
af680c31-c780-449a-ba8f-ab91205ebd98	8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	6	PAID	4166	0	4166	2026-01-20 15:40:24.161	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.134	2026-01-31 21:07:36.134	\N
5a3a850c-5f21-4d63-8af0-294326f55ccf	8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.135	2026-01-31 21:07:36.135	\N
00d3e81f-4506-44a7-aad7-4dfed988ecb2	8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.137	2026-01-31 21:07:36.137	\N
06a100a4-29bd-4e1b-a44c-2cbdb34c9a52	8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.138	2026-01-31 21:07:36.138	\N
75aef31d-b942-4cb1-8986-7fbcf8648808	8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.139	2026-01-31 21:07:36.139	\N
ddb5d987-387c-4e32-a8bc-b788604355bd	8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.141	2026-01-31 21:07:36.141	\N
5483ea21-a342-44a4-8c98-96265e4d3860	8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.142	2026-01-31 21:07:36.142	\N
88040b90-afa3-4da9-abef-d97c5744d8e5	80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	1	PAID	4166	0	4166	2026-01-26 23:21:32.841	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.145	2026-01-31 21:07:36.145	\N
48362de1-7f3c-4484-9a34-e8a812caa8e7	80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	2	PAID	4166	0	4166	2026-01-24 20:43:47.17	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.147	2026-01-31 21:07:36.147	\N
a91ff103-e789-4efa-a2c3-1367f4299e9b	80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	3	PAID	4166	0	4166	2026-01-23 22:07:22.086	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.149	2026-01-31 21:07:36.149	\N
afc8ba0a-29ff-42b9-9f88-0c8400816449	80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	4	PAID	4166	0	4166	2026-01-22 07:49:52.053	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.15	2026-01-31 21:07:36.15	\N
5e298eb9-1edf-4be4-80ea-5fbd5cc46c57	80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	5	PAID	4166	0	4166	2026-01-26 22:07:22.441	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.152	2026-01-31 21:07:36.152	\N
4a5f1d2c-7936-4536-bc65-255f903a85a0	80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	6	PAID	4166	0	4166	2026-01-27 08:37:19.993	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.153	2026-01-31 21:07:36.153	\N
6bf28d60-c5b8-4366-8ce9-f6abf47184f8	80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.155	2026-01-31 21:07:36.155	\N
c4e01f01-d93d-4b7f-9191-21d73f08c3fc	80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.158	2026-01-31 21:07:36.158	\N
34cf4555-da3e-4486-8f10-430bf0d60120	80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.161	2026-01-31 21:07:36.161	\N
28607642-01cc-4e05-9730-faac9deeed82	80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.162	2026-01-31 21:07:36.162	\N
35942c45-d51d-4167-8d7e-d2de3d856c3a	80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.164	2026-01-31 21:07:36.164	\N
aa05147e-fe17-4f65-bd20-04a820d7b1c4	619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	1	PAID	4166	0	4166	2026-01-26 12:05:02.272	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.167	2026-01-31 21:07:36.167	\N
35c1aeea-33da-4c8a-afe3-ab7b9b8bf7a0	619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	2	PAID	4166	0	4166	2026-01-13 10:22:40.32	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.169	2026-01-31 21:07:36.169	\N
0761738a-8d08-43ed-b62e-6ebe0cc6409c	619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	3	PAID	4166	0	4166	2026-01-10 22:50:14.487	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.171	2026-01-31 21:07:36.171	\N
ca2ca8ad-427b-4ff4-9b38-2e1fb98bce86	619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	4	PAID	4166	0	4166	2026-01-05 10:44:01.918	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.172	2026-01-31 21:07:36.172	\N
bd47cb45-30d7-4602-abbe-7a81bf3811fb	619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	5	PAID	4166	0	4166	2026-01-03 13:27:57.841	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.174	2026-01-31 21:07:36.174	\N
ce0c24f5-fc0f-48b7-b8ff-83758e20658b	619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	6	PAID	4166	0	4166	2026-01-03 01:46:48.985	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.176	2026-01-31 21:07:36.176	\N
005d2b76-821f-45fe-a11f-79086eafb123	619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.177	2026-01-31 21:07:36.177	\N
8a6715c5-a9d7-4a6d-903a-1b099ea5887b	619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.179	2026-01-31 21:07:36.179	\N
c098db4c-e03a-4a99-89d5-9122a0939d94	619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.18	2026-01-31 21:07:36.18	\N
8c16dbce-a05c-445b-b8e4-9721eeaf5e54	619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.182	2026-01-31 21:07:36.182	\N
289d7426-814c-4428-baaf-1f0a32b8d082	619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.184	2026-01-31 21:07:36.184	\N
fd765ec9-67c2-43e8-8d42-d592a0cbeddc	619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.186	2026-01-31 21:07:36.186	\N
2a92cf9c-9567-4a30-a5b6-6434e946b1d2	362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	1	PAID	4166	0	4166	2026-01-16 21:17:53.152	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.19	2026-01-31 21:07:36.19	\N
7154a4b1-9dab-4a76-ae8b-0e4971767800	362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	2	PAID	4166	0	4166	2026-01-03 15:58:02.716	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.191	2026-01-31 21:07:36.191	\N
ddb7eddf-c82a-4303-8efa-f3ba7fbe37a7	362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	3	PAID	4166	0	4166	2026-01-22 10:27:21.033	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.193	2026-01-31 21:07:36.193	\N
235c4397-00ee-4e23-b0ae-d3e13fe222e2	362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	4	PAID	4166	0	4166	2026-01-21 18:37:01.002	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.195	2026-01-31 21:07:36.195	\N
6a8bc3f7-8761-4736-a33f-5f4c41852916	362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	5	PAID	4166	0	4166	2026-01-09 18:11:36.71	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.197	2026-01-31 21:07:36.197	\N
079462d6-75e4-4be5-9e99-4146459523d1	362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	6	PAID	4166	0	4166	2026-01-14 16:22:55.111	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.198	2026-01-31 21:07:36.198	\N
ee3bf521-0920-4000-b380-1da79340eafc	362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.2	2026-01-31 21:07:36.2	\N
162dff8f-bf92-4067-a429-300ed86678d3	362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.202	2026-01-31 21:07:36.202	\N
da32079d-2c30-4c0c-8b69-c71d3ab61c9f	362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.203	2026-01-31 21:07:36.203	\N
d7f4c310-0246-4605-9b35-ab9d9e96ca3d	362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.205	2026-01-31 21:07:36.205	\N
6faddb90-1ffd-436a-bac2-28b6d8cfcdb5	362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.207	2026-01-31 21:07:36.207	\N
84caa9fe-2dd7-421d-9e94-e2e2db41f398	362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.208	2026-01-31 21:07:36.208	\N
81331c58-d61f-4a43-bad3-3261bbfd3120	a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	1	PAID	4166	0	4166	2026-01-17 21:35:14.112	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.212	2026-01-31 21:07:36.212	\N
57045660-4d38-470d-bfc3-eaeb8b877a66	a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	2	PAID	4166	0	4166	2026-01-11 06:40:54.077	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.215	2026-01-31 21:07:36.215	\N
ac59becb-1566-4bee-bafe-dee4582364eb	a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	3	PAID	4166	0	4166	2026-01-14 14:13:38.367	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.217	2026-01-31 21:07:36.217	\N
62ec86ba-ebb4-4689-bc14-d9d982277c01	a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	4	PAID	4166	0	4166	2026-01-23 18:51:43.581	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.219	2026-01-31 21:07:36.219	\N
87230116-7340-4853-bb99-8d6a98cabad9	a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	5	PAID	4166	0	4166	2026-01-04 10:23:57.472	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.221	2026-01-31 21:07:36.221	\N
5dfb0c2d-1e46-4b4d-b752-aadc85ac1445	a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	6	PAID	4166	0	4166	2026-01-17 10:30:14.316	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.223	2026-01-31 21:07:36.223	\N
ed4d66f8-10a4-4c00-ae5a-4135a6ba5e86	a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.225	2026-01-31 21:07:36.225	\N
4f8d747b-6240-44af-bc7d-4e8fd3c88526	a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.226	2026-01-31 21:07:36.226	\N
5bac6617-e6ae-4e38-9d11-992f6631f866	a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.228	2026-01-31 21:07:36.228	\N
adea9c37-8eee-4cd7-bc1e-b930833b7d9b	a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.23	2026-01-31 21:07:36.23	\N
9e925297-8a01-4f53-8fae-0b02aba566bb	a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.232	2026-01-31 21:07:36.232	\N
fbb88b98-f644-42fa-9153-393a381174e9	a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.233	2026-01-31 21:07:36.233	\N
98bc6c26-355b-4278-8496-6c24316169c1	851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	1	PAID	4166	0	4166	2026-01-24 00:42:26.432	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.237	2026-01-31 21:07:36.237	\N
d2aac1aa-233b-42ee-843d-0f118f7e36b7	851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	2	PAID	4166	0	4166	2026-01-05 23:49:32.599	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.238	2026-01-31 21:07:36.238	\N
602947c8-28db-4a42-805c-7fc67c862ed0	851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	3	PAID	4166	0	4166	2026-01-30 11:03:47.543	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.24	2026-01-31 21:07:36.24	\N
6d8b8856-32c5-4832-b289-b293211668a3	851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	4	PAID	4166	0	4166	2026-01-10 11:38:17.173	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.242	2026-01-31 21:07:36.242	\N
91938f35-3151-428b-92f5-33615629707f	851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	5	PAID	4166	0	4166	2026-01-21 09:41:58.271	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.244	2026-01-31 21:07:36.244	\N
2ec11566-9da4-4864-bebb-3f92ecd48c09	851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	6	PAID	4166	0	4166	2026-01-31 11:15:44.886	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.245	2026-01-31 21:07:36.245	\N
ffd5af2e-5e31-4b84-9201-5323dff80874	851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.247	2026-01-31 21:07:36.247	\N
a1fb0ba7-09e1-4887-a076-00c49b7cc8cc	851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.249	2026-01-31 21:07:36.249	\N
79d2f667-2667-410e-b877-8fc28f381283	851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.252	2026-01-31 21:07:36.252	\N
3fe3e3d1-6212-4905-83dd-1cb214b1df94	851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.254	2026-01-31 21:07:36.254	\N
15064b8a-a7c6-4f15-b0e3-3f900075b00a	851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.256	2026-01-31 21:07:36.256	\N
4035634f-1cb9-4c86-baf0-c2397c809522	851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.259	2026-01-31 21:07:36.259	\N
cc7ad012-caca-4f9e-afbe-396b7ecf257b	22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	1	PAID	4166	0	4166	2026-01-15 07:30:35.913	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.263	2026-01-31 21:07:36.263	\N
bde2354b-1c5f-4ae3-a8b1-161346024cad	22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	2	PAID	4166	0	4166	2026-01-14 23:07:58.007	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.265	2026-01-31 21:07:36.265	\N
424e3d58-d8d5-4898-9800-4549442533c9	22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	3	PAID	4166	0	4166	2026-01-24 02:08:20.43	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.266	2026-01-31 21:07:36.266	\N
901ea0c1-3fee-4775-bd5a-80a06ddef381	22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	4	PAID	4166	0	4166	2026-01-10 10:03:47.474	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.268	2026-01-31 21:07:36.268	\N
a4c1e948-9906-4a06-8ea7-bfc84fa530d5	22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	5	PAID	4166	0	4166	2026-01-22 00:11:00.662	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.271	2026-01-31 21:07:36.271	\N
ee35deb9-e0a0-40bc-92ed-a24ad18d2d7a	22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	6	PAID	4166	0	4166	2026-01-26 17:05:33.759	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.273	2026-01-31 21:07:36.273	\N
0f7053ad-783f-47be-adab-521c543a6c79	22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.276	2026-01-31 21:07:36.276	\N
a04c7e9b-524f-4928-903a-e30157986ac2	22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.278	2026-01-31 21:07:36.278	\N
1a4e976f-9d42-49e9-867c-7538277f41f6	22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.283	2026-01-31 21:07:36.283	\N
5676dc3f-dc03-45f0-9b5e-50618d946ffd	22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.286	2026-01-31 21:07:36.286	\N
275f47c2-198e-4deb-91ae-4975d7607970	22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.289	2026-01-31 21:07:36.289	\N
3595e26f-f3d3-4db2-9b0b-7764599eeb02	22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.291	2026-01-31 21:07:36.291	\N
076549a9-d95b-43ac-b740-5becd7626a43	c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	1	PAID	4166	0	4166	2026-01-18 09:27:08.018	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.295	2026-01-31 21:07:36.295	\N
197d6c59-efb2-4add-8a7c-2d66e5fbebc1	c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	2	PAID	4166	0	4166	2026-01-02 06:38:34.385	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.296	2026-01-31 21:07:36.296	\N
4521ccc5-d058-4fe6-b53e-083096a0ee7d	c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	3	PAID	4166	0	4166	2026-01-24 04:46:53.74	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.298	2026-01-31 21:07:36.298	\N
15329962-af59-4645-922d-12b55d7fc126	c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	4	PAID	4166	0	4166	2026-01-24 13:21:34.44	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.299	2026-01-31 21:07:36.299	\N
cfd3087c-77f3-4bf9-ad19-235417d62ed5	c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	5	PAID	4166	0	4166	2026-01-18 08:58:20.862	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.301	2026-01-31 21:07:36.301	\N
00bb5aad-ebf8-4319-b166-10b595e223c0	c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	6	PAID	4166	0	4166	2026-01-04 18:06:04.581	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.302	2026-01-31 21:07:36.302	\N
156beb60-4cf1-4345-bb1f-8837ed1e27dd	c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.304	2026-01-31 21:07:36.304	\N
5202e268-41d0-4d1b-b55e-e8c09387f827	c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.306	2026-01-31 21:07:36.306	\N
e8a1562f-f600-457c-a24c-837aee537db8	c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.307	2026-01-31 21:07:36.307	\N
f7edf935-8700-4400-bd8d-96095b48d9d1	c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.31	2026-01-31 21:07:36.31	\N
ae55dc93-2fe8-45c7-a44d-a451165b8e29	c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.312	2026-01-31 21:07:36.312	\N
adef3692-f743-459d-8cef-4158e3bff886	c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.313	2026-01-31 21:07:36.313	\N
0a92559b-7b10-4b07-9ca2-a5802c16878b	d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	1	PAID	4166	0	4166	2026-01-26 07:51:55.647	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.317	2026-01-31 21:07:36.317	\N
5a88303d-7275-4439-9d76-25ced347cc5e	d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	2	PAID	4166	0	4166	2026-01-30 13:10:52.986	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.319	2026-01-31 21:07:36.319	\N
afe7bb34-3475-43da-900f-6e07adcccc8c	d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	3	PAID	4166	0	4166	2026-01-27 14:27:21.839	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.32	2026-01-31 21:07:36.32	\N
f91cb88f-bf87-4e9b-89a3-3990bf09c939	d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	4	PAID	4166	0	4166	2026-01-03 21:36:04.17	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.322	2026-01-31 21:07:36.322	\N
f2b9747d-d0a5-4e08-9503-6b5bd6016bc7	d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	5	PAID	4166	0	4166	2026-01-04 15:49:07.755	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.324	2026-01-31 21:07:36.324	\N
5a9fa852-1325-4e85-962f-26d52048825c	d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	6	PAID	4166	0	4166	2026-01-18 02:17:05.217	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.326	2026-01-31 21:07:36.326	\N
4ec5345e-1efe-4679-9ea2-2b7d5e2dfe3c	d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.328	2026-01-31 21:07:36.328	\N
093c4af4-973f-4c44-b2ea-caf5dca97e9f	d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.33	2026-01-31 21:07:36.33	\N
b1519e8b-1a91-4c21-8703-38f491173e35	d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.332	2026-01-31 21:07:36.332	\N
927c014b-872c-4d79-86e2-b63a8031a20f	d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.333	2026-01-31 21:07:36.333	\N
7f98eb0c-9f16-49f3-9dc9-ea29e2df955a	d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.335	2026-01-31 21:07:36.335	\N
d76305b3-642b-4329-9ff7-027866c79d4f	d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.337	2026-01-31 21:07:36.337	\N
c06fd967-8f3e-4600-8711-40338722b512	2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	1	PAID	4166	0	4166	2026-01-13 10:29:54.067	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.34	2026-01-31 21:07:36.34	\N
ccbf987a-9d72-428a-bf98-9e662282ad3a	2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	2	PAID	4166	0	4166	2026-01-08 13:26:58.621	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.342	2026-01-31 21:07:36.342	\N
0339ad0d-b7bd-4038-98bf-6e7cc8e33e2b	2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	3	PAID	4166	0	4166	2026-01-24 19:44:32.056	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.344	2026-01-31 21:07:36.344	\N
08441231-64c0-46ca-a302-5e8d3c3fe64e	2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	4	PAID	4166	0	4166	2026-01-12 19:20:55.751	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.346	2026-01-31 21:07:36.346	\N
d0346cd9-8ca4-498c-a68d-f941fa75261e	2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	5	PAID	4166	0	4166	2026-01-20 12:49:44.011	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.349	2026-01-31 21:07:36.349	\N
7d98a6de-fbd4-47aa-9a2f-bff064ef7e4f	2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	6	PAID	4166	0	4166	2026-01-28 16:23:52.915	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.351	2026-01-31 21:07:36.351	\N
c4618dc0-c2e9-4b7c-b72d-4139d9a796ee	2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.353	2026-01-31 21:07:36.353	\N
b0c84dae-8948-4567-a6e6-193c6c0cae95	2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.354	2026-01-31 21:07:36.354	\N
1df62769-a299-4763-92e9-77ce8d36ed74	2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.356	2026-01-31 21:07:36.356	\N
2d50ec2f-e007-4698-b050-350af857eddf	2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.358	2026-01-31 21:07:36.358	\N
c46fe8f6-7b76-40af-81b5-3bcabb738a66	2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.361	2026-01-31 21:07:36.361	\N
b237ddc2-5e6a-4bc4-8b7d-8bce0168c83a	2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.363	2026-01-31 21:07:36.363	\N
d3018968-ef09-4db2-9b90-b8a7be8d6d46	a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	1	PAID	4166	0	4166	2026-01-09 18:13:07.035	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.367	2026-01-31 21:07:36.367	\N
4de6a72c-3aea-47b3-87b0-a8a8fc7a87ee	a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	2	PAID	4166	0	4166	2026-01-17 06:57:57.164	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.369	2026-01-31 21:07:36.369	\N
4d5bd8ba-afbd-44e9-b3cd-569dd2045cd3	a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	3	PAID	4166	0	4166	2026-01-27 15:47:23.941	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.371	2026-01-31 21:07:36.371	\N
41536c7f-31c5-490e-96b3-ae6a8d6c3285	a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	4	PAID	4166	0	4166	2026-01-25 18:21:00.34	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.372	2026-01-31 21:07:36.372	\N
331c7d8c-b997-46a4-b9e7-0182143494c0	a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	5	PAID	4166	0	4166	2026-01-04 05:51:55.19	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.374	2026-01-31 21:07:36.374	\N
9f94b7d6-5b7d-4378-81ee-bdd0b4d4284d	a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	6	PAID	4166	0	4166	2026-01-05 05:24:42.788	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.376	2026-01-31 21:07:36.376	\N
cc918dda-c2c9-4e49-a6b9-18acdeeb7887	a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.377	2026-01-31 21:07:36.377	\N
1d7f367f-f991-4d4c-964a-46bfe85e1c13	a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.379	2026-01-31 21:07:36.379	\N
8a8525fb-0209-42dc-8d0d-17c62aa56696	a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.381	2026-01-31 21:07:36.381	\N
0bf7ee05-8fd6-4a93-ace2-cf0b99f29218	a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.382	2026-01-31 21:07:36.382	\N
e369d681-d310-4ec7-8076-ddd5de4bb4cf	a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.384	2026-01-31 21:07:36.384	\N
c4d435a7-6b48-416d-b1ff-24cfb89a4cc0	a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.386	2026-01-31 21:07:36.386	\N
4bbc136e-3745-4917-a08d-b0bcd219e106	288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	1	PAID	4166	0	4166	2026-01-19 04:15:49.353	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.389	2026-01-31 21:07:36.389	\N
d7c9df30-bca1-454f-ae9a-5bfef94f4618	288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	2	PAID	4166	0	4166	2026-01-13 05:45:36.004	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.391	2026-01-31 21:07:36.391	\N
582a7659-4ee6-4b15-afda-57da225f7203	288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	3	PAID	4166	0	4166	2026-01-17 08:17:43.71	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.393	2026-01-31 21:07:36.393	\N
307319b8-87a1-4258-bd12-5a0df65aedbf	288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	4	PAID	4166	0	4166	2026-01-01 04:26:52.231	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.395	2026-01-31 21:07:36.395	\N
c50b8e29-cdd9-40bb-93c3-0f7044f97bd1	288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	5	PAID	4166	0	4166	2026-01-08 02:34:45.814	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.397	2026-01-31 21:07:36.397	\N
21591394-744e-41ba-bd65-3fd3b5bcdca2	288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	6	PAID	4166	0	4166	2026-01-15 00:24:56.999	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.399	2026-01-31 21:07:36.399	\N
b4865477-2425-4ddf-a736-12054ce67a40	288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.401	2026-01-31 21:07:36.401	\N
6092ddf0-0257-4e3c-88ed-25e6d16720b4	288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.403	2026-01-31 21:07:36.403	\N
82e5aa72-eabf-46a1-a80b-65e18436f947	288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.404	2026-01-31 21:07:36.404	\N
72c8f65a-182b-4365-a756-05d6540215bd	288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.406	2026-01-31 21:07:36.406	\N
0b2ecc3e-ce8a-45ce-9e75-aa29e648b0a4	288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.408	2026-01-31 21:07:36.408	\N
2bcb90ac-a936-4e23-abdb-9ad2deee7c64	288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.409	2026-01-31 21:07:36.409	\N
37a93a8e-f8d8-4c26-8c0b-b5d291c5fe5b	b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	1	PAID	4166	0	4166	2026-01-16 03:35:11.617	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.413	2026-01-31 21:07:36.413	\N
7781cedc-ed4c-4ac4-abf1-d1205ed2cdac	b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	2	PAID	4166	0	4166	2026-01-20 05:01:36.928	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.414	2026-01-31 21:07:36.414	\N
c768f69d-f1af-48ee-8b7d-1bce1e65fe31	b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	3	PAID	4166	0	4166	2026-01-15 00:59:40.052	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.416	2026-01-31 21:07:36.416	\N
a04c150b-5b02-42a6-928f-1abbace1df71	b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	4	PAID	4166	0	4166	2026-01-11 17:01:47.552	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.418	2026-01-31 21:07:36.418	\N
23c0439e-2d9a-46ee-b43e-d726c869c88f	b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	5	PAID	4166	0	4166	2026-01-20 05:29:52.212	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.42	2026-01-31 21:07:36.42	\N
299b9910-f884-4735-a660-fd712b436b22	b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	6	PAID	4166	0	4166	2026-01-21 01:19:41.938	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.422	2026-01-31 21:07:36.422	\N
cecf6163-63ad-4045-aac1-195979c45502	b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.424	2026-01-31 21:07:36.424	\N
adb13547-4728-4d5c-812d-3e2014158a83	b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.425	2026-01-31 21:07:36.425	\N
74f8702c-a5bd-4dae-a3dc-1e0b8f1f04f8	b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.427	2026-01-31 21:07:36.427	\N
76acbe9f-2a5b-4df7-bf53-1e8fe7e7ecd7	b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.43	2026-01-31 21:07:36.43	\N
6bd055b3-ef78-4f8c-bc42-827e88c8053f	b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.433	2026-01-31 21:07:36.433	\N
ae2def9c-cc48-47a1-ad7f-4f6fa973c83f	b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.435	2026-01-31 21:07:36.435	\N
1eca9682-30a8-4061-9ecc-c8125b0fe4e9	0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	1	PAID	4166	0	4166	2026-01-07 09:05:47.828	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.439	2026-01-31 21:07:36.439	\N
daf6fd17-20e6-4206-9b87-7491982bb64d	0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	2	PAID	4166	0	4166	2026-01-19 04:18:33.606	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.442	2026-01-31 21:07:36.442	\N
e9c3cee7-a779-4c70-9460-11657d6596cb	0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	3	PAID	4166	0	4166	2026-01-29 21:56:31.777	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.444	2026-01-31 21:07:36.444	\N
78c2c040-067a-4028-9660-8aa0e4d5c348	0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	4	PAID	4166	0	4166	2026-01-09 16:06:48.735	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.447	2026-01-31 21:07:36.447	\N
0313b533-b4a9-4b11-953f-0c7e09586cd2	0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	5	PAID	4166	0	4166	2026-01-20 19:00:35.358	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.449	2026-01-31 21:07:36.449	\N
525ddc83-917a-4156-b4ee-4af3ae07cc80	0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	6	PAID	4166	0	4166	2026-01-29 19:51:47.183	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.45	2026-01-31 21:07:36.45	\N
170e58e4-dd4c-4f46-b6b9-69b560bdc1e1	0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.452	2026-01-31 21:07:36.452	\N
b071dfe0-1f10-4d03-bca7-3b463b188e57	0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.454	2026-01-31 21:07:36.454	\N
af4ef29a-9030-4cfe-b4ce-e1df42a18844	0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.455	2026-01-31 21:07:36.455	\N
6f27bd0d-4fa4-457a-9670-bdc63db5e045	0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.46	2026-01-31 21:07:36.46	\N
1032d965-2f63-4419-b9ef-a12be4033507	0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.462	2026-01-31 21:07:36.462	\N
d7122672-32cf-404a-a36b-95548f7d25fa	0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.463	2026-01-31 21:07:36.463	\N
023bce7d-bb9d-450e-8d24-b44d1f4450e8	bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	1	PAID	4166	0	4166	2026-01-08 00:03:30.93	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.467	2026-01-31 21:07:36.467	\N
3cd43fbe-2286-43f4-b8ad-617484b10ff9	bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	2	PAID	4166	0	4166	2026-01-11 20:35:09.323	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.468	2026-01-31 21:07:36.468	\N
66bd9618-58e6-4f4a-a362-a1bd1a99e617	bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	3	PAID	4166	0	4166	2026-01-10 17:55:20.205	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.47	2026-01-31 21:07:36.47	\N
f3d01b66-99ed-4508-b820-3765616925a6	bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	4	PAID	4166	0	4166	2026-01-10 23:51:24.787	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.471	2026-01-31 21:07:36.471	\N
9402a1a7-b4e9-4cbf-8cb0-0cd1f59aa381	bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	5	PAID	4166	0	4166	2026-01-23 08:40:09.243	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.473	2026-01-31 21:07:36.473	\N
cdd36970-7d46-4170-ab08-c46736e9cb63	bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	6	PAID	4166	0	4166	2026-01-10 01:12:40.478	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.474	2026-01-31 21:07:36.474	\N
0e8cbf98-44f9-4a0a-9b46-753b6f3dc9ab	bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.477	2026-01-31 21:07:36.477	\N
fc8d9283-79ea-450e-bb9f-a4d5607d10ed	bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.48	2026-01-31 21:07:36.48	\N
a95868af-f5fa-4d85-ba66-0348aa4f54e7	bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.482	2026-01-31 21:07:36.482	\N
6bcc0cb6-086b-4fb0-9a54-b73aabc26c3e	bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.484	2026-01-31 21:07:36.484	\N
544bf8d7-b917-4c5d-bb8b-202dd2366ff2	bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.486	2026-01-31 21:07:36.486	\N
c3275bf3-60ce-4206-b447-c0d81b772808	bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.488	2026-01-31 21:07:36.488	\N
c4b0fdd4-d4cf-498e-991b-0b5eba91d336	9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	1	PAID	4166	0	4166	2026-01-15 00:58:20.233	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.492	2026-01-31 21:07:36.492	\N
66177ed2-fbcd-4f47-8f40-659b7310895e	9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	2	PAID	4166	0	4166	2026-01-21 17:34:31.162	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.494	2026-01-31 21:07:36.494	\N
9f7c379f-6a61-4b0c-b3ec-7e3cd8275b00	9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	3	PAID	4166	0	4166	2026-01-19 04:15:14.302	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.496	2026-01-31 21:07:36.496	\N
5eeecc1e-994c-4c67-baa4-5a86af167ce5	9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	4	PAID	4166	0	4166	2026-01-28 15:40:38.353	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.498	2026-01-31 21:07:36.498	\N
6df68fe6-ea17-462d-b02d-c7e4909c54cd	9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	5	PAID	4166	0	4166	2026-01-06 13:30:40.402	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.5	2026-01-31 21:07:36.5	\N
e81dc314-d8c4-4522-911b-cadab33bf3a6	9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	6	PAID	4166	0	4166	2026-01-28 15:27:57.988	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.502	2026-01-31 21:07:36.502	\N
c457578f-07c8-4c6f-a125-4d0e4bfcabe8	9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.503	2026-01-31 21:07:36.503	\N
69caf1b9-ec61-4426-bd62-73e3536436be	9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.505	2026-01-31 21:07:36.505	\N
d76edf83-9c2c-43f3-b3ef-84c09edca132	9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.506	2026-01-31 21:07:36.506	\N
51fdbc99-3c60-4e40-9ef4-4087f659aef2	9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	10	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.507	2026-01-31 21:07:36.507	\N
7c9f0ad5-794b-4ba9-9ccc-f4a0fcde3077	9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	11	PENDING	4166	4166	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.509	2026-01-31 21:07:36.509	\N
fe1cee3e-8242-403c-9ad6-1d829fb24d78	9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	12	PENDING	4174	4174	0	\N	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.51	2026-01-31 21:07:36.51	\N
ff0fa146-d38c-4b02-9859-9815574e0ae5	48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	1	PAID	4166	0	4166	2026-01-11 23:27:50.369	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.513	2026-01-31 21:07:36.513	\N
631032aa-728a-46e2-bfab-6e3cb369ca9e	48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	2	PAID	4166	0	4166	2026-01-05 21:00:53.167	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.515	2026-01-31 21:07:36.515	\N
999ce0a7-1010-4171-aa2c-3042ea350e60	48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	3	PAID	4166	0	4166	2026-01-15 23:47:46.337	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.516	2026-01-31 21:07:36.516	\N
f25467d7-54c8-4699-a66c-8f16ea82051e	48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	4	PAID	4166	0	4166	2026-01-28 23:18:15.561	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.518	2026-01-31 21:07:36.518	\N
ba722895-6e9e-4974-a33b-0b543d592144	48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	5	PAID	4166	0	4166	2026-01-04 12:05:43.157	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.52	2026-01-31 21:07:36.52	\N
41417532-f19d-49f8-964b-e47e4cd8ee40	48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	6	PAID	4166	0	4166	2026-01-17 15:15:53.712	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.521	2026-01-31 21:07:36.521	\N
f8822fc6-d31b-4f7b-ab83-245645364390	48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.523	2026-01-31 21:07:36.523	\N
619c0eea-6c6f-4774-a5c7-31a88d378885	48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.525	2026-01-31 21:07:36.525	\N
11bc1247-d082-4aec-8745-f7aecf121065	48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.527	2026-01-31 21:07:36.527	\N
78fd35f9-e1f7-4b54-a150-743eacc745e7	48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.529	2026-01-31 21:07:36.529	\N
95c7407f-c3e4-454c-93cd-cabc364ed591	48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.53	2026-01-31 21:07:36.53	\N
c4e3a72c-a48a-4b7a-9e18-caf030ec98a5	48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.532	2026-01-31 21:07:36.532	\N
12626f8a-edae-4ba2-b384-105985b53efb	fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	1	PAID	4166	0	4166	2026-01-07 06:27:39.123	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.535	2026-01-31 21:07:36.535	\N
281f1ac5-e8b2-47db-8748-52102929f25d	fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	2	PAID	4166	0	4166	2026-01-25 22:34:34.055	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.537	2026-01-31 21:07:36.537	\N
9f809772-0a22-43c0-9bac-7975292be38b	fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	3	PAID	4166	0	4166	2026-01-17 18:17:05.874	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.538	2026-01-31 21:07:36.538	\N
738c4ea1-da04-4c15-b75e-d00577f11850	fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	4	PAID	4166	0	4166	2026-01-18 06:01:40.859	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.54	2026-01-31 21:07:36.54	\N
ef431ed6-9f94-4d29-a2bb-8f7a23600ff2	fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	5	PAID	4166	0	4166	2026-01-21 13:40:40.773	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.541	2026-01-31 21:07:36.541	\N
5adc6680-088b-457c-8412-a64af0523a41	fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	6	PAID	4166	0	4166	2026-01-30 08:46:50.97	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.543	2026-01-31 21:07:36.543	\N
02de7b8f-8131-41a8-b638-03e23c9442e9	fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.544	2026-01-31 21:07:36.544	\N
03da6a69-c253-4887-b119-de41f4b4ef10	fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.546	2026-01-31 21:07:36.546	\N
ef92b027-d671-4b67-bd35-4333ed9a9f88	fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.547	2026-01-31 21:07:36.547	\N
b80db9eb-a723-4f13-a52f-2af4404b092b	fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.549	2026-01-31 21:07:36.549	\N
0c4a4e29-cc13-4e94-a9c4-d84c1e9e331c	fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.55	2026-01-31 21:07:36.55	\N
edced963-e476-42e0-8792-8505a27bd027	fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.552	2026-01-31 21:07:36.552	\N
751aeea5-1a3a-4d44-ac78-c8b55f8e0a15	7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	1	PAID	4166	0	4166	2026-01-14 21:52:01.394	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.555	2026-01-31 21:07:36.555	\N
23712515-cff3-4bf6-8760-422cdf432435	7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	2	PAID	4166	0	4166	2026-01-18 19:58:53.311	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.557	2026-01-31 21:07:36.557	\N
6254bf39-083d-4e66-adfb-3d165afd1a30	7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	3	PAID	4166	0	4166	2026-01-31 00:56:08.451	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.559	2026-01-31 21:07:36.559	\N
c0d7e633-c922-4366-9f68-80a9047495a5	7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	4	PAID	4166	0	4166	2026-01-19 11:16:04.154	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.561	2026-01-31 21:07:36.561	\N
c170e04b-a0d8-47be-860e-ef5e1b0befbc	7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	5	PAID	4166	0	4166	2026-01-04 23:37:31.757	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.563	2026-01-31 21:07:36.563	\N
229ee9ee-0cb7-4f0c-b6b5-dde74766de6e	7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	6	PAID	4166	0	4166	2026-01-08 00:15:12.289	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.565	2026-01-31 21:07:36.565	\N
6e77d38c-9524-49a5-a0d2-30e2fd1fe1dc	7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.567	2026-01-31 21:07:36.567	\N
e4fa0bf1-9978-4207-b672-675d93bc887d	7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.569	2026-01-31 21:07:36.569	\N
0ca23f26-250a-48c1-ba80-f0bd3d1914e2	7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.571	2026-01-31 21:07:36.571	\N
20c83d1d-4f92-4011-a23b-6b58fc4ed7da	7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.572	2026-01-31 21:07:36.572	\N
10dff883-0b30-43c7-a036-a15ec7849a69	7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.574	2026-01-31 21:07:36.574	\N
dde0db65-ac47-4548-844c-8fa0d4f8c5bd	7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.576	2026-01-31 21:07:36.576	\N
8adf82da-7009-4612-9af6-6ad221b562ea	c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	1	PAID	4166	0	4166	2026-01-22 02:10:29.351	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.579	2026-01-31 21:07:36.579	\N
2f77151a-1b0e-4706-bf9d-21f5e3e722f1	c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	2	PAID	4166	0	4166	2026-01-13 15:24:14.295	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.581	2026-01-31 21:07:36.581	\N
01db6b37-7155-4be5-b7f5-10e026b04c5e	c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	3	PAID	4166	0	4166	2026-01-27 09:40:18.679	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.583	2026-01-31 21:07:36.583	\N
d64c7b8d-11af-4068-9412-54f9d3a578d1	c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	4	PAID	4166	0	4166	2026-01-17 17:45:58.825	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.585	2026-01-31 21:07:36.585	\N
94d431a6-2420-4e02-9512-124ab14e93eb	c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	5	PAID	4166	0	4166	2026-01-27 21:19:07.023	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.587	2026-01-31 21:07:36.587	\N
2cd6debc-655a-4b0e-afa1-9a4297a803d3	c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	6	PAID	4166	0	4166	2026-01-25 05:19:36.356	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.59	2026-01-31 21:07:36.59	\N
3b332d2d-9aa8-47d0-bbde-206f16f6bbf4	c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.592	2026-01-31 21:07:36.592	\N
001a5c7e-2faa-4b98-9ac7-6f007005abc1	c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.594	2026-01-31 21:07:36.594	\N
3bb9d019-f613-4a1d-8156-e2087f1dc815	c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.596	2026-01-31 21:07:36.596	\N
a7f330aa-5434-4883-8826-f01581a35e8a	c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.598	2026-01-31 21:07:36.598	\N
dcfd73df-d1bc-40e7-b7f4-f0bc9e6f2745	c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.6	2026-01-31 21:07:36.6	\N
4e446788-03d1-4d27-ac07-37da8c87bf85	c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.602	2026-01-31 21:07:36.602	\N
ed8e7702-559f-4afd-a3ff-d68de3ed2357	32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	1	PAID	4166	0	4166	2026-01-01 23:15:14.583	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.609	2026-01-31 21:07:36.609	\N
df5ef76f-e1ef-4c5f-9227-b565dfd9e15f	32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	2	PAID	4166	0	4166	2026-01-22 11:49:20.81	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.61	2026-01-31 21:07:36.61	\N
9d085069-fdfb-4bcb-bdd3-8c5d0f7dcabf	32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	3	PAID	4166	0	4166	2026-01-22 19:45:42.573	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.612	2026-01-31 21:07:36.612	\N
2308af30-675c-4702-be1d-379acd60bd9b	32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	4	PAID	4166	0	4166	2026-01-07 18:26:20.663	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.615	2026-01-31 21:07:36.615	\N
a2359a50-e82e-4d13-b67b-56a4ada34fc6	32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	5	PAID	4166	0	4166	2026-01-13 18:47:56.027	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.617	2026-01-31 21:07:36.617	\N
e1fe2568-a577-440c-b0f9-6b56ebd488b7	32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	6	PAID	4166	0	4166	2026-01-20 17:06:39.434	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.619	2026-01-31 21:07:36.619	\N
2be93427-14de-4eb6-969f-a1f41fb21816	32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.621	2026-01-31 21:07:36.621	\N
3d09d0f7-81cc-41e8-b241-5c076f5b9838	32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.622	2026-01-31 21:07:36.622	\N
273d578c-b538-42ad-9558-35612b28798f	32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.624	2026-01-31 21:07:36.624	\N
ce6e2952-646b-4f3d-bc22-f7f38d4e3ff3	32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.626	2026-01-31 21:07:36.626	\N
c5ff0b5d-8bfe-4a1a-a9c7-c66261878539	32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.628	2026-01-31 21:07:36.628	\N
4230c27f-29aa-4131-bf17-388268e32d12	32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.63	2026-01-31 21:07:36.63	\N
41eefa3f-b097-4050-a68a-d4de564b60dd	d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	1	PAID	4166	0	4166	2026-01-08 03:20:20.271	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.634	2026-01-31 21:07:36.634	\N
cbfebdcb-f3ba-4b20-8c70-b315952bf1a8	d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	2	PAID	4166	0	4166	2026-01-07 08:13:54.288	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.636	2026-01-31 21:07:36.636	\N
434f68df-b771-461a-abe8-2b22dcd56ad7	d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	3	PAID	4166	0	4166	2026-01-12 00:51:19.103	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.638	2026-01-31 21:07:36.638	\N
a9793626-d4c0-496f-91da-11c35e54bc2c	d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	4	PAID	4166	0	4166	2026-01-19 11:56:56.107	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.639	2026-01-31 21:07:36.639	\N
9025fe50-a621-436a-a088-d8e169615410	d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	5	PAID	4166	0	4166	2026-01-11 17:04:21.22	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.641	2026-01-31 21:07:36.641	\N
a2fb9fe2-04a4-4c57-a3aa-769fa2cd3bb8	d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	6	PAID	4166	0	4166	2026-01-17 20:19:13.591	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.642	2026-01-31 21:07:36.642	\N
761f1be8-5308-43f0-bdfb-8edd2d69d06f	d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.644	2026-01-31 21:07:36.644	\N
c9c2e15a-6e29-49a6-8483-72b4a30fa0b3	d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.645	2026-01-31 21:07:36.645	\N
4c1b9843-4236-46e5-bd11-38f16e4191a6	d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.647	2026-01-31 21:07:36.647	\N
ed09cf77-db89-4b5e-9d32-3f23ad44b447	d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.649	2026-01-31 21:07:36.649	\N
3bff1285-3352-4b32-a516-9baa6a9ca1a1	d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.65	2026-01-31 21:07:36.65	\N
51d5c193-0253-49a3-a7ef-a53217c937dc	d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.652	2026-01-31 21:07:36.652	\N
9ee07b52-e01f-497a-8d8d-58b8ae898144	1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	1	PAID	4166	0	4166	2026-01-26 10:26:03.956	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.655	2026-01-31 21:07:36.655	\N
2d5bbfea-a925-4e45-a810-cfef761ffd50	1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	2	PAID	4166	0	4166	2026-01-14 18:10:48.598	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.657	2026-01-31 21:07:36.657	\N
91a55352-6071-4516-aa0c-5eb2dd7168c9	1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	3	PAID	4166	0	4166	2026-01-29 17:00:29.44	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.658	2026-01-31 21:07:36.658	\N
5dc8ad60-e765-4256-a79f-0325996320e0	1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	4	PAID	4166	0	4166	2026-01-26 07:41:16.93	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.661	2026-01-31 21:07:36.661	\N
cc54233e-c097-4986-a003-3ad8444c6797	1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	5	PAID	4166	0	4166	2026-01-29 20:20:56.305	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.662	2026-01-31 21:07:36.662	\N
8d8174f4-b707-4fe1-9acc-ad014c53f386	1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	6	PAID	4166	0	4166	2026-01-25 17:50:15.64	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.665	2026-01-31 21:07:36.665	\N
b55c87af-1ea9-4d66-a4d9-cfc258e5a271	1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.667	2026-01-31 21:07:36.667	\N
a6c013f2-a044-4635-a6a1-ce8811c8b3fb	1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.669	2026-01-31 21:07:36.669	\N
b29bf3d1-387c-4dae-9ddb-0315a0020a08	1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.671	2026-01-31 21:07:36.671	\N
16ada9cc-076f-4ea4-98c6-48d2ed3f256d	1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.673	2026-01-31 21:07:36.673	\N
ff5385e1-01c9-47b0-ad59-3d4f14fe2935	1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.675	2026-01-31 21:07:36.675	\N
786d8c03-23e2-4924-a18d-8b54ed35ebe5	1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.677	2026-01-31 21:07:36.677	\N
280fb382-acda-4c9d-90c2-eaa6bcfff395	e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	1	PAID	4166	0	4166	2026-01-01 21:53:19.021	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.68	2026-01-31 21:07:36.68	\N
79f1dbf0-4332-49e1-bf3d-e4a0b8796e8c	e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	2	PAID	4166	0	4166	2026-01-21 20:17:53.751	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.682	2026-01-31 21:07:36.682	\N
be162f79-7d63-41a4-a7f1-44b7a0619c2b	e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	3	PAID	4166	0	4166	2026-01-24 18:16:54.778	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.684	2026-01-31 21:07:36.684	\N
4c8e163d-b348-4ea9-8086-71e37dca5362	e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	4	PAID	4166	0	4166	2026-01-22 13:23:10.921	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.686	2026-01-31 21:07:36.686	\N
8a6524b9-0493-40b6-84ea-773754a56ee7	e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	5	PAID	4166	0	4166	2026-01-30 01:52:54.564	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.688	2026-01-31 21:07:36.688	\N
66680ee5-41c9-4940-8060-8780472cb8c7	e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	6	PAID	4166	0	4166	2026-01-27 03:30:41.759	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.691	2026-01-31 21:07:36.691	\N
8cd48234-7b0b-4fa4-a85f-f8786edd0c26	e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.692	2026-01-31 21:07:36.692	\N
cb37c49f-ba31-4945-98fd-4935f3a0bce9	e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.695	2026-01-31 21:07:36.695	\N
907a132d-3b70-4228-b30f-25c5123f953e	e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.698	2026-01-31 21:07:36.698	\N
9819d90a-b16f-45d4-8198-68327f8400df	e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.701	2026-01-31 21:07:36.701	\N
bf167de7-18e6-4e6f-a460-bb6f8307648e	e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.703	2026-01-31 21:07:36.703	\N
c33750d2-b641-4f59-8db2-db8c1a1e71c2	e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.705	2026-01-31 21:07:36.705	\N
68f6f1af-b744-4fd9-926e-eb30199a727a	da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	1	PAID	4166	0	4166	2026-01-14 05:49:29.314	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.709	2026-01-31 21:07:36.709	\N
815346de-73c9-4e15-aca3-5753dd93270a	da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	2	PAID	4166	0	4166	2026-01-10 06:19:57.158	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.711	2026-01-31 21:07:36.711	\N
85cbc582-b83f-47eb-97d4-22a26bac802d	da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	3	PAID	4166	0	4166	2026-01-05 15:48:08.922	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.713	2026-01-31 21:07:36.713	\N
1434c6cf-982b-4815-9cab-3c2b0c67dc5b	da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	4	PAID	4166	0	4166	2026-01-23 19:29:27.638	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.716	2026-01-31 21:07:36.716	\N
99b16434-235a-41db-bf60-f536b91b0339	da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	5	PAID	4166	0	4166	2026-01-05 15:50:47.223	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.718	2026-01-31 21:07:36.718	\N
8037cd05-9d5b-4681-8b85-f8f6dd08eff1	da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	6	PAID	4166	0	4166	2026-01-22 17:09:07.918	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.72	2026-01-31 21:07:36.72	\N
51d9cfb7-073a-42e0-b41d-8166042e0627	da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.721	2026-01-31 21:07:36.721	\N
63bb80ee-66ee-4936-a49d-c7b36c90633b	da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.723	2026-01-31 21:07:36.723	\N
0d5e3fba-7910-4260-8d0e-09d0aa503af7	da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.725	2026-01-31 21:07:36.725	\N
bbd14530-a22d-45b1-9126-fd42d7b4d16b	da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.727	2026-01-31 21:07:36.727	\N
717b29f8-2ae1-4442-82e3-1c1532f94a5a	da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.728	2026-01-31 21:07:36.728	\N
1baf9d95-5a8d-4259-84f6-bcbc52a567c0	da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.73	2026-01-31 21:07:36.73	\N
38892aa4-1b5b-4909-8447-80859972cb95	e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	1	PAID	4166	0	4166	2026-01-29 09:32:38.826	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.734	2026-01-31 21:07:36.734	\N
1c027068-9f2c-4223-a603-763626cffe70	e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	2	PAID	4166	0	4166	2026-01-29 19:29:43.583	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.738	2026-01-31 21:07:36.738	\N
00c594b7-5ac5-4efa-8a9b-40856e21e66e	e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	3	PAID	4166	0	4166	2026-01-26 22:59:53.601	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.74	2026-01-31 21:07:36.74	\N
c8e01497-2643-41e7-a313-a83ea5d15cc8	e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	4	PAID	4166	0	4166	2026-01-10 09:59:53.197	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.743	2026-01-31 21:07:36.743	\N
5a617edc-b73c-4272-b22c-0b2d6ebf1bb7	e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	5	PAID	4166	0	4166	2026-01-09 04:09:07.573	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.745	2026-01-31 21:07:36.745	\N
f98a81e0-7ac7-4518-b5ab-53f818f579a3	e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	6	PAID	4166	0	4166	2026-01-01 03:03:26.701	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.747	2026-01-31 21:07:36.747	\N
4e3d9cde-ed9c-4e58-a594-4c91561a98d8	e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.749	2026-01-31 21:07:36.749	\N
eb409984-6916-4cd3-ae1b-b131e889f61d	e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.751	2026-01-31 21:07:36.751	\N
c3a7dfed-cd80-44b0-bb03-06de9800c3b5	e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.754	2026-01-31 21:07:36.754	\N
0b588120-cab9-48c4-baf4-a1b3b6440815	e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.756	2026-01-31 21:07:36.756	\N
de8e12bb-74ca-4f99-a050-9073779b7541	e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.759	2026-01-31 21:07:36.759	\N
9a2598db-84c7-48ab-b3e7-af7df7964054	e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.762	2026-01-31 21:07:36.762	\N
20f23f20-8000-4660-bec8-23507fd3a0b3	20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	1	PAID	4166	0	4166	2026-01-15 08:03:31.62	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.768	2026-01-31 21:07:36.768	\N
f670b7bc-c562-46ca-bcb4-4ede09f5166d	20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	2	PAID	4166	0	4166	2026-01-30 23:06:25.974	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.77	2026-01-31 21:07:36.77	\N
06d38f9b-03fa-4a2b-b13e-c82bde779046	20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	3	PAID	4166	0	4166	2026-01-25 22:10:14.298	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.772	2026-01-31 21:07:36.772	\N
6072e40e-9083-4d83-836d-ef8922ab4089	20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	4	PAID	4166	0	4166	2026-01-21 02:29:29.129	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.774	2026-01-31 21:07:36.774	\N
5db6b106-dd81-4e97-b9a5-06280b64e603	20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	5	PAID	4166	0	4166	2026-01-15 17:07:42.056	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.776	2026-01-31 21:07:36.776	\N
dda8d47e-c807-48fc-b4df-7b34a242aeda	20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	6	PAID	4166	0	4166	2026-01-03 14:25:36.255	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.777	2026-01-31 21:07:36.777	\N
1401ec00-315b-4c27-bc69-1875d5750888	20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.779	2026-01-31 21:07:36.779	\N
590b744a-ff60-4fd7-9b8a-5c2ad45148ed	20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.781	2026-01-31 21:07:36.781	\N
51c64f25-1e1f-489b-a886-8c20b84777c1	20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.783	2026-01-31 21:07:36.783	\N
6addf258-98e6-43c3-bb3a-92a44c774769	20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.785	2026-01-31 21:07:36.785	\N
313bc2fe-300e-4984-9468-4169b20bce94	20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.787	2026-01-31 21:07:36.787	\N
7ceb58b9-c157-493e-881f-869d545e0336	20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.792	2026-01-31 21:07:36.792	\N
8efdfc2d-c6ff-440c-a36a-9a82ad57d6f3	c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	1	PAID	4166	0	4166	2026-01-30 14:55:35.509	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.795	2026-01-31 21:07:36.795	\N
40f962f1-c6a2-4388-af4c-efd2bdb29a3e	c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	2	PAID	4166	0	4166	2026-01-09 09:22:41.555	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.797	2026-01-31 21:07:36.797	\N
deac5b32-ec70-4f86-be14-6f8e3c56b992	c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	3	PAID	4166	0	4166	2026-01-03 08:07:14.242	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.799	2026-01-31 21:07:36.799	\N
e4208c50-f76d-424c-a02d-aefc8c7df030	c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	4	PAID	4166	0	4166	2026-01-27 13:44:30.941	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.801	2026-01-31 21:07:36.801	\N
a9666ff1-a6e0-4ffb-9db1-88d0495ff8b7	c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	5	PAID	4166	0	4166	2026-01-13 09:53:16.386	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.803	2026-01-31 21:07:36.803	\N
0c0b8047-42bd-4956-b485-c4190d48578a	c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	6	PAID	4166	0	4166	2026-01-25 20:29:41.8	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.805	2026-01-31 21:07:36.805	\N
5d9ce251-bfe5-4ee5-a8b6-81e0b44b0852	c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.807	2026-01-31 21:07:36.807	\N
26871169-3af9-4ac7-87ff-b4d53ebb1efb	c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.81	2026-01-31 21:07:36.81	\N
be263b87-9f3a-4bb2-9c59-411962454bc0	c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.812	2026-01-31 21:07:36.812	\N
9dc70894-fa4e-45bf-b76f-a63f075ac537	c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.814	2026-01-31 21:07:36.814	\N
686cda8b-b1f0-4e97-8426-aadd03ead3e2	c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.816	2026-01-31 21:07:36.816	\N
8bbb1670-2aaa-4fab-893d-4da4259097aa	c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.817	2026-01-31 21:07:36.817	\N
9dc1d6f9-6b64-42df-a748-3b658966cc97	60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	1	PAID	4166	0	4166	2026-01-25 03:02:47.089	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.821	2026-01-31 21:07:36.821	\N
f242a429-2fe1-4042-8b6c-fba4f6e084d5	60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	2	PAID	4166	0	4166	2026-01-06 03:50:43.992	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.823	2026-01-31 21:07:36.823	\N
13d9f47d-323a-4a45-8508-efd9a75fdebf	60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	3	PAID	4166	0	4166	2026-01-19 00:47:59.791	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.825	2026-01-31 21:07:36.825	\N
242e59a8-07d5-4809-8600-412a462f916e	60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	4	PAID	4166	0	4166	2026-01-13 21:08:05.762	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.828	2026-01-31 21:07:36.828	\N
5acda8e4-0b68-46e7-8aea-fe3f58003737	60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	5	PAID	4166	0	4166	2026-01-22 04:20:33.882	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.83	2026-01-31 21:07:36.83	\N
84dc5169-0a96-4521-bba3-b682d1d5c555	60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	6	PAID	4166	0	4166	2026-01-03 03:19:31.436	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.833	2026-01-31 21:07:36.833	\N
f0f849ac-6a40-40c8-8b5a-35f3561638e8	60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.836	2026-01-31 21:07:36.836	\N
2e592533-5384-4b4b-a3d7-793abfc0c73d	60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.839	2026-01-31 21:07:36.839	\N
a9eb970d-b8ac-4766-bb3e-fe69c1b243cc	60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.841	2026-01-31 21:07:36.841	\N
75bfd819-b715-4e3a-8791-3a3f647d3a34	60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.843	2026-01-31 21:07:36.843	\N
169beaca-2a6f-43e9-bb05-ebe03bd8d226	60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.845	2026-01-31 21:07:36.845	\N
16a1773b-7584-4be1-bad9-3e20aa11815b	60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.847	2026-01-31 21:07:36.847	\N
95ca2868-f315-4d8b-b7e4-8eb4132d334a	d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	1	PAID	4166	0	4166	2026-01-29 20:08:47.014	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.851	2026-01-31 21:07:36.851	\N
fd966a54-e4f0-4bac-875c-20410aeeb40f	d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	2	PAID	4166	0	4166	2026-01-01 14:53:10.081	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.853	2026-01-31 21:07:36.853	\N
f57a43a2-828c-45cc-8a75-174a90dea086	d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	3	PAID	4166	0	4166	2026-01-21 18:52:57.281	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.855	2026-01-31 21:07:36.855	\N
efe2a1e6-233f-4da0-8e99-4995f7729850	d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	4	PAID	4166	0	4166	2026-01-17 20:16:38.766	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.856	2026-01-31 21:07:36.856	\N
a0522260-3177-4ec6-85aa-2130b5d4f11b	d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	5	PAID	4166	0	4166	2026-01-29 23:43:06.876	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.859	2026-01-31 21:07:36.859	\N
31d71e3e-5859-4094-b44a-f2c29553970f	d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	6	PAID	4166	0	4166	2026-01-04 04:24:28.041	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.86	2026-01-31 21:07:36.86	\N
a0222745-ef39-4cc7-b323-718481f55dfe	d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.862	2026-01-31 21:07:36.862	\N
0685e8cf-29a5-4be2-b6c7-c63549faf373	d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.864	2026-01-31 21:07:36.864	\N
3adee41e-39ab-421d-aa60-d1666b31ca98	d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.866	2026-01-31 21:07:36.866	\N
b3264a4f-3985-4528-86da-6dc56600a505	d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.869	2026-01-31 21:07:36.869	\N
59347806-c025-4de2-a811-d802f7dbd23c	d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.871	2026-01-31 21:07:36.871	\N
e89548ee-8933-4c17-bf9f-787eb9a79d0d	d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.873	2026-01-31 21:07:36.873	\N
fe1406b5-f852-4b97-99ce-479e5e2048c0	ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	1	PAID	4166	0	4166	2026-01-06 10:48:28.052	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.876	2026-01-31 21:07:36.876	\N
c5c9cbf4-ed11-4fd9-b038-bdbf546c1e98	ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	2	PAID	4166	0	4166	2026-01-20 19:04:31.164	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.879	2026-01-31 21:07:36.879	\N
73547420-d8b3-47d7-b24b-9a092915d20d	ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	3	PAID	4166	0	4166	2026-01-11 10:41:17.942	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.881	2026-01-31 21:07:36.881	\N
e0baf9b1-d053-4dfd-8fe7-88fce223d25e	ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	4	PAID	4166	0	4166	2026-01-18 18:08:17.651	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.883	2026-01-31 21:07:36.883	\N
724f4f07-bbbf-495a-8ea7-3f94f083eb1f	ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	5	PAID	4166	0	4166	2026-01-15 23:07:51.121	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.885	2026-01-31 21:07:36.885	\N
ea0280b8-fc2c-46ca-9213-74d19d4f0df5	ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	6	PAID	4166	0	4166	2026-01-22 02:42:59.741	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.887	2026-01-31 21:07:36.887	\N
804286db-a91c-4732-b49f-d58f74e68262	ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.889	2026-01-31 21:07:36.889	\N
62713b57-da1f-49e4-b366-4754f73c05f1	ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.891	2026-01-31 21:07:36.891	\N
28c05f2b-aeda-4c1d-998b-95cf3bb3f9b1	ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.893	2026-01-31 21:07:36.893	\N
86c8c57a-48b1-4022-9191-72da20c334f5	ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.895	2026-01-31 21:07:36.895	\N
016d8a58-b6b3-4b3d-8cb8-89c49201abf0	ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.897	2026-01-31 21:07:36.897	\N
f3751b55-aee2-4f5e-90fa-f040b7528826	ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.899	2026-01-31 21:07:36.899	\N
a04f20cb-27b6-4d9c-a48e-ace933784983	88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	1	PAID	4166	0	4166	2026-01-16 16:00:47.592	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.903	2026-01-31 21:07:36.903	\N
b818b7d1-c2c6-4c27-8902-c18efb92dbf9	88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	2	PAID	4166	0	4166	2026-01-11 16:39:29.301	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.905	2026-01-31 21:07:36.905	\N
f52db440-89cc-4832-a41a-40a307d10c5f	88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	3	PAID	4166	0	4166	2026-01-22 03:25:27.134	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.907	2026-01-31 21:07:36.907	\N
bbf95d6a-784f-427c-bfaf-7d0ab4da042f	88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	4	PAID	4166	0	4166	2026-01-28 13:46:54.241	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.909	2026-01-31 21:07:36.909	\N
c7954faa-ba05-412b-aa70-51ae603f552b	88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	5	PAID	4166	0	4166	2026-01-06 17:36:16.391	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.91	2026-01-31 21:07:36.91	\N
650f0ae2-de1b-4be2-a7b5-488e24a457c7	88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	6	PAID	4166	0	4166	2026-01-22 00:01:31.783	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.912	2026-01-31 21:07:36.912	\N
52a55698-632b-489b-80ab-aa1a2c86e227	88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.914	2026-01-31 21:07:36.914	\N
c0dc03e2-dd6d-4f2a-8a09-5a461a012296	88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.916	2026-01-31 21:07:36.916	\N
722a005c-16d7-42af-b5e3-cec5c377769d	88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.917	2026-01-31 21:07:36.917	\N
54e0c25e-a61e-408e-853d-b8e3133dbe26	88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.919	2026-01-31 21:07:36.919	\N
bc251a92-b598-46c7-a7ea-82f7705a2804	88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.92	2026-01-31 21:07:36.92	\N
7370be65-80f4-49b6-a6ca-d3cdeff5dd85	88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.923	2026-01-31 21:07:36.923	\N
f24bfb48-a093-4371-bb23-063e2a3f65b4	38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	1	PAID	4166	0	4166	2026-01-19 14:11:06.352	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.928	2026-01-31 21:07:36.928	\N
1c32ad89-a931-4b97-b9fe-dadeefb937f6	38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	2	PAID	4166	0	4166	2026-01-15 13:38:18.945	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.93	2026-01-31 21:07:36.93	\N
15f9f533-043a-4724-bd89-2d030bde74e1	38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	3	PAID	4166	0	4166	2026-01-11 08:59:07.354	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.933	2026-01-31 21:07:36.933	\N
b79f650e-7e5f-4e54-85d9-d618bc4b3dd3	38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	4	PAID	4166	0	4166	2026-01-20 03:17:04.879	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.935	2026-01-31 21:07:36.935	\N
8121b80d-f122-4517-b23e-0c4d8f868103	38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	5	PAID	4166	0	4166	2026-01-18 10:44:54.096	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.937	2026-01-31 21:07:36.937	\N
cb978db1-c4b4-4778-8a12-7c52accd2292	38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	6	PAID	4166	0	4166	2026-01-17 22:09:11.602	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.939	2026-01-31 21:07:36.939	\N
fe68f9fd-a7ff-4ce1-98ff-a8c17fefe967	38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.941	2026-01-31 21:07:36.941	\N
dfcb021e-3236-4f83-b7b2-5fa43cd65557	38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.943	2026-01-31 21:07:36.943	\N
b4e08df7-2d1a-42d8-a606-2cdca60aba4e	38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.945	2026-01-31 21:07:36.945	\N
bdcad2bd-7cbe-4d0e-866e-e3007a177030	38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.947	2026-01-31 21:07:36.947	\N
5887add0-992c-4da2-9703-2d98a233ae0f	38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.949	2026-01-31 21:07:36.949	\N
90553e67-f85a-4bd1-81c0-25c722ef5a6a	38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.95	2026-01-31 21:07:36.95	\N
e284ab90-18ed-47ea-9efb-2a9079d1a942	ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	1	PAID	4166	0	4166	2026-01-22 01:44:33.667	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.953	2026-01-31 21:07:36.953	\N
8a5920c5-bfb7-40b6-bf2d-d2a5688e1a54	ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	2	PAID	4166	0	4166	2026-01-06 11:28:54.614	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.955	2026-01-31 21:07:36.955	\N
3c44c96a-2772-4a5f-9cc2-e47da9aa18d4	ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	3	PAID	4166	0	4166	2026-01-15 11:08:24.509	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.957	2026-01-31 21:07:36.957	\N
54dc4cc5-5477-4af2-8cf6-8e5ec579b51c	ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	4	PAID	4166	0	4166	2026-01-29 01:46:40.923	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.959	2026-01-31 21:07:36.959	\N
9785208f-4cb3-4dcd-8121-e92c4487e41e	ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	5	PAID	4166	0	4166	2026-01-27 11:49:03.071	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.96	2026-01-31 21:07:36.96	\N
bc817d73-6916-4b34-9531-28e89926c898	ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	6	PAID	4166	0	4166	2026-01-13 12:54:49.484	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.962	2026-01-31 21:07:36.962	\N
2f678e03-a980-44a9-b16b-f4c0236c667d	ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.963	2026-01-31 21:07:36.963	\N
65f83ac3-6a4c-4233-b721-12c5d1f8f953	ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.965	2026-01-31 21:07:36.965	\N
cbd2c2c4-14e8-4065-9886-3a216cc160e5	ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.967	2026-01-31 21:07:36.967	\N
b81a9d16-c05a-46be-bed3-ed96a7cdcecc	ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.971	2026-01-31 21:07:36.971	\N
97b851b0-16a1-4f5a-a9c1-731c77381f29	ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.973	2026-01-31 21:07:36.973	\N
1f780848-42af-40fd-8a71-ec587c5fe7fd	ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.975	2026-01-31 21:07:36.975	\N
37deb961-3026-4f60-8f36-80e20e0b2b5c	2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	1	PAID	4166	0	4166	2026-01-04 03:44:36.985	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.978	2026-01-31 21:07:36.978	\N
3d2a9f60-6fd1-4031-9efe-6e43f7315ba2	2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	2	PAID	4166	0	4166	2026-01-24 16:12:52.877	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.979	2026-01-31 21:07:36.979	\N
e400c179-f974-4f6c-a79f-111ddd98ea37	2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	3	PAID	4166	0	4166	2026-01-04 02:59:03.007	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.981	2026-01-31 21:07:36.981	\N
794e28a5-d049-4d12-9994-0ece29874436	2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	4	PAID	4166	0	4166	2026-01-10 13:47:39.267	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.983	2026-01-31 21:07:36.983	\N
709657fa-e5bf-4a99-aa60-918f635f9e0d	2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	5	PAID	4166	0	4166	2026-01-05 15:27:06.725	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.984	2026-01-31 21:07:36.984	\N
48a79339-6dcd-40d9-9055-9b89893c0831	2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	6	PAID	4166	0	4166	2026-01-01 18:29:28.233	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.986	2026-01-31 21:07:36.986	\N
0eee51b1-5a3c-403d-bed9-796f1751f851	2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.988	2026-01-31 21:07:36.988	\N
82633b7d-25fe-4677-b5d8-562010197443	2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.99	2026-01-31 21:07:36.99	\N
6b4740ee-f741-44c5-aa5d-618f5ca2e431	2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.991	2026-01-31 21:07:36.991	\N
acfbe99e-ea94-474e-85bc-34d4e750268f	2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.993	2026-01-31 21:07:36.993	\N
234400c8-f997-49ff-9b24-31a9b6585622	2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.995	2026-01-31 21:07:36.995	\N
90bb9078-2aa3-424f-8ec3-9231c3701349	2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.998	2026-01-31 21:07:36.998	\N
53ef76ed-83b3-4424-85e4-ddb7405eea24	5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	1	PAID	4166	0	4166	2026-01-12 19:32:51.204	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.003	2026-01-31 21:07:37.003	\N
d9a94221-d0b1-4c11-844f-97a53f1c5fae	5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	2	PAID	4166	0	4166	2026-01-26 10:41:36.692	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.004	2026-01-31 21:07:37.004	\N
9acdc60e-48aa-446c-924a-a6c7ee6de7ef	5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	3	PAID	4166	0	4166	2026-01-21 06:14:09.344	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.006	2026-01-31 21:07:37.006	\N
c9b5fc35-4c6a-4803-8c14-588ba57a36f0	5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	4	PAID	4166	0	4166	2026-01-30 23:35:23.43	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.008	2026-01-31 21:07:37.008	\N
6a2dd2e1-0e37-4e05-a989-016e79400c83	5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	5	PAID	4166	0	4166	2026-01-04 16:37:48.366	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.011	2026-01-31 21:07:37.011	\N
c12026ca-8c35-413d-9764-34e42d3fb345	5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	6	PAID	4166	0	4166	2026-01-12 14:20:26.275	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.014	2026-01-31 21:07:37.014	\N
74f98562-4c64-4ff9-b289-6a790ea702c2	5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.016	2026-01-31 21:07:37.016	\N
02aae7d4-db05-4e92-b5e6-331301ab0a97	5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.018	2026-01-31 21:07:37.018	\N
12903cf5-6436-4ecd-a203-bd6efb012bd0	5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.02	2026-01-31 21:07:37.02	\N
db5deee9-9f3f-448e-8cb8-e3a853f7b0f2	5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.022	2026-01-31 21:07:37.022	\N
d536acf2-1f9a-4222-b6a7-72854a138d57	5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.024	2026-01-31 21:07:37.024	\N
495c9cc5-3964-4cbf-87f2-bf3dd77d68fe	5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.026	2026-01-31 21:07:37.026	\N
ce60f7ea-eeed-4a56-841b-12288f564efa	16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	1	PAID	4166	0	4166	2026-01-26 12:04:48.929	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.031	2026-01-31 21:07:37.031	\N
cd07b29e-ef32-4b17-94d2-8e435036df07	16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	2	PAID	4166	0	4166	2026-01-05 05:14:28.586	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.033	2026-01-31 21:07:37.033	\N
ca2770e0-af4c-4e04-917a-f919c1114b76	16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	3	PAID	4166	0	4166	2026-01-14 07:25:54.711	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.036	2026-01-31 21:07:37.036	\N
7cb7e675-f5cf-4923-a0f1-008103771559	16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	4	PAID	4166	0	4166	2026-01-06 05:01:53.065	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.039	2026-01-31 21:07:37.039	\N
740f9c71-b6a5-4956-b929-02d0701baaaa	16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	5	PAID	4166	0	4166	2026-01-05 17:46:31.301	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.041	2026-01-31 21:07:37.041	\N
8a044bc1-0b9d-4418-ac18-e6c6f3415195	16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	6	PAID	4166	0	4166	2026-01-29 19:26:47.725	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.042	2026-01-31 21:07:37.042	\N
d3813ce4-5993-48ee-94db-5f82f260da12	16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.044	2026-01-31 21:07:37.044	\N
714241c4-93ff-4bf2-9e3e-322eebad3adf	16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.046	2026-01-31 21:07:37.046	\N
530c755f-92b0-4bbf-b6ea-75d4dfd855f5	16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.048	2026-01-31 21:07:37.048	\N
3c90dbdf-c818-4ede-90db-6ac8dfa71201	16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.049	2026-01-31 21:07:37.049	\N
0c1b8af2-ca09-4650-9fce-7db93cffaa16	16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.051	2026-01-31 21:07:37.051	\N
03d59b4c-a5ca-4b80-ab08-dbfeefff0aa0	16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.053	2026-01-31 21:07:37.053	\N
81eaf8bb-819e-4002-9fd1-009a4df874dd	dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	1	PAID	4166	0	4166	2026-01-25 00:52:33.143	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.057	2026-01-31 21:07:37.057	\N
b5bbf6c8-1f34-46c3-b8d9-eaeaf7403831	dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	2	PAID	4166	0	4166	2026-01-24 11:56:26.665	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.059	2026-01-31 21:07:37.059	\N
d51573a6-9657-4a61-a8b5-19d9a791d8de	dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	3	PAID	4166	0	4166	2026-01-07 23:26:28.416	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.061	2026-01-31 21:07:37.061	\N
899d3f76-2e7b-43a4-9974-e14e9c46cfdb	dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	4	PAID	4166	0	4166	2026-01-12 16:10:46.363	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.063	2026-01-31 21:07:37.063	\N
633392da-23dd-4ca8-826c-7543e5ab7fbf	dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	5	PAID	4166	0	4166	2026-01-10 18:05:36.739	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.065	2026-01-31 21:07:37.065	\N
013afe3b-5be6-49e2-a753-4905bd68bf1b	dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	6	PAID	4166	0	4166	2026-01-19 14:17:32.099	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.068	2026-01-31 21:07:37.068	\N
0c20f36b-c0e0-4876-83be-b449efd53805	dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.07	2026-01-31 21:07:37.07	\N
8c63b58a-6b92-41cc-b04f-033874d152a3	dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.072	2026-01-31 21:07:37.072	\N
4cfb5663-2d0c-4ff8-aa71-e9085ad01d9b	dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.074	2026-01-31 21:07:37.074	\N
9b51028c-675a-43a5-a36a-36517d5ded1f	dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	10	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.076	2026-01-31 21:07:37.076	\N
d51f2292-97bd-4c9f-8973-bd9bf0b90514	dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	11	PENDING	4166	4166	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.078	2026-01-31 21:07:37.078	\N
6a589d48-f7f5-4c83-b73c-d2938fcf9699	dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	12	PENDING	4174	4174	0	\N	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.079	2026-01-31 21:07:37.079	\N
b0c46dec-8595-42e4-8da4-c050d928dd24	8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	1	PAID	4166	0	4166	2026-01-13 03:15:55.891	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.083	2026-01-31 21:07:37.083	\N
fac8b8d0-12c3-47bf-a0a7-07949f1d32a7	8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	2	PAID	4166	0	4166	2026-01-27 08:21:55.689	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.085	2026-01-31 21:07:37.085	\N
2f0ff9ad-7d9e-477e-b34e-c644902850bd	8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	3	PAID	4166	0	4166	2026-01-15 06:13:54.53	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.088	2026-01-31 21:07:37.088	\N
ab26e5d6-6286-45ab-aa9f-ba680277fe50	8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	4	PAID	4166	0	4166	2026-01-08 01:48:47.098	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.09	2026-01-31 21:07:37.09	\N
cd0e1aac-c858-4123-8163-dec74bfdb8fa	8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	5	PAID	4166	0	4166	2026-01-11 04:30:50.976	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.092	2026-01-31 21:07:37.092	\N
dd8becec-5955-4b69-9278-944fed29a7d7	8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	6	PAID	4166	0	4166	2026-01-24 09:52:52.066	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.094	2026-01-31 21:07:37.094	\N
41c73c7c-a2ac-417b-aee4-8b6f351bda86	8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.096	2026-01-31 21:07:37.096	\N
a635db2a-3af8-4410-9e18-139db08f5275	8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.098	2026-01-31 21:07:37.098	\N
d5e421d6-2f65-41f7-9bef-a997a2113a5b	8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.1	2026-01-31 21:07:37.1	\N
d38c8a28-42d8-4c2a-b5ec-8f8b6bb85e5a	8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.103	2026-01-31 21:07:37.103	\N
3285132d-8206-4e65-b433-7e41ead17360	8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.105	2026-01-31 21:07:37.105	\N
ab1a5e5e-2f9b-423a-bcd1-eb9f209d43d8	8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.107	2026-01-31 21:07:37.107	\N
d0ef1708-d732-4b02-8cff-d5a63110e4dc	8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	1	PAID	4166	0	4166	2026-01-19 02:05:24.721	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.111	2026-01-31 21:07:37.111	\N
88436848-3567-4aa5-b5be-c8ed093d6719	8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	2	PAID	4166	0	4166	2026-01-20 16:05:59.906	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.113	2026-01-31 21:07:37.113	\N
b27d2cfe-76df-487b-9eff-94197f281374	8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	3	PAID	4166	0	4166	2026-01-24 19:02:59.509	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.115	2026-01-31 21:07:37.115	\N
ae16c4b2-c450-4fba-923b-9e1063120bc7	8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	4	PAID	4166	0	4166	2026-01-07 14:01:18.15	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.117	2026-01-31 21:07:37.117	\N
7bffa6a0-43ba-469b-8dbf-f6a66636a042	8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	5	PAID	4166	0	4166	2026-01-18 08:04:24.426	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.119	2026-01-31 21:07:37.119	\N
5529ff35-b41b-413f-8995-f6c8e6998f87	8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	6	PAID	4166	0	4166	2026-01-30 19:31:18.517	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.121	2026-01-31 21:07:37.121	\N
e2c096a5-a298-4bfa-a785-24455b17d816	8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.123	2026-01-31 21:07:37.123	\N
d85387e0-23dd-4e5d-bfaf-89811cae2fe6	8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.125	2026-01-31 21:07:37.125	\N
43c6f842-fdb2-4485-beb4-4d63266f1589	8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.127	2026-01-31 21:07:37.127	\N
63d59b65-54b6-43f5-a5a0-0c5b8f3c46be	8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.129	2026-01-31 21:07:37.129	\N
f6a313ef-e037-4e48-a698-7ef9556465d6	8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.131	2026-01-31 21:07:37.131	\N
d13f090c-f562-4c12-9767-28160ca673bf	8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.133	2026-01-31 21:07:37.133	\N
076baed5-788f-4a2b-b517-912d722bcf93	ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	1	PAID	4166	0	4166	2026-01-15 00:12:25.046	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.137	2026-01-31 21:07:37.137	\N
94b8e357-0514-4c37-84ea-a2c6eac2691e	ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	2	PAID	4166	0	4166	2026-01-11 23:30:50.701	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.139	2026-01-31 21:07:37.139	\N
a4dc0fd6-32ae-4878-a5b6-d81f249e01e6	ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	3	PAID	4166	0	4166	2026-01-28 22:33:27.298	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.144	2026-01-31 21:07:37.144	\N
39f864f8-ab84-4b89-a174-d2fd9f74cf2f	ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	4	PAID	4166	0	4166	2026-01-07 13:00:36.791	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.146	2026-01-31 21:07:37.146	\N
c0de8bd3-59cd-483b-97a8-fd9b6ed564ca	ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	5	PAID	4166	0	4166	2026-01-27 04:30:43.325	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.147	2026-01-31 21:07:37.147	\N
b4631b88-815f-4c7f-95b4-d21043a64bec	ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	6	PAID	4166	0	4166	2026-01-25 07:38:50.42	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.149	2026-01-31 21:07:37.149	\N
06f7d3b5-37b2-4ebb-ab0e-6b24bc7d4e7a	ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.151	2026-01-31 21:07:37.151	\N
f4efa94b-157d-4ae7-b8d3-950b428f7f26	ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.153	2026-01-31 21:07:37.153	\N
6b92db27-6428-47ba-ab16-2480bb9bd527	ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.155	2026-01-31 21:07:37.155	\N
a71e03f1-6340-4dc1-bb29-4c4e143c0902	ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.157	2026-01-31 21:07:37.157	\N
7f72d08a-07bc-4162-af3e-ece01400e96d	ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.159	2026-01-31 21:07:37.159	\N
2836d06c-f253-44ac-a517-3f94f60d941c	ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.16	2026-01-31 21:07:37.16	\N
631e09a8-6e3c-4a6d-9e6e-8e30ec810078	2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	1	PAID	4166	0	4166	2026-01-04 22:38:36.289	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.163	2026-01-31 21:07:37.163	\N
942008a2-36ad-4c41-822f-5ca32fc98b3a	2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	2	PAID	4166	0	4166	2026-01-22 08:55:11.711	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.165	2026-01-31 21:07:37.165	\N
7a74d0df-c578-41c0-8f28-06b4be24ef2e	2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	3	PAID	4166	0	4166	2026-01-15 06:01:57.387	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.166	2026-01-31 21:07:37.166	\N
1ca5d044-b61f-44f8-8e43-b993d54fa66c	2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	4	PAID	4166	0	4166	2026-01-27 14:10:11.789	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.168	2026-01-31 21:07:37.168	\N
44786e52-8641-4cd8-9af5-69e5e27fb8e7	2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	5	PAID	4166	0	4166	2026-01-15 08:12:50.843	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.17	2026-01-31 21:07:37.17	\N
7c0a061f-7aea-41bf-ae67-50b91bafa0c9	2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	6	PAID	4166	0	4166	2026-01-11 20:47:51.86	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.172	2026-01-31 21:07:37.172	\N
6f41bc8f-c433-4807-bae4-0300f6b4dd97	2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.174	2026-01-31 21:07:37.174	\N
33207a80-c7b3-41f7-8afc-4bd5dd3a79d9	2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.176	2026-01-31 21:07:37.176	\N
90185ea6-89e3-4c7d-8717-78c0b6f1271e	2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.177	2026-01-31 21:07:37.177	\N
f2413eb7-1b2b-4a72-a14d-bb63131fd599	2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.179	2026-01-31 21:07:37.179	\N
fe273d73-cc93-4c19-a18b-cdad4d498b1d	2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.181	2026-01-31 21:07:37.181	\N
07908303-3299-4e58-b445-aa9debc0f658	2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.183	2026-01-31 21:07:37.183	\N
0776b27b-9012-4b8d-ae3b-45f8d8f88da7	b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	1	PAID	4166	0	4166	2026-01-21 15:49:32.585	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.186	2026-01-31 21:07:37.186	\N
7b4c3547-b64a-4e31-af94-757cbdd7a828	b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	2	PAID	4166	0	4166	2026-01-03 03:17:02.625	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.189	2026-01-31 21:07:37.189	\N
aa91dc9b-ced8-41fb-8022-1dca0fd11844	b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	3	PAID	4166	0	4166	2026-01-07 01:20:15.717	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.19	2026-01-31 21:07:37.19	\N
b5bb95f0-a578-4e7e-9194-67ca127058aa	b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	4	PAID	4166	0	4166	2026-01-24 16:59:02.421	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.192	2026-01-31 21:07:37.192	\N
feee3aca-edcd-4692-a9f0-e0a72bbc5ad9	b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	5	PAID	4166	0	4166	2026-01-02 00:12:59.477	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.194	2026-01-31 21:07:37.194	\N
0d1a6462-f487-4d84-915a-b4db3d3ca950	b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	6	PAID	4166	0	4166	2026-01-20 21:24:51.879	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.196	2026-01-31 21:07:37.196	\N
de89e61c-21de-4754-9ac5-278ec16b7840	b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.198	2026-01-31 21:07:37.198	\N
c5906163-b6da-4c64-88f0-be0a862779d9	b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.199	2026-01-31 21:07:37.199	\N
e0b37fbe-aef2-4c71-974b-cad8144a5a01	b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.201	2026-01-31 21:07:37.201	\N
d823bed9-fcea-4c5c-a734-5761873b8085	b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.202	2026-01-31 21:07:37.202	\N
b1ead790-7e10-445d-b1f2-a27058b937f5	b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.204	2026-01-31 21:07:37.204	\N
ae473da2-5ec9-44e6-84ce-6e6cb285675b	b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.205	2026-01-31 21:07:37.205	\N
2dd52054-a25c-49bd-95b3-4f18d1cddb1c	bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	1	PAID	4166	0	4166	2026-01-09 11:16:44.436	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.208	2026-01-31 21:07:37.208	\N
b3e4ec15-fc29-4a81-9b50-9614b3dc3718	bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	2	PAID	4166	0	4166	2026-01-16 23:45:56.02	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.21	2026-01-31 21:07:37.21	\N
afaab426-0fd3-4c2a-9307-e89a5dc57caa	bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	3	PAID	4166	0	4166	2026-01-22 21:00:19.146	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.212	2026-01-31 21:07:37.212	\N
336a1c78-8362-4809-817f-27945dc88a79	bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	4	PAID	4166	0	4166	2026-01-17 22:15:26.179	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.213	2026-01-31 21:07:37.213	\N
75e36c16-2fb1-49dc-a21c-f8d7b165253f	bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	5	PAID	4166	0	4166	2026-01-29 15:50:54.352	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.215	2026-01-31 21:07:37.215	\N
fa054c22-5beb-47d4-a032-744c945dc434	bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	6	PAID	4166	0	4166	2026-01-11 21:53:33.548	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.217	2026-01-31 21:07:37.217	\N
d775662b-5bd4-4c39-beac-184739fe2123	bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.218	2026-01-31 21:07:37.218	\N
1c602b16-d891-48fb-a686-7d5d0ed3f9d1	bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.22	2026-01-31 21:07:37.22	\N
0e83cf4a-e9ba-4bb6-90d2-f591430394bb	bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.222	2026-01-31 21:07:37.222	\N
4ef890c4-4fc7-4266-b56f-f1b468d9717f	bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.223	2026-01-31 21:07:37.223	\N
6e873bca-180a-4842-8221-c954748623a0	bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.225	2026-01-31 21:07:37.225	\N
6dfc0f24-77f9-4fc8-884f-fa039c106a01	bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.227	2026-01-31 21:07:37.227	\N
397e9683-8f8e-487e-a1b0-a82d7fe26d6a	05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	1	PAID	4166	0	4166	2026-01-01 05:44:40.623	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.231	2026-01-31 21:07:37.231	\N
7fad454f-362a-4045-bff2-87620f69b659	05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	2	PAID	4166	0	4166	2026-01-21 03:59:03.457	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.232	2026-01-31 21:07:37.232	\N
b59b5370-d583-44f6-85f5-34a24605d04a	05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	3	PAID	4166	0	4166	2026-01-24 02:36:12.025	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.234	2026-01-31 21:07:37.234	\N
769a0f1e-1395-4fbe-89b9-d094416e4c3a	05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	4	PAID	4166	0	4166	2026-01-07 21:31:25.308	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.235	2026-01-31 21:07:37.235	\N
d80a467a-4fa4-48e3-8d7e-cf6b423f223d	05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	5	PAID	4166	0	4166	2026-01-17 20:42:20.252	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.237	2026-01-31 21:07:37.237	\N
7257a226-e887-49fc-bb7f-f2310cb4eba0	05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	6	PAID	4166	0	4166	2026-01-29 00:07:23.857	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.239	2026-01-31 21:07:37.239	\N
ac14155c-ec44-479d-8c48-825cca4650c8	05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.241	2026-01-31 21:07:37.241	\N
2bb6d520-bd34-4a2f-b9ba-d42df3866290	05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.243	2026-01-31 21:07:37.243	\N
a732fe2b-e8a7-456f-9ea0-d5c4e47fe965	05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.245	2026-01-31 21:07:37.245	\N
ef9552fe-ec69-449a-82bd-ebc4b0069690	05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.247	2026-01-31 21:07:37.247	\N
5c3c2947-58b6-424c-ab42-ae47596e01ba	05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.249	2026-01-31 21:07:37.249	\N
86416327-a8e6-4f74-93f7-0fab354713d4	05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.251	2026-01-31 21:07:37.251	\N
e91705b5-2f05-492c-8e8e-4984c70b4685	69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	1	PAID	4166	0	4166	2026-01-28 20:42:12.248	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.254	2026-01-31 21:07:37.254	\N
fcc87413-1ef7-4b22-975f-2b46904f5010	69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	2	PAID	4166	0	4166	2026-01-16 01:29:42.104	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.256	2026-01-31 21:07:37.256	\N
d7897bf0-8fee-4d71-bbd3-8cba89e84a20	69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	3	PAID	4166	0	4166	2026-01-06 12:31:50.215	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.257	2026-01-31 21:07:37.257	\N
3cb4f916-734c-4eea-a368-75f42239c16c	69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	4	PAID	4166	0	4166	2026-01-01 04:17:19.551	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.259	2026-01-31 21:07:37.259	\N
48509cb4-7d2e-4170-ba8a-e7a675198c07	69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	5	PAID	4166	0	4166	2026-01-07 02:12:43.411	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.26	2026-01-31 21:07:37.26	\N
a5d08802-7e00-42bd-ab5d-078a6fa772a0	69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	6	PAID	4166	0	4166	2026-01-17 01:55:34.872	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.262	2026-01-31 21:07:37.262	\N
e72013de-e079-4c89-aa59-f50f6dca1b5d	69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.264	2026-01-31 21:07:37.264	\N
81af726e-6f89-4a31-ba72-0d7298c5b9ad	69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.265	2026-01-31 21:07:37.265	\N
b40c949d-c64b-45a1-b28a-dec09acf8e03	69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.267	2026-01-31 21:07:37.267	\N
19d72044-c880-454e-ba48-d6f246345674	69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.269	2026-01-31 21:07:37.269	\N
a125d299-c932-442a-9453-1264b82d1bfb	69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.271	2026-01-31 21:07:37.271	\N
bf288462-02a2-417a-8fb2-de351ae2d887	69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.273	2026-01-31 21:07:37.273	\N
2db2e2a9-d8c6-421f-848e-c8577b49317d	91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	1	PAID	4166	0	4166	2026-01-05 09:59:39.145	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.276	2026-01-31 21:07:37.276	\N
dabbe322-741e-4ce6-8f46-422af85bb617	91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	2	PAID	4166	0	4166	2026-01-18 02:41:17.557	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.278	2026-01-31 21:07:37.278	\N
e25cfb26-c27e-4478-a73e-6ca474500cbc	91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	3	PAID	4166	0	4166	2026-01-08 20:57:56.639	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.28	2026-01-31 21:07:37.28	\N
8246a91e-2d0c-4ee7-abf3-682201ad3763	91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	4	PAID	4166	0	4166	2026-01-28 12:54:08.66	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.283	2026-01-31 21:07:37.283	\N
f668fd0b-bc23-4dfb-9b3b-616b7e3de38d	91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	5	PAID	4166	0	4166	2026-01-08 00:06:59.5	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.285	2026-01-31 21:07:37.285	\N
de9b4933-a607-4bec-a60d-9458f3710cda	91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	6	PAID	4166	0	4166	2026-01-10 21:30:54.055	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.287	2026-01-31 21:07:37.287	\N
c938d53c-5e87-43ce-a027-b0fe5019d5f2	91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.289	2026-01-31 21:07:37.289	\N
7466504b-6174-48ad-8bfd-12d228201cba	91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.29	2026-01-31 21:07:37.29	\N
27a529e9-b996-4513-99c1-a62e631c1745	91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.294	2026-01-31 21:07:37.294	\N
2ff7da1e-34b7-42fd-9e5f-f6a1dfd5fbc1	91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.296	2026-01-31 21:07:37.296	\N
8fcdf6c7-6040-47a2-8690-726153f3fcdc	91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.298	2026-01-31 21:07:37.298	\N
12ef1410-8e17-4490-866f-3a11915f0edd	91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.299	2026-01-31 21:07:37.299	\N
2a6f4675-746d-4915-b8a6-aac7fa033730	ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	1	PAID	4166	0	4166	2026-01-20 08:14:31.326	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.302	2026-01-31 21:07:37.302	\N
91f75949-f2dd-4e5d-aea9-51469bcc9a96	ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	2	PAID	4166	0	4166	2026-01-08 23:31:50.413	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.304	2026-01-31 21:07:37.304	\N
1e578089-4709-475c-95f7-12e0b74aff2e	ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	3	PAID	4166	0	4166	2026-01-22 23:44:36.398	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.305	2026-01-31 21:07:37.305	\N
270385a1-35ec-4706-859c-060673c06c70	ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	4	PAID	4166	0	4166	2026-01-05 10:56:34.206	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.307	2026-01-31 21:07:37.307	\N
3a479692-e44c-424b-a196-259a2089cdc3	ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	5	PAID	4166	0	4166	2026-01-15 09:26:09.332	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.308	2026-01-31 21:07:37.308	\N
0ebc1bba-a692-417e-82b9-0f639cf6eeda	ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	6	PAID	4166	0	4166	2026-01-24 09:00:09.753	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.31	2026-01-31 21:07:37.31	\N
a61ac221-4b5e-4acf-bc5a-f4564570e4ad	ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.311	2026-01-31 21:07:37.311	\N
314e6182-dd7d-4b2f-b490-3f0d38ff8ca9	ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.314	2026-01-31 21:07:37.314	\N
fe42209c-df9e-4b2a-b8ff-7b275d664348	ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.315	2026-01-31 21:07:37.315	\N
d1fabcf8-6f3f-4d79-a1a4-d6728468e832	ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.317	2026-01-31 21:07:37.317	\N
52f4c197-2ee7-4621-a7a2-fd14f9c15147	ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.319	2026-01-31 21:07:37.319	\N
9e022c29-de50-45a4-8821-55d76a926277	ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.32	2026-01-31 21:07:37.32	\N
fda41e75-774e-4fb8-a6a4-a6e2e689645a	8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	1	PAID	4166	0	4166	2026-01-10 04:25:50.207	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.323	2026-01-31 21:07:37.323	\N
5db88b93-d92a-4d7e-b394-2ea43e87b09f	8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	2	PAID	4166	0	4166	2026-01-17 19:13:06.752	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.325	2026-01-31 21:07:37.325	\N
6800a110-a77f-4164-8c04-7ac686539363	8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	3	PAID	4166	0	4166	2026-01-04 10:24:15.738	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.327	2026-01-31 21:07:37.327	\N
c6d2f763-ecea-4d91-8c82-77d52e13d936	8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	4	PAID	4166	0	4166	2026-01-03 03:16:52.344	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.329	2026-01-31 21:07:37.329	\N
bf174294-66ac-43b3-b983-4af1b6cc3f51	8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	5	PAID	4166	0	4166	2026-01-01 23:05:42.078	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.33	2026-01-31 21:07:37.33	\N
b50970c9-b309-4f94-af67-73e8b2c028ea	8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	6	PAID	4166	0	4166	2026-01-20 08:28:25.586	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.333	2026-01-31 21:07:37.333	\N
8f716524-68b6-4fe8-9965-dd930e4568cd	8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.335	2026-01-31 21:07:37.335	\N
d2d37dad-4b6d-429b-bbcc-6cc58e44a4ca	8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.336	2026-01-31 21:07:37.336	\N
acd26bc7-5bc7-48e8-9edb-a132f522fa14	8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.338	2026-01-31 21:07:37.338	\N
d352716a-77d4-4e8c-bf4b-4984a0c48a60	8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.339	2026-01-31 21:07:37.339	\N
a4557b50-7739-4264-ac7d-46f32fc30a37	8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.341	2026-01-31 21:07:37.341	\N
e1ff33fb-1473-46a5-944d-d342a7b5f512	8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.342	2026-01-31 21:07:37.342	\N
499d4526-51ad-41e8-a70d-c7e39a213473	3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	1	PAID	4166	0	4166	2026-01-06 19:36:33.89	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.345	2026-01-31 21:07:37.345	\N
a3089cff-8140-423f-ba38-a9211c80bfab	3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	2	PAID	4166	0	4166	2026-01-10 23:20:53.829	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.347	2026-01-31 21:07:37.347	\N
aa429c26-f823-462b-b981-8a6d210d6256	3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	3	PAID	4166	0	4166	2026-01-11 00:01:16.608	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.349	2026-01-31 21:07:37.349	\N
9984c2dc-1a33-490b-b90b-ef978ceba214	3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	4	PAID	4166	0	4166	2026-01-02 07:52:46.827	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.35	2026-01-31 21:07:37.35	\N
61ca4082-1675-401e-856e-e1afbc3cd0fc	3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	5	PAID	4166	0	4166	2026-01-22 17:05:33.587	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.352	2026-01-31 21:07:37.352	\N
da38a62f-f95b-4f7b-b17c-f86811bd51c4	3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	6	PAID	4166	0	4166	2026-01-22 20:47:58.36	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.354	2026-01-31 21:07:37.354	\N
09f9c8e6-ec3f-4aaf-8544-6895b3f536ad	3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.355	2026-01-31 21:07:37.355	\N
2bddd2ee-c05f-405a-8b81-3db7d85d716f	3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.357	2026-01-31 21:07:37.357	\N
cc466789-0c88-41b9-941a-89bf2837a060	3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.358	2026-01-31 21:07:37.358	\N
dfd6dd11-dcd6-4035-8f5e-5af79dee9c22	3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.36	2026-01-31 21:07:37.36	\N
4d0e4425-559e-4e2c-9263-93d478a274f1	3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.361	2026-01-31 21:07:37.361	\N
48d4f25e-7f60-48a4-a1c9-6219f447a29f	3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.363	2026-01-31 21:07:37.363	\N
ffb676e5-d0b5-45d3-b473-3a3da3fcd909	737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	1	PAID	4166	0	4166	2026-01-22 14:22:30.093	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.368	2026-01-31 21:07:37.368	\N
9dac260a-1d7c-47d1-8a2c-2ec00118c730	737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	2	PAID	4166	0	4166	2026-01-19 14:16:38.512	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.37	2026-01-31 21:07:37.37	\N
e3788a6e-1d80-44b9-a421-3d25a01c5185	737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	3	PAID	4166	0	4166	2026-01-27 17:31:41.588	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.372	2026-01-31 21:07:37.372	\N
018b1da9-5ed5-4b6d-8e7e-0efc34c69a65	737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	4	PAID	4166	0	4166	2026-01-08 22:56:59.312	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.374	2026-01-31 21:07:37.374	\N
aea93c40-d670-499c-b4d5-5a242910cca0	737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	5	PAID	4166	0	4166	2026-01-14 08:45:38.541	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.376	2026-01-31 21:07:37.376	\N
5e496e64-3fb9-42e2-86c6-f350d9a41c19	737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	6	PAID	4166	0	4166	2026-01-22 10:13:44.282	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.378	2026-01-31 21:07:37.378	\N
5455ecfb-056d-4404-bc3f-f9d6f3d77cb8	737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.38	2026-01-31 21:07:37.38	\N
94c39c66-0481-4497-bddb-a7b2870c6dce	737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.382	2026-01-31 21:07:37.382	\N
381dd3fe-8644-4099-b5b1-0f1e4c911a01	737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.384	2026-01-31 21:07:37.384	\N
fa90e7f3-d7fd-4268-8c3e-6e83a7d3c3e7	737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.387	2026-01-31 21:07:37.387	\N
d6062396-b9be-400c-9f98-c09310510d9a	737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.389	2026-01-31 21:07:37.389	\N
7aeb32ac-b033-4a3e-a1c7-3d56248a9394	737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.391	2026-01-31 21:07:37.391	\N
64c44a1c-1571-4828-953f-d3c49fa6a0c3	97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	1	PAID	4166	0	4166	2026-01-29 11:47:57.756	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.395	2026-01-31 21:07:37.395	\N
dd9ef92d-c907-4613-b320-3d4ef6159083	97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	2	PAID	4166	0	4166	2026-01-30 07:54:21.375	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.397	2026-01-31 21:07:37.397	\N
774588d8-262a-4fad-bad5-3b0dbc02714d	97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	3	PAID	4166	0	4166	2026-01-05 18:38:05.365	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.399	2026-01-31 21:07:37.399	\N
4f991625-24b4-4fcc-945c-6fa2f5ef72e1	97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	4	PAID	4166	0	4166	2026-01-31 01:08:33.867	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.402	2026-01-31 21:07:37.402	\N
e5b6920d-5757-430c-8a71-c7332cfe8f39	97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	5	PAID	4166	0	4166	2026-01-15 22:20:48.271	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.404	2026-01-31 21:07:37.404	\N
c36e841d-4369-491e-9e97-cfe17ce97753	97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	6	PAID	4166	0	4166	2026-01-02 15:22:31.287	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.405	2026-01-31 21:07:37.405	\N
ba43e6f4-2412-4f2c-abe0-b139e28cc076	97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.407	2026-01-31 21:07:37.407	\N
d4ad5c1a-eacc-4d0b-8835-e0d6ceccfd88	97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.409	2026-01-31 21:07:37.409	\N
7b61dfec-44ce-4435-8eaf-7e5b2f8589f6	97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.41	2026-01-31 21:07:37.41	\N
62ef6cde-3cb7-4e5a-8260-40e5d7ebecb7	97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.413	2026-01-31 21:07:37.413	\N
85927a95-0ee0-4560-8a41-1972df3e2112	97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.414	2026-01-31 21:07:37.414	\N
938cfc88-676f-4699-83c0-54dd070e4a8b	97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.416	2026-01-31 21:07:37.416	\N
6d27d470-f69a-451a-abfa-92ef1bfabf41	80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	1	PAID	4166	0	4166	2026-01-20 13:00:15.336	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.42	2026-01-31 21:07:37.42	\N
6f342d54-6bb7-45ca-b4ac-989799ae726a	80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	2	PAID	4166	0	4166	2026-01-09 16:46:28.604	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.422	2026-01-31 21:07:37.422	\N
7d4b4ecc-e0f7-4d78-b7fb-8020c5fa6fcb	80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	3	PAID	4166	0	4166	2026-01-17 09:25:07.073	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.424	2026-01-31 21:07:37.424	\N
faddc684-20e5-4b35-9da4-fc7d471df414	80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	4	PAID	4166	0	4166	2026-01-19 16:28:20.857	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.426	2026-01-31 21:07:37.426	\N
e9ec1c47-bc51-4629-a617-3ba77c9d2438	80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	5	PAID	4166	0	4166	2026-01-27 11:54:51.81	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.428	2026-01-31 21:07:37.428	\N
a894b902-c9c0-4ceb-9e1d-03a8e0dda25d	80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	6	PAID	4166	0	4166	2026-01-12 14:22:22.397	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.43	2026-01-31 21:07:37.43	\N
6a54baa5-93e2-4e9b-8818-ffed0cc7f489	80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.432	2026-01-31 21:07:37.432	\N
bfa921bc-e883-439b-b132-41f8be4c3b49	80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.435	2026-01-31 21:07:37.435	\N
2733e49a-d9e9-4aec-b273-b1891778d263	80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.437	2026-01-31 21:07:37.437	\N
3b4e128d-6436-4d2b-a295-b9ab6a9e596f	80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.439	2026-01-31 21:07:37.439	\N
ba6faba6-9a9a-461c-9089-94ac6708b547	80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.441	2026-01-31 21:07:37.441	\N
b6165d97-d5ca-4f6b-8126-d6fa3ec1078e	80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.444	2026-01-31 21:07:37.444	\N
8c24e650-0495-4393-957a-ec4240c33d41	a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	1	PAID	4166	0	4166	2026-01-12 19:32:34.706	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.448	2026-01-31 21:07:37.448	\N
f0208af7-2ceb-4292-aaec-8a768cbb4cce	a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	2	PAID	4166	0	4166	2026-01-22 10:10:20.797	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.449	2026-01-31 21:07:37.449	\N
beb3fccd-fcb6-4ecd-98b7-8df387c80c54	a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	3	PAID	4166	0	4166	2026-01-27 04:51:01.742	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.451	2026-01-31 21:07:37.451	\N
25e8cb09-6923-4e19-bebc-ba18cfe3a778	a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	4	PAID	4166	0	4166	2026-01-09 11:27:18.158	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.453	2026-01-31 21:07:37.453	\N
2d81db57-126b-4789-9082-2f0920c7d0cd	a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	5	PAID	4166	0	4166	2026-01-06 20:07:59.065	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.454	2026-01-31 21:07:37.454	\N
2fcc6a1e-b45c-4460-a837-210c2ffca1eb	a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	6	PAID	4166	0	4166	2026-01-20 11:46:55.359	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.456	2026-01-31 21:07:37.456	\N
8e99ccc7-e92b-4a30-a963-9824e9a10375	a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.458	2026-01-31 21:07:37.458	\N
27b9a346-c733-4681-b0da-75f9e742c7ed	a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.46	2026-01-31 21:07:37.46	\N
07f8dd25-ea8f-4021-a6fd-cb5bcbb5fdad	a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.462	2026-01-31 21:07:37.462	\N
dc78de9f-8fce-42ed-a307-91edcecad0e9	a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.464	2026-01-31 21:07:37.464	\N
c2f7d92d-e9d0-48c7-926b-421248fd35ad	a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.466	2026-01-31 21:07:37.466	\N
de53298d-f8f3-4d8e-9200-dabbc1545975	a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.468	2026-01-31 21:07:37.468	\N
aa0d4410-d0c2-4466-96e8-e0e341e1d960	642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	1	PAID	4166	0	4166	2026-01-17 17:51:51.678	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.474	2026-01-31 21:07:37.474	\N
15481a9c-0f6e-40fa-b29b-2dc853b66f81	642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	2	PAID	4166	0	4166	2026-01-18 20:49:26.731	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.477	2026-01-31 21:07:37.477	\N
13cc3530-b0bd-45f7-9c84-6e331b0d8229	642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	3	PAID	4166	0	4166	2026-01-09 22:18:27.409	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.479	2026-01-31 21:07:37.479	\N
d7d72716-373d-4e9a-bacf-99e1c6f5d7ac	642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	4	PAID	4166	0	4166	2026-01-19 06:43:38.577	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.482	2026-01-31 21:07:37.482	\N
7b0f96d9-30ed-4f1b-88b0-343b5c185863	642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	5	PAID	4166	0	4166	2026-01-04 05:35:40.377	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.484	2026-01-31 21:07:37.484	\N
830f0d34-6f7b-41eb-a3b1-1ac9d34ad66e	642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	6	PAID	4166	0	4166	2026-01-01 19:22:23.128	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.486	2026-01-31 21:07:37.486	\N
83fc2f18-d2a9-49b4-a2da-bffbb8ee8efe	642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.489	2026-01-31 21:07:37.489	\N
064e43e7-c601-4575-9e6d-a0f737cd0000	642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.491	2026-01-31 21:07:37.491	\N
387e0a6a-3587-4840-99f9-047831c7c466	642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.493	2026-01-31 21:07:37.493	\N
11b18cf5-fe69-408c-9da5-ac4d0fa42518	642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.495	2026-01-31 21:07:37.495	\N
893f703f-554f-418e-b84e-9a8705915ed4	642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.497	2026-01-31 21:07:37.497	\N
cc2e0376-4113-4681-876c-b72ba5968517	642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.499	2026-01-31 21:07:37.499	\N
065019ca-9c73-479e-8c0d-d54404b7e627	fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	1	PAID	4166	0	4166	2026-01-23 17:50:54.195	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.502	2026-01-31 21:07:37.502	\N
00e9e97a-a40a-4221-875d-cd5d2384dd37	fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	2	PAID	4166	0	4166	2026-01-27 00:58:46.871	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.504	2026-01-31 21:07:37.504	\N
d0d83fad-8689-4846-b58b-bf668d3dad33	fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	3	PAID	4166	0	4166	2026-01-04 01:45:52.174	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.506	2026-01-31 21:07:37.506	\N
c46f85d9-fefd-48ea-bc10-3e43ba925ea1	fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	4	PAID	4166	0	4166	2026-01-24 03:39:29.944	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.508	2026-01-31 21:07:37.508	\N
acb05c2d-646a-4e9b-9da2-364444feb395	fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	5	PAID	4166	0	4166	2026-01-22 21:56:12.829	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.51	2026-01-31 21:07:37.51	\N
6b2d9ac4-7827-4d09-a073-b9b68d3a061b	fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	6	PAID	4166	0	4166	2026-01-19 10:43:17.099	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.512	2026-01-31 21:07:37.512	\N
c302a43a-0f33-4257-8db2-98fdf325ec18	fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.514	2026-01-31 21:07:37.514	\N
e48c2f3a-9d20-4b61-af91-b434dfe2b6f4	fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.515	2026-01-31 21:07:37.515	\N
8078a83a-a4d0-4c68-9f46-24f781c565c3	fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.517	2026-01-31 21:07:37.517	\N
4ba1f6b0-6cce-4511-b809-e33ffe357502	fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.518	2026-01-31 21:07:37.518	\N
84f325c0-7e28-44ef-aa65-1290018855da	fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.52	2026-01-31 21:07:37.52	\N
d2e3a3d9-97d0-4539-9040-f97b01f68c96	fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.521	2026-01-31 21:07:37.521	\N
bfc5644a-9c94-4581-94d7-d4b519742f85	422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	1	PAID	4166	0	4166	2026-01-07 11:48:09.841	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.525	2026-01-31 21:07:37.525	\N
7df314ab-3e8f-43bc-ba0a-9e2a69294538	422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	2	PAID	4166	0	4166	2026-01-27 16:13:42.3	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.526	2026-01-31 21:07:37.526	\N
6ffaee41-1780-48c4-8b4c-8cda660a80b5	422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	3	PAID	4166	0	4166	2026-01-24 10:25:50.231	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.529	2026-01-31 21:07:37.529	\N
79775b5f-8a71-466e-b922-2c2f2721cf07	422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	4	PAID	4166	0	4166	2026-01-30 18:10:47.499	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.532	2026-01-31 21:07:37.532	\N
939d7624-4b29-4c8b-8238-11148c49eee0	422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	5	PAID	4166	0	4166	2026-01-05 14:23:08.058	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.534	2026-01-31 21:07:37.534	\N
e3897df2-a3cb-4887-aceb-4874870250ad	422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	6	PAID	4166	0	4166	2026-01-20 03:48:17.85	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.536	2026-01-31 21:07:37.536	\N
e3b414bb-62ed-4d47-830b-c7260cbf5cf1	422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.538	2026-01-31 21:07:37.538	\N
269c3b48-c1ec-4e0b-9624-55b9c04d3f70	422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.541	2026-01-31 21:07:37.541	\N
91338dea-1cdc-44d3-a129-2d67925b79e1	422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.543	2026-01-31 21:07:37.543	\N
57060a5a-240a-4e97-bb23-7a8ba8b93570	422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.544	2026-01-31 21:07:37.544	\N
c8dbfbf6-be8c-4d84-a77c-3a14088fdf5d	422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.546	2026-01-31 21:07:37.546	\N
0d9d8274-3079-4f57-a311-05c7a9b52c8f	422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.548	2026-01-31 21:07:37.548	\N
2188cd38-ba11-4ddd-a415-ba097bd3051e	d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	1	PAID	4166	0	4166	2026-01-03 11:13:23.845	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.552	2026-01-31 21:07:37.552	\N
86c49838-d656-40e3-8326-931344a63d3c	d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	2	PAID	4166	0	4166	2026-01-18 20:12:42.432	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.553	2026-01-31 21:07:37.553	\N
76bd0d50-1d23-415d-960d-28945ce118a6	d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	3	PAID	4166	0	4166	2026-01-15 08:03:57.983	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.555	2026-01-31 21:07:37.555	\N
fb63ffc6-7c7f-4bb1-a031-d69d4ed45119	d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	4	PAID	4166	0	4166	2026-01-11 10:37:51.379	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.556	2026-01-31 21:07:37.556	\N
6c972c55-a946-44ba-8225-58d428790a72	d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	5	PAID	4166	0	4166	2026-01-29 13:36:57.672	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.558	2026-01-31 21:07:37.558	\N
9ed05e84-f1ef-4545-b057-52bbef91b8e9	d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	6	PAID	4166	0	4166	2026-01-25 20:00:17.829	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.559	2026-01-31 21:07:37.559	\N
8ebc8962-1e1f-4e85-9023-ae51f3b71961	d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.561	2026-01-31 21:07:37.561	\N
2e505411-906c-46b3-b32e-e580185492e2	d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.562	2026-01-31 21:07:37.562	\N
a4c4e7fa-f8c3-43ce-a99f-33149d6f7c49	d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.565	2026-01-31 21:07:37.565	\N
2c0211fe-7bfe-497e-94df-be34a94b6437	d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.567	2026-01-31 21:07:37.567	\N
46131516-6065-4494-a0dd-9e4eb0dffa37	d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.57	2026-01-31 21:07:37.57	\N
6fdb7488-9941-415a-8bb7-527287cde4fa	d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.572	2026-01-31 21:07:37.572	\N
17b0eeaf-b5f1-4cff-b0a5-e15bdb54c878	6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	1	PAID	4166	0	4166	2026-01-26 16:28:22.64	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.577	2026-01-31 21:07:37.577	\N
1a8f5ce1-3b9a-4e2b-925c-8ccfb22dc426	6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	2	PAID	4166	0	4166	2026-01-27 11:08:03.584	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.579	2026-01-31 21:07:37.579	\N
bd91b877-5b81-4f2b-99f2-d3f1a653a314	6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	3	PAID	4166	0	4166	2026-01-29 08:12:04.632	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.581	2026-01-31 21:07:37.581	\N
d9d8ff5d-cd75-47fc-ade8-4261b26b865d	6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	4	PAID	4166	0	4166	2026-01-01 02:39:20.544	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.583	2026-01-31 21:07:37.583	\N
c2f5e1db-0434-453f-8d0c-8bc2afaa9550	6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	5	PAID	4166	0	4166	2026-01-14 13:00:44.709	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.585	2026-01-31 21:07:37.585	\N
08195646-ea87-40aa-bddb-51844f40fea9	6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	6	PAID	4166	0	4166	2026-01-18 06:22:07.938	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.588	2026-01-31 21:07:37.588	\N
b43f34f2-202b-406c-8dc1-c791f4ac66a9	6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.59	2026-01-31 21:07:37.59	\N
15f7c0d7-18cd-4719-8538-4a7c1ca3c4e3	6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.592	2026-01-31 21:07:37.592	\N
65512593-f590-42e5-8509-34d3fc08ffd0	6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.593	2026-01-31 21:07:37.593	\N
04797c1f-fd58-4a44-9804-8bec8ef5e06f	6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.595	2026-01-31 21:07:37.595	\N
b498b51b-ec03-4896-9afc-8d5bb7dba6df	6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.597	2026-01-31 21:07:37.597	\N
acef12f1-fcb9-418d-99b8-1615464ef06b	6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.599	2026-01-31 21:07:37.599	\N
e4e9ec5d-35bd-46c2-9e76-1db642543c27	d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	1	PAID	4166	0	4166	2026-01-25 02:16:51.049	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.604	2026-01-31 21:07:37.604	\N
8426a021-dc34-4276-a486-3d8d1cb6d5fd	d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	2	PAID	4166	0	4166	2026-01-31 15:24:02.951	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.606	2026-01-31 21:07:37.606	\N
51896705-602e-4eec-aa8b-745baf0bdc91	d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	3	PAID	4166	0	4166	2026-01-29 17:54:51.537	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.609	2026-01-31 21:07:37.609	\N
1d6aae7b-f4a5-4a25-8987-9270117bb11d	d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	4	PAID	4166	0	4166	2026-01-17 08:23:46.983	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.611	2026-01-31 21:07:37.611	\N
cc5f7494-5e2d-4924-9ccf-feaab98cca4d	d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	5	PAID	4166	0	4166	2026-01-01 17:37:55.46	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.614	2026-01-31 21:07:37.614	\N
90597729-d9f7-4baa-bfda-eae4f83fa06b	d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	6	PAID	4166	0	4166	2026-01-25 23:35:51.94	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.616	2026-01-31 21:07:37.616	\N
a6d6fc1c-ed35-47bc-b755-18647d42517c	d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.618	2026-01-31 21:07:37.618	\N
f4994fda-3d40-47b7-8316-9ae5a943815f	d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.619	2026-01-31 21:07:37.619	\N
e0e74266-4d42-4f15-b167-00d1000d914f	d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.621	2026-01-31 21:07:37.621	\N
e6bd1439-e942-4676-bcf1-7be60c7f566d	d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.623	2026-01-31 21:07:37.623	\N
05ec28f8-1332-455f-9625-1736cc93e185	d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.626	2026-01-31 21:07:37.626	\N
46c60b28-eaee-484b-a6fd-a350d6bd3d8e	d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.628	2026-01-31 21:07:37.628	\N
f46b4c41-0143-4d4d-a1fb-ea93e8e5c71a	55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	1	PAID	4166	0	4166	2026-01-03 09:08:53.698	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.632	2026-01-31 21:07:37.632	\N
a97dec60-0b6b-4635-8e97-281c6ac71442	55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	2	PAID	4166	0	4166	2026-01-01 22:30:58.754	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.635	2026-01-31 21:07:37.635	\N
5adfef8d-be27-479c-86b4-2e6b7252e2e2	55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	3	PAID	4166	0	4166	2026-01-27 03:56:38.239	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.637	2026-01-31 21:07:37.637	\N
f478fbcf-9cee-440f-a47a-4f70171d2f09	55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	4	PAID	4166	0	4166	2026-01-14 01:01:04.675	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.64	2026-01-31 21:07:37.64	\N
ac484ab9-a0ad-499a-9247-492903f1fe10	55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	5	PAID	4166	0	4166	2026-01-13 08:17:04.67	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.642	2026-01-31 21:07:37.642	\N
c092bd5c-8fdc-4948-aa2b-177ba2381724	55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	6	PAID	4166	0	4166	2026-01-31 15:10:57.15	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.644	2026-01-31 21:07:37.644	\N
ef1d4772-24e4-4f07-b973-609b61fe3ca8	55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.646	2026-01-31 21:07:37.646	\N
d167b5ab-8372-4e91-b2cd-5a58058a969e	55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.648	2026-01-31 21:07:37.648	\N
c664b0f3-bd63-4a77-8897-b7446bbd913c	55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.651	2026-01-31 21:07:37.651	\N
1b61832a-8abf-46fc-b228-e2cdfc0c1535	55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.653	2026-01-31 21:07:37.653	\N
dd40b037-7fb8-4569-98db-49bca7fec6b1	55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.655	2026-01-31 21:07:37.655	\N
c8de0fef-5739-411e-a37b-9f170d6cf678	55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.66	2026-01-31 21:07:37.66	\N
03d4c507-8a56-4017-a126-480e55cf1b38	8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	1	PAID	4166	0	4166	2026-01-14 14:11:57.943	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.665	2026-01-31 21:07:37.665	\N
c514482a-188b-432b-81ec-35cdcb89888a	8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	2	PAID	4166	0	4166	2026-01-12 20:30:06.373	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.666	2026-01-31 21:07:37.666	\N
07740e6d-1bf6-4107-a88a-24aa7fb38c67	8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	3	PAID	4166	0	4166	2026-01-29 06:46:02.349	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.668	2026-01-31 21:07:37.668	\N
556c4c6c-b31f-48e8-98d9-5159ef5c2c31	8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	4	PAID	4166	0	4166	2026-01-01 05:34:37.853	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.67	2026-01-31 21:07:37.67	\N
0fb2907b-5455-4f46-8e66-99db80aaa90b	8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	5	PAID	4166	0	4166	2026-01-23 05:10:48.63	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.673	2026-01-31 21:07:37.673	\N
3dd28ff6-dc87-4008-8be1-1d5ff7128d27	8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	6	PAID	4166	0	4166	2026-01-03 13:29:53.83	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.675	2026-01-31 21:07:37.675	\N
726f3aa3-b755-4a96-b290-bbb07fc68b8a	8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.678	2026-01-31 21:07:37.678	\N
6654cae5-b666-42fc-9417-65c094379e2d	8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.68	2026-01-31 21:07:37.68	\N
52b116a0-90f1-4045-b4d8-e55db8bf1d37	8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.681	2026-01-31 21:07:37.681	\N
e6d69a96-2002-45b8-b28b-f97f07be3a5b	8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.684	2026-01-31 21:07:37.684	\N
abc2d742-cfcf-4079-8cb2-f07e6d167de7	8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.686	2026-01-31 21:07:37.686	\N
df403656-e6c7-4893-8ed3-62e4ec048b3f	8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.688	2026-01-31 21:07:37.688	\N
c0e0204d-a4b5-40fd-9e2e-42ee8c3c52f4	21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	1	PAID	4166	0	4166	2026-01-26 16:23:13.431	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.692	2026-01-31 21:07:37.692	\N
319209c3-1a97-4942-91c9-f631079f2065	21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	2	PAID	4166	0	4166	2026-01-31 19:09:04.739	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.694	2026-01-31 21:07:37.694	\N
1aaa247d-d202-4141-9a96-c5ad6c4b1946	21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	3	PAID	4166	0	4166	2026-01-30 17:25:19.348	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.696	2026-01-31 21:07:37.696	\N
954af876-3428-4680-93ba-e54d5b7a8051	21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	4	PAID	4166	0	4166	2026-01-16 02:40:43.019	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.698	2026-01-31 21:07:37.698	\N
69842b56-6e37-4a24-b4b9-26e564137a76	21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	5	PAID	4166	0	4166	2026-01-10 06:17:29.496	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.701	2026-01-31 21:07:37.701	\N
6d392093-6b64-4184-b03e-7af0daa8f630	21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	6	PAID	4166	0	4166	2026-01-08 01:06:02.888	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.702	2026-01-31 21:07:37.702	\N
f26966fa-6588-41dd-9ca1-957217e651df	21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.704	2026-01-31 21:07:37.704	\N
9a8086ff-8fd6-4cff-bf4d-d8e28d950bbf	21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.706	2026-01-31 21:07:37.706	\N
57fbdf98-0963-4d83-a6b4-96f6ff799d70	21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.707	2026-01-31 21:07:37.707	\N
31c8f698-f072-43f6-a593-9e455215b370	21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.709	2026-01-31 21:07:37.709	\N
e04f5f85-3afb-4d5d-b4dc-e5a04358c65a	21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.711	2026-01-31 21:07:37.711	\N
e55d39b2-1c3c-4d53-b00d-3cd09f4179db	21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.712	2026-01-31 21:07:37.712	\N
80846616-3694-4c87-851c-fdd22f96a5a6	e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	1	PAID	4166	0	4166	2026-01-05 08:54:19.39	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.715	2026-01-31 21:07:37.715	\N
59349caf-6829-48c1-9cc4-db0392e2db76	e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	2	PAID	4166	0	4166	2026-01-09 02:38:11.301	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.717	2026-01-31 21:07:37.717	\N
70048109-b6ce-412d-9820-9ee2fd1e042f	e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	3	PAID	4166	0	4166	2026-01-07 21:36:19.082	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.718	2026-01-31 21:07:37.718	\N
ab3cb2bb-a249-432f-87e9-3871b049ea28	e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	4	PAID	4166	0	4166	2026-01-13 16:47:00.937	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.72	2026-01-31 21:07:37.72	\N
5f13ac55-70f1-47ea-9b18-b5240f6de316	e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	5	PAID	4166	0	4166	2026-01-13 11:31:11.13	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.722	2026-01-31 21:07:37.722	\N
9633521d-cda5-47b5-b08f-1db8ef70392e	e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	6	PAID	4166	0	4166	2026-01-12 22:30:08.958	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.724	2026-01-31 21:07:37.724	\N
3b16b903-b218-487b-8672-276f66a2489e	e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	7	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.725	2026-01-31 21:07:37.725	\N
a33c0393-3a91-4304-94bc-71070cd20f72	e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	8	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.727	2026-01-31 21:07:37.727	\N
e024892d-36fb-42d5-b09d-768f984155f4	e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	9	PARTIALLY_PAID	4166	4166	2083	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.729	2026-01-31 21:07:37.729	\N
f82172fe-b809-4726-9cd7-62afc1aa3b66	e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	10	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.73	2026-01-31 21:07:37.73	\N
ba74ddb6-b758-46fb-8bda-1b0dba3da31a	e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	11	PENDING	4166	4166	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.732	2026-01-31 21:07:37.732	\N
90702800-fa56-4247-afe5-738426cb8811	e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	12	PENDING	4174	4174	0	\N	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.734	2026-01-31 21:07:37.734	\N
\.


--
-- Data for Name: fees; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.fees (id, school_id, student_id, year, total_amount, total_paid_amount, total_pending_amount, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
66b5ff58-efeb-4517-9948-6d63d1b02b60	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.839	2026-01-31 21:07:35.839	\N
02d49c49-6d51-4a04-afea-1a27b531335c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	e45904e7-d5c9-4a2f-a99f-62c7254e617b	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.865	2026-01-31 21:07:35.865	\N
fcd43815-b197-4fec-a9e2-117590fb8e9f	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	712bff62-7b72-4209-9449-c6f71b4245c3	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.892	2026-01-31 21:07:35.892	\N
08d1bd51-4255-43dd-9b1b-26e9d34b5892	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d093977f-47eb-4994-b86f-e168485ce4f8	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.92	2026-01-31 21:07:35.92	\N
d09d5ee4-06e5-4eb6-ad46-37579d7783b8	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6521d86c-e324-436b-a390-ea871d6bbc33	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.95	2026-01-31 21:07:35.95	\N
a72f7c72-17c7-493d-840d-589a24b10f22	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a4e175d9-ab62-41bf-b520-1041d7d4a66e	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.977	2026-01-31 21:07:35.977	\N
960282cb-52bf-4c0e-a22d-3aa9be763fe6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	493828d5-6a30-483f-b97c-f3340071a9f3	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.998	2026-01-31 21:07:35.998	\N
54258fd0-5587-40c0-aba6-afcef055d26d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.026	2026-01-31 21:07:36.026	\N
2ea9d63a-dd22-4c69-a7c5-96e4ce19c322	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	9e2b9f8a-2374-4889-b7a6-e1f70099d985	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.053	2026-01-31 21:07:36.053	\N
c609ccbf-b0ac-48ba-9e19-f250e3fcfb24	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	8f2eec09-50d0-45d4-a5f8-5298b616c517	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.079	2026-01-31 21:07:36.079	\N
51af2ff8-f4cd-4cb5-b404-31e17f7d929b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.102	2026-01-31 21:07:36.102	\N
8efdd48b-9fb7-495c-9f6a-4afef216d1f4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	1b5dad61-4a39-462d-bad2-37c28fd89114	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.123	2026-01-31 21:07:36.123	\N
80e60476-e0be-4160-ae01-e9bed1f217e6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	37c91fcc-5a5c-44cc-a522-9a54294f029b	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.144	2026-01-31 21:07:36.144	\N
619beb32-23f9-4d6e-a8c6-af91bca57a33	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.165	2026-01-31 21:07:36.165	\N
362c699d-368e-485d-8a6a-0b38855ec81b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	bfd569ab-9496-48de-9a3d-fc993d08506f	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.188	2026-01-31 21:07:36.188	\N
a3275b1d-1ef4-44f0-a2cf-3fe2454ed198	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6ad41b47-9a70-4b96-82f2-bd011e484425	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.21	2026-01-31 21:07:36.21	\N
851ab3b9-0689-434e-8478-22d4341a0304	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ac006c-c566-42bb-bb54-b3f866aec6ef	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.235	2026-01-31 21:07:36.235	\N
22e7d998-2caa-42c5-8879-6cbccdfe197d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.261	2026-01-31 21:07:36.261	\N
c08c46c7-adae-4b03-baa0-80076818ca51	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	a65aec58-6d20-443d-b343-b523fd23c3fe	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.293	2026-01-31 21:07:36.293	\N
d340f85d-320b-4388-8d0d-860610f6ef1c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.315	2026-01-31 21:07:36.315	\N
2dab2807-1ef3-4079-9cdf-38428aba5052	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	4c630659-8629-4c8c-8218-e8f2fdec3177	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.338	2026-01-31 21:07:36.338	\N
a6f10f5f-dec5-4249-8183-7543e05cb672	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	5679f26f-a3a0-468a-a503-3048a3241e43	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.364	2026-01-31 21:07:36.364	\N
288f4ebd-185c-4cbd-ba48-9193425c63d3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d248beb0-da42-4f88-8154-e109df23fccd	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.387	2026-01-31 21:07:36.387	\N
b35b092f-f400-48fc-977f-89a94189d89d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	ec8cd6df-fe83-455e-9bc9-7d6217334203	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.411	2026-01-31 21:07:36.411	\N
0f2fdbbd-f1f5-4088-9bbb-6d6c9953cdc9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.437	2026-01-31 21:07:36.437	\N
bb3958f2-c6bf-49f5-a3f4-a3997327bba4	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.465	2026-01-31 21:07:36.465	\N
9535b99e-10e2-47d6-ad21-fb84ebcc9a85	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	771ff4aa-9a5a-46a3-8bec-63abca353800	2026	50000	0	50000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:36.49	2026-01-31 21:07:36.49	\N
48d23528-8d2b-430f-a55a-c6a9d00a45b5	3a8d3873-81bc-4b79-ad76-5e335848ded1	720bb673-1254-46f0-b3d8-b297a95b1cc0	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.512	2026-01-31 21:07:36.512	\N
fc2f9045-2ae7-4f36-82a9-d82598c70754	3a8d3873-81bc-4b79-ad76-5e335848ded1	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.533	2026-01-31 21:07:36.533	\N
7296a6a5-4f9b-4a22-8eed-6e508b1805fa	3a8d3873-81bc-4b79-ad76-5e335848ded1	6f2186bc-34b9-4216-9038-fc88557d74e8	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.554	2026-01-31 21:07:36.554	\N
c5aa414b-4f83-42ba-87c5-f00d190be393	3a8d3873-81bc-4b79-ad76-5e335848ded1	553bdd85-9816-4f78-aa42-333fe4ea895a	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.577	2026-01-31 21:07:36.577	\N
32204e39-5640-486c-8131-61e425328073	3a8d3873-81bc-4b79-ad76-5e335848ded1	7a080a93-5c97-4372-8877-3532d0c770b0	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.604	2026-01-31 21:07:36.604	\N
d4f54a8e-14c9-4435-8b0d-a8df2a09156b	3a8d3873-81bc-4b79-ad76-5e335848ded1	a792810d-6eeb-4be3-9125-ed4167ef3d38	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.632	2026-01-31 21:07:36.632	\N
1aa30e11-f038-4731-8175-34937b1dd60c	3a8d3873-81bc-4b79-ad76-5e335848ded1	775b3337-def5-4cfc-97f7-67480f085e34	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.653	2026-01-31 21:07:36.653	\N
e554bbdf-96af-4168-8ec9-2507e5152192	3a8d3873-81bc-4b79-ad76-5e335848ded1	ac9aacc9-1aca-4364-b741-721f83f86d39	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.678	2026-01-31 21:07:36.678	\N
da692196-b7e8-4ddf-8139-14b58a2b99f9	3a8d3873-81bc-4b79-ad76-5e335848ded1	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.707	2026-01-31 21:07:36.707	\N
e5eb2a5e-c46c-4019-998a-de10f51c8602	3a8d3873-81bc-4b79-ad76-5e335848ded1	30bffd05-b065-407f-acdd-1698a3fbc1b6	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.732	2026-01-31 21:07:36.732	\N
20b3910e-65a4-4cf1-bef5-122a322f4f72	3a8d3873-81bc-4b79-ad76-5e335848ded1	c340c2ec-3bc1-4288-8414-30d6afc77e3c	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.765	2026-01-31 21:07:36.765	\N
c9cd3d79-b503-4686-bcec-e7ad089069be	3a8d3873-81bc-4b79-ad76-5e335848ded1	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.793	2026-01-31 21:07:36.793	\N
60bc4fd7-d754-4bce-89bc-bea073a292cd	3a8d3873-81bc-4b79-ad76-5e335848ded1	f0e447c9-a986-480e-97e5-b2e9fc586ca5	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.819	2026-01-31 21:07:36.819	\N
d047a0af-c291-4b1e-959b-e566cc6496df	3a8d3873-81bc-4b79-ad76-5e335848ded1	ce386003-496f-49d0-af79-a1ed919fb083	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.848	2026-01-31 21:07:36.848	\N
ffb50216-4cb5-4a8c-a823-3cce9cfbbdf4	3a8d3873-81bc-4b79-ad76-5e335848ded1	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.874	2026-01-31 21:07:36.874	\N
88c766ea-e204-4f24-ad3e-822139736787	3a8d3873-81bc-4b79-ad76-5e335848ded1	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.901	2026-01-31 21:07:36.901	\N
38d2be24-acdd-4e63-ac9b-c549c66bb025	3a8d3873-81bc-4b79-ad76-5e335848ded1	5262d4d8-59e0-4966-bbf4-901ce5962845	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.925	2026-01-31 21:07:36.925	\N
ae206873-ce4b-4e30-87df-fb5660502d93	3a8d3873-81bc-4b79-ad76-5e335848ded1	b8418d07-b5a9-4386-8e28-7a6513511807	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.952	2026-01-31 21:07:36.952	\N
2f338089-1624-41f4-a451-ddc07fe1a649	3a8d3873-81bc-4b79-ad76-5e335848ded1	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:36.976	2026-01-31 21:07:36.976	\N
5639b05f-675a-4013-ae96-d6458921af88	3a8d3873-81bc-4b79-ad76-5e335848ded1	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.001	2026-01-31 21:07:37.001	\N
16a607ed-d86b-4e1e-bb87-29f5c968b1e5	3a8d3873-81bc-4b79-ad76-5e335848ded1	30b04009-a242-43fd-a6e0-4a238ff1c533	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.028	2026-01-31 21:07:37.028	\N
dcd22154-85a1-4679-b067-c8c6950e7648	3a8d3873-81bc-4b79-ad76-5e335848ded1	5deab24a-a342-4d31-b98a-b900070f73fd	2026	50000	0	50000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:37.055	2026-01-31 21:07:37.055	\N
8787c2f0-9de5-45f7-b930-c45abf6f2a7e	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.081	2026-01-31 21:07:37.081	\N
8bbaa88d-3b58-489c-a0e6-114aae8486bf	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e44926dc-1879-4111-8db1-bb66a1f30281	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.109	2026-01-31 21:07:37.109	\N
ea029bdc-d642-4c24-b152-ccc19933e864	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	6a3e0aed-9726-4af7-9511-d81dc1deb671	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.135	2026-01-31 21:07:37.135	\N
2c9592c2-8535-40e3-ab07-23966eb0ee2c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d921d166-1c6a-4340-b74e-73b969d90c04	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.161	2026-01-31 21:07:37.161	\N
b1bd8936-fd6e-4062-a7bd-a473dca21353	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	7604f074-20bd-4a5d-862c-6b20efded7cc	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.184	2026-01-31 21:07:37.184	\N
bd60ee7f-05b3-4b49-b0d0-b49b0a222ce8	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	b69e71f9-3ff3-44aa-8642-33db88c858b1	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.207	2026-01-31 21:07:37.207	\N
05e60d9c-f44b-4d45-a121-9800a3b1904a	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48786a4b-2515-45f3-ade9-2138f8f1bc89	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.229	2026-01-31 21:07:37.229	\N
69424d9a-132a-4698-a496-dd61d89c7550	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	ef593a77-cc85-410b-9ac0-ab5a8131742e	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.253	2026-01-31 21:07:37.253	\N
91042710-ee17-47ff-9d00-0b248fa14a11	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	64e30dd1-39da-4b8e-a184-8bf776638b66	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.275	2026-01-31 21:07:37.275	\N
ccc04040-be35-49a4-a77a-da8d641182dd	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	45a8ba58-a702-45c9-b181-6f91ab6c40a9	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.301	2026-01-31 21:07:37.301	\N
8110061a-9002-480c-a31d-38db92d53867	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.322	2026-01-31 21:07:37.322	\N
3ed0d05d-3da0-4078-bd9d-2407355e4309	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	838a8655-5f7c-4e1a-81d8-55a897328741	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.344	2026-01-31 21:07:37.344	\N
737b85af-adea-45bb-97c1-6b14c01ca2ec	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	a41e5329-c828-420a-9e3c-8d7713b33e29	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.366	2026-01-31 21:07:37.366	\N
97d938ab-4337-44cc-a320-a956e5418dfb	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	58596aae-9a88-4c44-9218-b36f600a6679	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.393	2026-01-31 21:07:37.393	\N
80b55398-c86c-4ffe-b00b-40f905026b45	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	e6d78574-b683-4825-8ff2-c7b458004c6d	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.418	2026-01-31 21:07:37.418	\N
a2663dba-fca5-4456-a072-c0dc027a97a7	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	21f23385-0230-4170-96dc-8945f397030b	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.446	2026-01-31 21:07:37.446	\N
642a9207-d8d8-4f73-aa3b-bb240c3a3393	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	2de7165d-c0f7-4538-9de9-dc59f25006b1	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.47	2026-01-31 21:07:37.47	\N
fc8baebc-5371-404f-9b74-2fe53b2ea630	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	d0c8151d-b231-43ad-88b3-01bba8338bae	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.501	2026-01-31 21:07:37.501	\N
422c8901-5fb8-460c-b213-e212fa4c9b8d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1620d4fa-643a-4599-9416-86d41c958e4c	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.523	2026-01-31 21:07:37.523	\N
d7fc5f99-8825-4ed6-b178-31564b6813d9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	01705328-77b9-4769-ae3a-c42a8b5d2102	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.55	2026-01-31 21:07:37.55	\N
6a4486eb-0afb-4aab-817b-3b3ae0a9cb5d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	c65ac420-c59a-4205-aeec-20b0e4b7d458	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.575	2026-01-31 21:07:37.575	\N
d072dfed-e407-4e09-ba9e-a7539a62f82d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57a5828f-b710-4192-97d2-6b16f499e754	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.602	2026-01-31 21:07:37.602	\N
55f49200-abea-46eb-877d-5177fe4f5417	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.63	2026-01-31 21:07:37.63	\N
8dcaf1b6-9d5f-4286-b2c8-c6af94b761fa	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	48d46601-8536-4584-9015-a61f212b6c99	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.662	2026-01-31 21:07:37.662	\N
21458c4a-9f54-4416-9ae4-87fcd47c583c	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	52fed973-7f46-4b3c-a1ea-9c795b265100	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.69	2026-01-31 21:07:37.69	\N
e5d61b50-0fc1-4fb8-a8d4-96a2ee42df8f	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	2026	50000	0	50000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:37.714	2026-01-31 21:07:37.714	\N
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.files (id, extension, name, owner_id, content_type, size, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: grievance_comments; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.grievance_comments (id, content, grievance_id, author_id, created_at, updated_at) FROM stdin;
661fb056-8566-4828-bd01-23e1e48f9adb	We are looking into this matter and will update you soon.	1d86b388-bcb9-4a7f-bc0f-e23ea8d9149b	f0188176-8c0b-4a09-a4e7-6d1781e410a5	2026-01-31 21:07:38.332	2026-01-31 21:07:38.332
631e2b4a-28b7-4142-9ce0-3aa1bbdd0192	We are looking into this matter and will update you soon.	240f0f32-ce7d-4410-b815-c640825bdd79	f0188176-8c0b-4a09-a4e7-6d1781e410a5	2026-02-01 06:35:18.422	2026-02-01 06:35:18.422
\.


--
-- Data for Name: grievances; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.grievances (id, title, description, status, priority, created_by_id, school_id, resolved_by_id, resolved_at, created_at, updated_at) FROM stdin;
dc51133b-6865-4350-8abe-638a11619921	Internet Connectivity Issue	Facing frequent internet disconnections affecting online classes	OPEN	HIGH	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	\N	2026-01-31 21:07:38.325	2026-01-31 21:07:38.325
1d86b388-bcb9-4a7f-bc0f-e23ea8d9149b	Request for Additional Staff	Need additional teaching staff for mathematics department	IN_PROGRESS	MEDIUM	8cd8e109-d8b7-43dd-8863-feba4f470fe6	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	\N	2026-01-31 21:07:38.329	2026-01-31 21:07:38.329
6dbc849e-5baf-45be-952c-b5ec316cfcf3	Software Update Required	Requesting update to latest version of SchooliAt platform	RESOLVED	LOW	1670a10d-e7b4-49e2-bf75-21fcf4949a20	\N	f0188176-8c0b-4a09-a4e7-6d1781e410a5	2026-01-31 21:07:38.337	2026-01-31 21:07:38.337	2026-01-31 21:07:38.337
828d4be6-aba0-417d-abfb-3d1e9359cb01	Internet Connectivity Issue	Facing frequent internet disconnections affecting online classes	OPEN	HIGH	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	\N	2026-02-01 06:35:18.414	2026-02-01 06:35:18.414
240f0f32-ce7d-4410-b815-c640825bdd79	Request for Additional Staff	Need additional teaching staff for mathematics department	IN_PROGRESS	MEDIUM	8cd8e109-d8b7-43dd-8863-feba4f470fe6	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	\N	2026-02-01 06:35:18.419	2026-02-01 06:35:18.419
110775cd-5ef3-43f3-9712-a842b9169bf9	Software Update Required	Requesting update to latest version of SchooliAt platform	RESOLVED	LOW	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	f0188176-8c0b-4a09-a4e7-6d1781e410a5	2026-02-01 06:35:18.426	2026-02-01 06:35:18.426	2026-02-01 06:35:18.426
\.


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.holidays (id, title, date_type, "from", till, visible_from, visible_to, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
2a74936e-003e-401c-b457-bacc1c6d2fbb	Republic Day	SINGLE_DATE	2026-01-26 00:00:00	2026-01-26 00:00:00	2026-01-01 00:00:00	2026-01-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.199	2026-01-31 21:07:38.199	\N
248eb211-6993-4e3f-9d0e-bfba10e7013a	Summer Vacation	DATE_RANGE	2026-05-15 00:00:00	2026-06-15 00:00:00	2026-04-01 00:00:00	2026-06-20 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.201	2026-01-31 21:07:38.201	\N
7e5bc551-1bd8-4b96-b04e-17982a2dc56b	Diwali Holidays	DATE_RANGE	2026-11-10 00:00:00	2026-11-15 00:00:00	2026-10-01 00:00:00	2026-11-20 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.203	2026-01-31 21:07:38.203	\N
681e6c17-d34f-4f15-ac7d-725f564fa25e	Republic Day	SINGLE_DATE	2026-01-26 00:00:00	2026-01-26 00:00:00	2026-01-01 00:00:00	2026-01-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.215	2026-01-31 21:07:38.215	\N
a45bc0b5-f83f-475d-a026-2aaceddfe912	Summer Vacation	DATE_RANGE	2026-05-15 00:00:00	2026-06-15 00:00:00	2026-04-01 00:00:00	2026-06-20 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.217	2026-01-31 21:07:38.217	\N
576f329b-f9f7-45f9-b55d-064e8860c6b6	Diwali Holidays	DATE_RANGE	2026-11-10 00:00:00	2026-11-15 00:00:00	2026-10-01 00:00:00	2026-11-20 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.219	2026-01-31 21:07:38.219	\N
47fd6450-7867-4f33-8635-12e5d2c970b1	Republic Day	SINGLE_DATE	2026-01-26 00:00:00	2026-01-26 00:00:00	2026-01-01 00:00:00	2026-01-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.232	2026-01-31 21:07:38.232	\N
8ebeb148-e560-444a-8246-55f1988e9b78	Summer Vacation	DATE_RANGE	2026-05-15 00:00:00	2026-06-15 00:00:00	2026-04-01 00:00:00	2026-06-20 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.234	2026-01-31 21:07:38.234	\N
90336908-90cd-4718-a6c1-eab6f4043fc1	Diwali Holidays	DATE_RANGE	2026-11-10 00:00:00	2026-11-15 00:00:00	2026-10-01 00:00:00	2026-11-20 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.236	2026-01-31 21:07:38.236	\N
5d59798d-2353-4e1b-a0da-4d9a8a34b90e	Republic Day	SINGLE_DATE	2026-01-26 00:00:00	2026-01-26 00:00:00	2026-01-01 00:00:00	2026-01-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:31:49.963	2026-02-01 06:31:49.963	\N
1ddb3d3d-1698-4c50-ac9d-f5e862470315	Summer Vacation	DATE_RANGE	2026-05-15 00:00:00	2026-06-15 00:00:00	2026-04-01 00:00:00	2026-06-20 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:31:49.978	2026-02-01 06:31:49.978	\N
dfcbecfc-2679-406f-8297-1b72ba36a7a5	Diwali Holidays	DATE_RANGE	2026-11-10 00:00:00	2026-11-15 00:00:00	2026-10-01 00:00:00	2026-11-20 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:31:49.981	2026-02-01 06:31:49.981	\N
8cf067fb-dbae-4668-a437-220f134eb988	Republic Day	SINGLE_DATE	2026-01-26 00:00:00	2026-01-26 00:00:00	2026-01-01 00:00:00	2026-01-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:50.006	2026-02-01 06:31:50.006	\N
df5cadb3-aca6-4e17-b552-c563ab219f26	Summer Vacation	DATE_RANGE	2026-05-15 00:00:00	2026-06-15 00:00:00	2026-04-01 00:00:00	2026-06-20 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:50.01	2026-02-01 06:31:50.01	\N
f8ff970c-b087-4aa6-8019-a40829af38ad	Diwali Holidays	DATE_RANGE	2026-11-10 00:00:00	2026-11-15 00:00:00	2026-10-01 00:00:00	2026-11-20 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:50.018	2026-02-01 06:31:50.018	\N
af302536-ad63-4c96-b713-4a4b73a3cf67	Republic Day	SINGLE_DATE	2026-01-26 00:00:00	2026-01-26 00:00:00	2026-01-01 00:00:00	2026-01-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:31:50.061	2026-02-01 06:31:50.061	\N
fa9496b5-5057-4674-b4ae-d95947f13420	Summer Vacation	DATE_RANGE	2026-05-15 00:00:00	2026-06-15 00:00:00	2026-04-01 00:00:00	2026-06-20 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:31:50.066	2026-02-01 06:31:50.066	\N
1602bf69-f9df-41a9-9e0e-36b705d7a05c	Diwali Holidays	DATE_RANGE	2026-11-10 00:00:00	2026-11-15 00:00:00	2026-10-01 00:00:00	2026-11-20 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:31:50.068	2026-02-01 06:31:50.068	\N
c7f115f3-7ead-4fef-8a0b-4f9a56c3f40d	Republic Day	SINGLE_DATE	2026-01-26 00:00:00	2026-01-26 00:00:00	2026-01-01 00:00:00	2026-01-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:34:35.039	2026-02-01 06:34:35.039	\N
497cc6ab-198e-41cb-911f-ab8b3cf447af	Summer Vacation	DATE_RANGE	2026-05-15 00:00:00	2026-06-15 00:00:00	2026-04-01 00:00:00	2026-06-20 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:34:35.047	2026-02-01 06:34:35.047	\N
70e18b0c-86d8-4db3-9cf7-745da9dbae62	Diwali Holidays	DATE_RANGE	2026-11-10 00:00:00	2026-11-15 00:00:00	2026-10-01 00:00:00	2026-11-20 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:34:35.05	2026-02-01 06:34:35.05	\N
ac9d1432-1903-4f16-bb8b-274bd67467a7	Republic Day	SINGLE_DATE	2026-01-26 00:00:00	2026-01-26 00:00:00	2026-01-01 00:00:00	2026-01-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:34:35.069	2026-02-01 06:34:35.069	\N
d4adfb28-9391-49a3-83b0-d2c4ced13386	Summer Vacation	DATE_RANGE	2026-05-15 00:00:00	2026-06-15 00:00:00	2026-04-01 00:00:00	2026-06-20 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:34:35.073	2026-02-01 06:34:35.073	\N
1614ab57-3e5d-43ca-9c27-299f49cebaae	Diwali Holidays	DATE_RANGE	2026-11-10 00:00:00	2026-11-15 00:00:00	2026-10-01 00:00:00	2026-11-20 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:34:35.076	2026-02-01 06:34:35.076	\N
83af54f3-45d4-4b15-bdd9-813ba51d52b9	Republic Day	SINGLE_DATE	2026-01-26 00:00:00	2026-01-26 00:00:00	2026-01-01 00:00:00	2026-01-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:34:35.095	2026-02-01 06:34:35.095	\N
707c3c2d-b6a6-4af9-ad12-8ace0f6c316b	Summer Vacation	DATE_RANGE	2026-05-15 00:00:00	2026-06-15 00:00:00	2026-04-01 00:00:00	2026-06-20 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:34:35.098	2026-02-01 06:34:35.098	\N
5e3b45b2-2c7f-4512-b5da-875621030f31	Diwali Holidays	DATE_RANGE	2026-11-10 00:00:00	2026-11-15 00:00:00	2026-10-01 00:00:00	2026-11-20 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:34:35.102	2026-02-01 06:34:35.102	\N
96ff87ec-b4ce-4a22-96ab-274ee266a362	Republic Day	SINGLE_DATE	2026-01-26 00:00:00	2026-01-26 00:00:00	2026-01-01 00:00:00	2026-01-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.233	2026-02-01 06:35:18.233	\N
47f5194f-21e5-4757-8d0a-11043ae40c4d	Summer Vacation	DATE_RANGE	2026-05-15 00:00:00	2026-06-15 00:00:00	2026-04-01 00:00:00	2026-06-20 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.237	2026-02-01 06:35:18.237	\N
f64a99f4-12f6-44c9-89e0-6853e5b7cfc3	Diwali Holidays	DATE_RANGE	2026-11-10 00:00:00	2026-11-15 00:00:00	2026-10-01 00:00:00	2026-11-20 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.24	2026-02-01 06:35:18.24	\N
81683a4c-a85a-4457-9759-6234ee81adec	Republic Day	SINGLE_DATE	2026-01-26 00:00:00	2026-01-26 00:00:00	2026-01-01 00:00:00	2026-01-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.265	2026-02-01 06:35:18.265	\N
3bd9273e-6f62-42b0-8679-70a9af171905	Summer Vacation	DATE_RANGE	2026-05-15 00:00:00	2026-06-15 00:00:00	2026-04-01 00:00:00	2026-06-20 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.267	2026-02-01 06:35:18.267	\N
b62587f8-67fe-4f0d-9945-098415dd6a5b	Diwali Holidays	DATE_RANGE	2026-11-10 00:00:00	2026-11-15 00:00:00	2026-10-01 00:00:00	2026-11-20 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.27	2026-02-01 06:35:18.27	\N
24f17356-b17f-424f-b5ea-937e4c27115b	Republic Day	SINGLE_DATE	2026-01-26 00:00:00	2026-01-26 00:00:00	2026-01-01 00:00:00	2026-01-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.291	2026-02-01 06:35:18.291	\N
ca60fc5a-8a81-4368-bd77-0a249381aedc	Summer Vacation	DATE_RANGE	2026-05-15 00:00:00	2026-06-15 00:00:00	2026-04-01 00:00:00	2026-06-20 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.294	2026-02-01 06:35:18.294	\N
e6cd11a2-e4b4-41fd-a5c8-d2e4993f8458	Diwali Holidays	DATE_RANGE	2026-11-10 00:00:00	2026-11-15 00:00:00	2026-10-01 00:00:00	2026-11-20 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.298	2026-02-01 06:35:18.298	\N
\.


--
-- Data for Name: homework_submissions; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.homework_submissions (id, homework_id, student_id, submitted_at, status, files, feedback, grade, marks_obtained, total_marks, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: homeworks; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.homeworks (id, title, description, class_ids, subject_id, teacher_id, due_date, is_mcq, attachments, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: id_card_collections; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.id_card_collections (id, school_id, class_id, year, status, id_card_config_id, file_id, generated_at, generated_by, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: id_card_configs; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.id_card_configs (id, school_id, year, template_id, config, sample_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: id_cards; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.id_cards (id, school_id, class_id, student_id, id_card_config_id, file_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: leave_balances; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.leave_balances (id, user_id, leave_type_id, total_leaves, used_leaves, remaining_leaves, year, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.leave_requests (id, user_id, leave_type_id, start_date, end_date, reason, status, approved_by, approved_at, rejection_reason, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.leave_types (id, name, max_leaves, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: licenses; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.licenses (id, name, issuer, issue_date, expiry_date, certificate_number, document_url, status, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
4440c310-42f9-4d0b-a2a2-2174ae1d6413	Educational License	State Education Department	2020-01-01 00:00:00	2025-12-31 00:00:00	EDU-LIC-2020-001	\N	ACTIVE	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	\N	2026-01-31 21:07:38.3	2026-01-31 21:07:38.3	\N
70b492b4-9b36-4122-b75f-4e950d0dd74f	Fire Safety Certificate	Fire Department	2021-06-01 00:00:00	2024-05-31 00:00:00	FIRE-2021-002	\N	EXPIRING_SOON	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	\N	2026-01-31 21:07:38.303	2026-01-31 21:07:38.303	\N
943b460f-0870-418a-a002-b95513954bc7	Health License	Health Department	2019-01-01 00:00:00	2023-12-31 00:00:00	HLTH-2019-003	\N	EXPIRED	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	\N	2026-01-31 21:07:38.306	2026-01-31 21:07:38.306	\N
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.locations (id, name, region_id, employee_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
d348a683-6b10-4fda-93c1-970ccf071bbe	North Region - Location 1	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-01-31 21:07:24.839	2026-01-31 21:07:24.839	\N
14996e21-c15f-45d7-910a-f901cfb9cef5	North Region - Location 2	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-01-31 21:07:24.846	2026-01-31 21:07:24.846	\N
b1127ce2-4282-473b-b8dd-a3ac9bc156c4	North Region - Location 3	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-01-31 21:07:24.857	2026-01-31 21:07:24.857	\N
978231a5-6309-40c1-926e-711f51eeec2c	South Region - Location 1	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-01-31 21:07:24.864	2026-01-31 21:07:24.864	\N
3a4895c8-3ddf-4da8-94fa-3e8e320071b6	South Region - Location 2	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-01-31 21:07:24.867	2026-01-31 21:07:24.867	\N
80700431-d1cf-40c6-b79c-2b8d1997e5d6	South Region - Location 3	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-01-31 21:07:24.871	2026-01-31 21:07:24.871	\N
259d61fa-f359-470c-9af8-9d725728c89c	East Region - Location 1	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-01-31 21:07:24.888	2026-01-31 21:07:24.888	\N
11d10d11-388e-4b0d-879d-719d2bd8f4cd	East Region - Location 2	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-01-31 21:07:24.891	2026-01-31 21:07:24.891	\N
35ad8fe7-fcf7-481d-8775-f4b79a108dd9	West Region - Location 1	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-01-31 21:07:24.907	2026-01-31 21:07:24.907	\N
a91551d0-9e9c-4b08-a29a-0473ce1ecc2b	West Region - Location 2	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-01-31 21:07:24.91	2026-01-31 21:07:24.91	\N
c77c995e-0e0e-4445-a778-e7212360dd11	Central Region - Location 1	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-01-31 21:07:24.917	2026-01-31 21:07:24.917	\N
def52fb3-c000-49af-b7f0-3df8d00e0380	Central Region - Location 2	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-01-31 21:07:24.929	2026-01-31 21:07:24.929	\N
e439bb58-e001-4473-bcf3-4cf7868c2f62	Central Region - Location 3	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-01-31 21:07:24.932	2026-01-31 21:07:24.932	\N
3317ee1b-7d42-4e26-9f98-39a726c7b613	North Region - Location 1	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:31:01.214	2026-02-01 06:31:01.214	\N
59e5057a-ad29-4d69-a9de-b5c0241fe355	North Region - Location 2	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:31:01.258	2026-02-01 06:31:01.258	\N
10ddb31e-e548-49c7-870b-38f32824bfa2	South Region - Location 1	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-02-01 06:31:01.271	2026-02-01 06:31:01.271	\N
e4f2c945-b6ef-408c-b292-e19b3350478d	South Region - Location 2	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-02-01 06:31:01.275	2026-02-01 06:31:01.275	\N
fcb6421b-d077-4908-b748-f13a0522b769	East Region - Location 1	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-02-01 06:31:01.28	2026-02-01 06:31:01.28	\N
e30bf086-56e4-4bd8-bd5c-4a3ad9257aca	East Region - Location 2	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-02-01 06:31:01.285	2026-02-01 06:31:01.285	\N
c10f8e55-e07b-4377-a2e4-371dde532e82	West Region - Location 1	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:31:01.292	2026-02-01 06:31:01.292	\N
072012bc-7aa0-4b8f-93cf-8e515110009d	West Region - Location 2	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:31:01.301	2026-02-01 06:31:01.301	\N
8b826f08-12bb-4131-9d47-292992121050	Central Region - Location 1	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-02-01 06:31:01.309	2026-02-01 06:31:01.309	\N
b5f6c504-dea1-439e-ae20-7e22961af2f8	Central Region - Location 2	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-02-01 06:31:01.32	2026-02-01 06:31:01.32	\N
c629e584-8605-4cc3-8fc1-1f8e1e188a4f	Central Region - Location 3	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-02-01 06:31:01.325	2026-02-01 06:31:01.325	\N
e703e725-3863-41a6-8329-339a84567ecb	North Region - Location 1	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:31:48.583	2026-02-01 06:31:48.583	\N
26bb97c9-70d1-4ad9-bdc3-194698191b86	North Region - Location 2	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:31:48.591	2026-02-01 06:31:48.591	\N
a1ec8690-c25c-4867-b976-3b15c3170d60	North Region - Location 3	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:31:48.605	2026-02-01 06:31:48.605	\N
83bd1845-0a75-44fe-8547-23438ea94e66	South Region - Location 1	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-02-01 06:31:48.633	2026-02-01 06:31:48.633	\N
796058fd-c94a-4830-8c06-bc875696c9eb	South Region - Location 2	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-02-01 06:31:48.641	2026-02-01 06:31:48.641	\N
5d39e8b8-205e-4209-9484-632eed6fe576	East Region - Location 1	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-02-01 06:31:48.658	2026-02-01 06:31:48.658	\N
4b7b6ad8-85ca-4796-9e9a-748480edec8f	East Region - Location 2	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-02-01 06:31:48.669	2026-02-01 06:31:48.669	\N
f1528525-4afa-4917-a259-683735f3569a	West Region - Location 1	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:31:48.674	2026-02-01 06:31:48.674	\N
44566af0-98b5-4780-8b3a-091fada2154d	West Region - Location 2	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:31:48.701	2026-02-01 06:31:48.701	\N
0a6ccad8-6721-4584-b537-0d9e3db07b89	West Region - Location 3	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:31:48.71	2026-02-01 06:31:48.71	\N
b9dd8cec-5436-4d23-98a0-4be1339b2e5f	Central Region - Location 1	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-02-01 06:31:48.731	2026-02-01 06:31:48.731	\N
c45fc870-9393-403b-8740-ef4836951c33	Central Region - Location 2	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-02-01 06:31:48.734	2026-02-01 06:31:48.734	\N
98f97b0a-25d8-41ed-a55a-138eae6c33af	North Region - Location 1	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:33:27.145	2026-02-01 06:33:27.145	\N
3770a4a0-4cc0-490e-8344-7890879d100f	North Region - Location 2	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:33:27.158	2026-02-01 06:33:27.158	\N
075f246f-8e2f-45fc-9480-95530fe19201	South Region - Location 1	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-02-01 06:33:27.168	2026-02-01 06:33:27.168	\N
3ac70ef2-1ca7-4087-a8a8-6cf81317a99c	South Region - Location 2	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-02-01 06:33:27.176	2026-02-01 06:33:27.176	\N
32caf62f-1ee0-43e4-9827-e4075277b0e1	South Region - Location 3	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-02-01 06:33:27.184	2026-02-01 06:33:27.184	\N
73e734c7-3e09-402b-802e-a94c347ec8bb	East Region - Location 1	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-02-01 06:33:27.192	2026-02-01 06:33:27.192	\N
415f6e97-6683-449b-90e6-5b934cddad15	East Region - Location 2	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-02-01 06:33:27.198	2026-02-01 06:33:27.198	\N
6e490364-624e-47be-94d8-4b3cae6e0f2e	West Region - Location 1	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:33:27.207	2026-02-01 06:33:27.207	\N
0f65b40f-591d-45ac-8f44-18b10767fa00	West Region - Location 2	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:33:27.212	2026-02-01 06:33:27.212	\N
a635c390-fd99-4f22-b87e-a892f552c07d	Central Region - Location 1	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-02-01 06:33:27.221	2026-02-01 06:33:27.221	\N
f7da043d-6625-47c6-9321-be566282f453	Central Region - Location 2	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-02-01 06:33:27.227	2026-02-01 06:33:27.227	\N
a6cc9b43-e88c-4ee4-89f0-1f331242590f	North Region - Location 1	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:34:34.433	2026-02-01 06:34:34.433	\N
80b1fc25-cbaf-40d0-b534-4c54aceb980b	North Region - Location 2	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:34:34.44	2026-02-01 06:34:34.44	\N
b91110bd-e9db-4375-9695-8f247b5a2662	North Region - Location 3	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:34:34.452	2026-02-01 06:34:34.452	\N
16ce48ba-c458-4d82-82ce-bd059e716acd	South Region - Location 1	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-02-01 06:34:34.472	2026-02-01 06:34:34.472	\N
490b9259-009b-4ecb-921e-d6302c2aba2d	South Region - Location 2	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-02-01 06:34:34.484	2026-02-01 06:34:34.484	\N
ceb93a72-266b-4582-9a69-85b43fd76825	South Region - Location 3	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-02-01 06:34:34.488	2026-02-01 06:34:34.488	\N
32e3774f-54b1-4bf9-8665-1e326b862a62	East Region - Location 1	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-02-01 06:34:34.493	2026-02-01 06:34:34.493	\N
54661da4-4497-4ad9-8f1b-d044389d260b	East Region - Location 2	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-02-01 06:34:34.495	2026-02-01 06:34:34.495	\N
87604b93-f1bd-43ed-9e06-98518e1783a1	East Region - Location 3	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-02-01 06:34:34.498	2026-02-01 06:34:34.498	\N
3ad0bacb-3932-4d20-b167-b086916fbb9e	West Region - Location 1	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:34:34.509	2026-02-01 06:34:34.509	\N
177e03e2-3f6e-4a62-9ff4-0ec76f6c1a62	West Region - Location 2	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:34:34.512	2026-02-01 06:34:34.512	\N
83ee5c9c-0385-4d8a-b8f6-73bd08011018	West Region - Location 3	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:34:34.514	2026-02-01 06:34:34.514	\N
0416c428-1d8b-4457-92d7-40ed20417666	Central Region - Location 1	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-02-01 06:34:34.52	2026-02-01 06:34:34.52	\N
45fd7506-cb0e-4bb5-a000-028f06a63ba8	Central Region - Location 2	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-02-01 06:34:34.526	2026-02-01 06:34:34.526	\N
d9bb7402-99ab-4016-9985-c27de761d71b	Central Region - Location 3	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-02-01 06:34:34.529	2026-02-01 06:34:34.529	\N
b7f1c424-2b64-478b-9595-e76f86517d31	North Region - Location 1	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:35:17.609	2026-02-01 06:35:17.609	\N
33d41157-2c17-4138-83bc-4d1f09817dc1	North Region - Location 2	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:35:17.615	2026-02-01 06:35:17.615	\N
834d254d-ccbc-4e10-8fc0-1581fb158a17	North Region - Location 3	a754acd7-f709-4bfa-8cac-26f578ecdec6	\N	seed	\N	\N	2026-02-01 06:35:17.621	2026-02-01 06:35:17.621	\N
a4b3d701-33ed-46fd-9b98-e266bdbbad59	South Region - Location 1	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-02-01 06:35:17.625	2026-02-01 06:35:17.625	\N
11eb799f-975e-49bf-aee6-59aca6822009	South Region - Location 2	422678a5-580e-4a31-b685-890a810d5fa7	\N	seed	\N	\N	2026-02-01 06:35:17.629	2026-02-01 06:35:17.629	\N
5d9362a0-c470-4804-a514-63056f0935ef	East Region - Location 1	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-02-01 06:35:17.65	2026-02-01 06:35:17.65	\N
6e177fef-6077-4309-aab9-fe1233236269	East Region - Location 2	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-02-01 06:35:17.654	2026-02-01 06:35:17.654	\N
45610531-3de5-43f2-bb83-1531b2afabcb	East Region - Location 3	89581564-f003-4808-a73b-733145506bd3	\N	seed	\N	\N	2026-02-01 06:35:17.658	2026-02-01 06:35:17.658	\N
d909328b-6205-4c96-89f6-c6ea8c909c85	West Region - Location 1	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:35:17.663	2026-02-01 06:35:17.663	\N
83c1eb88-d41b-4183-8c79-c5fdc55b0b38	West Region - Location 2	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:35:17.667	2026-02-01 06:35:17.667	\N
e9f60201-d2ea-4029-a798-d3fbff517f75	West Region - Location 3	d13e2763-761e-430f-b06c-dda341a59b5d	\N	seed	\N	\N	2026-02-01 06:35:17.678	2026-02-01 06:35:17.678	\N
495e6f47-a53f-4400-bef9-c3c2c638413f	Central Region - Location 1	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-02-01 06:35:17.685	2026-02-01 06:35:17.685	\N
93a060b4-6162-4314-8e45-ec1ba6ad939d	Central Region - Location 2	ce336bd5-2495-4b28-957d-1dfc0bd9220c	\N	seed	\N	\N	2026-02-01 06:35:17.688	2026-02-01 06:35:17.688	\N
\.


--
-- Data for Name: marks; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.marks (id, exam_id, student_id, subject_id, class_id, marks_obtained, max_marks, percentage, grade, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: mcq_answers; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.mcq_answers (id, submission_id, question_id, selected_answer, is_correct, marks_obtained, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: mcq_questions; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.mcq_questions (id, homework_id, question, options, correct_answer, marks, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.messages (id, conversation_id, sender_id, content, attachments, "readBy", sent_at, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: notices; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.notices (id, title, content, visible_from, visible_to, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
c4c8e596-379f-48ef-8f2a-366e3aaf2596	Parent-Teacher Meeting	All parents are requested to attend the parent-teacher meeting scheduled for next week.	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.205	2026-01-31 21:07:38.205	\N
82a0301e-2f3f-46e4-ab3c-6ce81d10c34f	Fee Payment Reminder	Please ensure all fee payments are completed by the end of this month.	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.207	2026-01-31 21:07:38.207	\N
e8bebd64-de2c-4a4a-9dd3-872f45863a86	Library Book Return	Students are reminded to return library books before the end of the semester.	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.208	2026-01-31 21:07:38.208	\N
7f82fd5f-a5ef-446d-9097-e5e3d6115521	Parent-Teacher Meeting	All parents are requested to attend the parent-teacher meeting scheduled for next week.	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.22	2026-01-31 21:07:38.22	\N
6136c541-03f5-4104-a7a8-2fb3b44fe23a	Fee Payment Reminder	Please ensure all fee payments are completed by the end of this month.	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.222	2026-01-31 21:07:38.222	\N
7a7d59fe-9a59-4f5c-b595-0a24bfab2b20	Library Book Return	Students are reminded to return library books before the end of the semester.	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.224	2026-01-31 21:07:38.224	\N
eff4c8ca-f374-4186-8fcf-6c08934fe407	Parent-Teacher Meeting	All parents are requested to attend the parent-teacher meeting scheduled for next week.	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.238	2026-01-31 21:07:38.238	\N
161461af-06d9-419d-9684-fe2539073cc3	Fee Payment Reminder	Please ensure all fee payments are completed by the end of this month.	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.24	2026-01-31 21:07:38.24	\N
2d5809b4-f576-4927-9366-bb39b99c3fe2	Library Book Return	Students are reminded to return library books before the end of the semester.	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.241	2026-01-31 21:07:38.241	\N
24ddc48d-a53c-435f-8cd1-f13755f72488	Parent-Teacher Meeting	All parents are requested to attend the parent-teacher meeting scheduled for next week.	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:31:49.983	2026-02-01 06:31:49.983	\N
8c232442-4321-4f1d-bfe9-4f740b943318	Fee Payment Reminder	Please ensure all fee payments are completed by the end of this month.	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:31:49.991	2026-02-01 06:31:49.991	\N
f66d7519-10a4-483d-b7ac-3758c97e78c2	Library Book Return	Students are reminded to return library books before the end of the semester.	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:31:49.993	2026-02-01 06:31:49.993	\N
9eff4dc6-1ed4-4101-8b2c-2ab88b82d7df	Parent-Teacher Meeting	All parents are requested to attend the parent-teacher meeting scheduled for next week.	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:50.02	2026-02-01 06:31:50.02	\N
cb5d3e5e-249b-4790-80a8-807177e419cb	Fee Payment Reminder	Please ensure all fee payments are completed by the end of this month.	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:50.025	2026-02-01 06:31:50.025	\N
c06831f8-f45e-47ae-be14-ce2417ae5d1e	Library Book Return	Students are reminded to return library books before the end of the semester.	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:50.027	2026-02-01 06:31:50.027	\N
cd447e57-5a85-4fac-b351-b401f927859f	Parent-Teacher Meeting	All parents are requested to attend the parent-teacher meeting scheduled for next week.	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:31:50.071	2026-02-01 06:31:50.071	\N
334b743c-435a-457e-acd4-097009e654c1	Fee Payment Reminder	Please ensure all fee payments are completed by the end of this month.	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:31:50.075	2026-02-01 06:31:50.075	\N
f6dae637-ec60-4b32-8bfc-3cd3894ae5a7	Library Book Return	Students are reminded to return library books before the end of the semester.	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:31:50.078	2026-02-01 06:31:50.078	\N
e0de9c69-2b7e-445a-8dfc-7e1f655f42f5	Parent-Teacher Meeting	All parents are requested to attend the parent-teacher meeting scheduled for next week.	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:34:35.052	2026-02-01 06:34:35.052	\N
ec5a4d43-cd33-4f01-8963-ae8058f4280b	Fee Payment Reminder	Please ensure all fee payments are completed by the end of this month.	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:34:35.055	2026-02-01 06:34:35.055	\N
6de8a9a1-fc9c-4701-a569-dfae3b5ce5ae	Library Book Return	Students are reminded to return library books before the end of the semester.	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:34:35.058	2026-02-01 06:34:35.058	\N
7ca4587a-49bb-43c4-8575-bd5d94105b89	Parent-Teacher Meeting	All parents are requested to attend the parent-teacher meeting scheduled for next week.	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:34:35.079	2026-02-01 06:34:35.079	\N
0a6244ea-35e4-4798-a2ab-b67ca9cb4d7e	Fee Payment Reminder	Please ensure all fee payments are completed by the end of this month.	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:34:35.082	2026-02-01 06:34:35.082	\N
f4c90949-7337-4889-bbbe-513aaf91920b	Library Book Return	Students are reminded to return library books before the end of the semester.	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:34:35.085	2026-02-01 06:34:35.085	\N
7a6f22b2-6e86-4c4d-8cce-6b19a58d88da	Parent-Teacher Meeting	All parents are requested to attend the parent-teacher meeting scheduled for next week.	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:34:35.106	2026-02-01 06:34:35.106	\N
4d1af66d-e48e-4d6b-9d36-128e0d9920b5	Fee Payment Reminder	Please ensure all fee payments are completed by the end of this month.	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:34:35.11	2026-02-01 06:34:35.11	\N
023c98b5-e571-47ce-ae1f-3c3d6c071d1c	Library Book Return	Students are reminded to return library books before the end of the semester.	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:34:35.112	2026-02-01 06:34:35.112	\N
ba92146d-db00-44e6-8229-592e9cb4c506	Parent-Teacher Meeting	All parents are requested to attend the parent-teacher meeting scheduled for next week.	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.243	2026-02-01 06:35:18.243	\N
bd926d4d-d1ee-45ea-83f5-03d1d8cda67e	Fee Payment Reminder	Please ensure all fee payments are completed by the end of this month.	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.246	2026-02-01 06:35:18.246	\N
8a748406-7e8a-4a39-bf7f-e8949269ab06	Library Book Return	Students are reminded to return library books before the end of the semester.	2026-01-01 00:00:00	2026-12-31 00:00:00	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.25	2026-02-01 06:35:18.25	\N
8628d310-d5b3-4cf6-9443-b8a95cfb6ce2	Parent-Teacher Meeting	All parents are requested to attend the parent-teacher meeting scheduled for next week.	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.273	2026-02-01 06:35:18.273	\N
edeeb1d6-0b20-4a7a-beee-6e56bbbedd36	Fee Payment Reminder	Please ensure all fee payments are completed by the end of this month.	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.275	2026-02-01 06:35:18.275	\N
b29002c8-dad6-4048-a595-325057a133ea	Library Book Return	Students are reminded to return library books before the end of the semester.	2026-01-01 00:00:00	2026-12-31 00:00:00	3a8d3873-81bc-4b79-ad76-5e335848ded1	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.278	2026-02-01 06:35:18.278	\N
f7361576-d11b-4039-80a2-fb7c33febe93	Parent-Teacher Meeting	All parents are requested to attend the parent-teacher meeting scheduled for next week.	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.301	2026-02-01 06:35:18.301	\N
c1804f52-fcd8-4c87-8da4-b0afae40c30e	Fee Payment Reminder	Please ensure all fee payments are completed by the end of this month.	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.304	2026-02-01 06:35:18.304	\N
25cdbd6a-839b-42db-a830-525116b605fb	Library Book Return	Students are reminded to return library books before the end of the semester.	2026-01-01 00:00:00	2026-12-31 00:00:00	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.306	2026-02-01 06:35:18.306	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.notifications (id, user_id, title, content, type, is_read, action_url, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: otps; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.otps (id, email, otp, purpose, expires_at, is_used, attempts, created_at, used_at) FROM stdin;
\.


--
-- Data for Name: parent_child_links; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.parent_child_links (id, parent_id, child_id, relationship, is_primary, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, is_used, created_at, used_at) FROM stdin;
\.


--
-- Data for Name: receipts; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.receipts (id, receipt_number, school_id, amount, base_amount, sgst_percent, cgst_percent, igst_percent, ugst_percent, sgst_amount, cgst_amount, igst_amount, ugst_amount, total_gst, description, payment_method, status, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
3f6f1a6e-e255-494d-b162-40869191932d	RECGIS001000001	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	33021.00	27985.00	9.00	9.00	\N	\N	2518.00	2518.00	\N	\N	5036.00	Payment for services - Receipt 1	BANK_TRANSFER	PAID	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.245	2026-01-31 21:07:38.245	\N
d556f7be-0f9b-438f-b9b2-a0fb5d11cb9b	RECGIS001000002	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	47759.00	40475.00	9.00	9.00	\N	\N	3642.00	3642.00	\N	\N	7284.00	Payment for services - Receipt 2	CASH	PAID	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.249	2026-01-31 21:07:38.249	\N
8117c403-bf9e-461a-823a-f5650d54317e	RECGIS001000003	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	65982.00	55918.00	9.00	9.00	\N	\N	5032.00	5032.00	\N	\N	10064.00	Payment for services - Receipt 3	CHEQUE	PAID	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.252	2026-01-31 21:07:38.252	\N
850fa99e-ebd7-4584-974a-d66bdc6cfcf8	RECGIS001000004	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	117870.00	99890.00	9.00	9.00	\N	\N	8990.00	8990.00	\N	\N	17980.00	Payment for services - Receipt 4	UPI	PAID	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.254	2026-01-31 21:07:38.254	\N
1b027863-d6dc-4682-9b4c-24137a3c2935	RECGIS001000005	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	93355.00	79115.00	9.00	9.00	\N	\N	7120.00	7120.00	\N	\N	14240.00	Payment for services - Receipt 5	CREDIT_CARD	PAID	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.256	2026-01-31 21:07:38.256	\N
77fd3a5b-6dac-4a6e-be11-1259118ec43d	RECGIS001000006	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	24879.00	21085.00	9.00	9.00	\N	\N	1897.00	1897.00	\N	\N	3794.00	Payment for services - Receipt 6	DEBIT_CARD	PAID	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.259	2026-01-31 21:07:38.259	\N
5821c4fd-bb4d-4c20-a71a-358e582663ec	RECGIS001000007	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	91605.00	77633.00	9.00	9.00	\N	\N	6986.00	6986.00	\N	\N	13972.00	Payment for services - Receipt 7	BANK_TRANSFER	PAID	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.262	2026-01-31 21:07:38.262	\N
d6fd9522-b120-44b5-9666-6b2b63f18638	RECSPS002000001	3a8d3873-81bc-4b79-ad76-5e335848ded1	70509.00	59755.00	9.00	9.00	\N	\N	5377.00	5377.00	\N	\N	10754.00	Payment for services - Receipt 1	BANK_TRANSFER	PAID	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.265	2026-01-31 21:07:38.265	\N
7cd01f17-6839-4a28-b508-ee5470b4eba6	RECSPS002000002	3a8d3873-81bc-4b79-ad76-5e335848ded1	70125.00	59429.00	9.00	9.00	\N	\N	5348.00	5348.00	\N	\N	10696.00	Payment for services - Receipt 2	CASH	PAID	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.268	2026-01-31 21:07:38.268	\N
0f7cc7c5-5e12-4942-acea-24967da1c59f	RECSPS002000003	3a8d3873-81bc-4b79-ad76-5e335848ded1	52454.00	44454.00	9.00	9.00	\N	\N	4000.00	4000.00	\N	\N	8000.00	Payment for services - Receipt 3	CHEQUE	PAID	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.271	2026-01-31 21:07:38.271	\N
f00d3823-17a2-4881-b13f-c34f058f5be9	RECSPS002000004	3a8d3873-81bc-4b79-ad76-5e335848ded1	76722.00	65020.00	9.00	9.00	\N	\N	5851.00	5851.00	\N	\N	11702.00	Payment for services - Receipt 4	UPI	PAID	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.275	2026-01-31 21:07:38.275	\N
83754e46-df49-4eb6-95d6-03cea908cc1c	RECSPS002000005	3a8d3873-81bc-4b79-ad76-5e335848ded1	91450.00	77500.00	9.00	9.00	\N	\N	6975.00	6975.00	\N	\N	13950.00	Payment for services - Receipt 5	CREDIT_CARD	PAID	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.277	2026-01-31 21:07:38.277	\N
b87185af-53bb-40e1-846a-3ece8869ba50	RECBFA003000001	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	110232.00	93418.00	9.00	9.00	\N	\N	8407.00	8407.00	\N	\N	16814.00	Payment for services - Receipt 1	BANK_TRANSFER	PAID	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.28	2026-01-31 21:07:38.28	\N
386957d7-cf87-40b6-af1d-3ad69ac78f50	RECBFA003000002	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	91631.00	77655.00	9.00	9.00	\N	\N	6988.00	6988.00	\N	\N	13976.00	Payment for services - Receipt 2	CASH	PAID	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.281	2026-01-31 21:07:38.281	\N
91325c2f-8e8f-49d6-81f6-1014083582f4	RECBFA003000003	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	81503.00	69071.00	9.00	9.00	\N	\N	6216.00	6216.00	\N	\N	12432.00	Payment for services - Receipt 3	CHEQUE	PAID	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.283	2026-01-31 21:07:38.283	\N
0c54136a-104e-4976-973d-b034b5ee7af3	RECBFA003000004	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	111328.00	94346.00	9.00	9.00	\N	\N	8491.00	8491.00	\N	\N	16982.00	Payment for services - Receipt 4	UPI	PAID	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.285	2026-01-31 21:07:38.285	\N
cd6d4437-b5c2-462b-94bb-33cc3b59737a	RECBFA003000005	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	101337.00	85879.00	9.00	9.00	\N	\N	7729.00	7729.00	\N	\N	15458.00	Payment for services - Receipt 5	CREDIT_CARD	PAID	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.287	2026-01-31 21:07:38.287	\N
211bbc92-af85-4aea-831f-912249c694bf	RECBFA003000006	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	67870.00	57518.00	9.00	9.00	\N	\N	5176.00	5176.00	\N	\N	10352.00	Payment for services - Receipt 6	DEBIT_CARD	PAID	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.289	2026-01-31 21:07:38.289	\N
8614fa5f-a7b3-4ed4-a5a4-2c07a28c230c	RECBFA003000007	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	76808.00	65092.00	9.00	9.00	\N	\N	5858.00	5858.00	\N	\N	11716.00	Payment for services - Receipt 7	BANK_TRANSFER	PAID	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.291	2026-01-31 21:07:38.291	\N
4783cfef-7d16-478f-beba-31603b99622a	RECBFA003000008	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	91403.00	77461.00	9.00	9.00	\N	\N	6971.00	6971.00	\N	\N	13942.00	Payment for services - Receipt 8	CASH	PENDING	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.293	2026-01-31 21:07:38.293	\N
a733c92b-e617-4985-b478-949e61b19740	RECBFA003000009	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	75239.00	63763.00	9.00	9.00	\N	\N	5738.00	5738.00	\N	\N	11476.00	Payment for services - Receipt 9	CHEQUE	PENDING	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.295	2026-01-31 21:07:38.295	\N
b35507ea-6ceb-481b-92c8-1a878e09a433	RECBFA003000010	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	92949.00	78771.00	9.00	9.00	\N	\N	7089.00	7089.00	\N	\N	14178.00	Payment for services - Receipt 10	UPI	PENDING	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.297	2026-01-31 21:07:38.297	\N
e6bad159-8171-417d-b55d-cdc4f5198359	RECGIS001000008	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	106190.00	89992.00	9.00	9.00	\N	\N	8099.00	8099.00	\N	\N	16198.00	Payment for services - Receipt 8	CASH	PENDING	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.332	2026-02-01 06:35:18.332	\N
63c48344-0cf5-41e7-bb9a-32f0f3c5b526	RECGIS001000009	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	19753.00	16741.00	9.00	9.00	\N	\N	1506.00	1506.00	\N	\N	3012.00	Payment for services - Receipt 9	CHEQUE	PENDING	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.337	2026-02-01 06:35:18.337	\N
24917326-38b0-4e38-84de-c0cd29036b48	RECGIS001000010	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	89269.00	75653.00	9.00	9.00	\N	\N	6808.00	6808.00	\N	\N	13616.00	Payment for services - Receipt 10	UPI	PENDING	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.343	2026-02-01 06:35:18.343	\N
d75cffb0-a38b-4e27-9027-896d8a7c9e06	RECSPS002000006	3a8d3873-81bc-4b79-ad76-5e335848ded1	40191.00	34061.00	9.00	9.00	\N	\N	3065.00	3065.00	\N	\N	6130.00	Payment for services - Receipt 6	DEBIT_CARD	PAID	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.361	2026-02-01 06:35:18.361	\N
a75de711-b227-41a7-b8ac-a8744e6f4574	RECSPS002000007	3a8d3873-81bc-4b79-ad76-5e335848ded1	71591.00	60671.00	9.00	9.00	\N	\N	5460.00	5460.00	\N	\N	10920.00	Payment for services - Receipt 7	BANK_TRANSFER	PAID	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.367	2026-02-01 06:35:18.367	\N
0e4a034c-81ce-4f3b-8171-22f0ebf49152	RECSPS002000008	3a8d3873-81bc-4b79-ad76-5e335848ded1	56991.00	48299.00	9.00	9.00	\N	\N	4346.00	4346.00	\N	\N	8692.00	Payment for services - Receipt 8	CASH	PENDING	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.372	2026-02-01 06:35:18.372	\N
d3682417-0866-4188-8283-795f6f05ea15	RECSPS002000009	3a8d3873-81bc-4b79-ad76-5e335848ded1	58812.00	49842.00	9.00	9.00	\N	\N	4485.00	4485.00	\N	\N	8970.00	Payment for services - Receipt 9	CHEQUE	PENDING	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.378	2026-02-01 06:35:18.378	\N
\.


--
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.regions (id, name, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
a754acd7-f709-4bfa-8cac-26f578ecdec6	North Region	seed	\N	\N	2026-01-31 21:07:24.831	2026-01-31 21:07:24.831	\N
422678a5-580e-4a31-b685-890a810d5fa7	South Region	seed	\N	\N	2026-01-31 21:07:24.861	2026-01-31 21:07:24.861	\N
89581564-f003-4808-a73b-733145506bd3	East Region	seed	\N	\N	2026-01-31 21:07:24.886	2026-01-31 21:07:24.886	\N
d13e2763-761e-430f-b06c-dda341a59b5d	West Region	seed	\N	\N	2026-01-31 21:07:24.896	2026-01-31 21:07:24.896	\N
ce336bd5-2495-4b28-957d-1dfc0bd9220c	Central Region	seed	\N	\N	2026-01-31 21:07:24.915	2026-01-31 21:07:24.915	\N
\.


--
-- Data for Name: results; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.results (id, exam_id, student_id, class_id, total_marks, max_total_marks, percentage, cgpa, grade, rank, is_pass, published_at, published_by, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.roles (id, name, permissions, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
bec6a1ac-c18e-4132-8463-6a20e41bc682	SUPER_ADMIN	{CREATE_EMPLOYEE,GET_EMPLOYEES,EDIT_EMPLOYEE,DELETE_EMPLOYEE,CREATE_SCHOOL,GET_SCHOOLS,EDIT_SCHOOL,DELETE_SCHOOL,CREATE_VENDOR,GET_VENDORS,EDIT_VENDOR,DELETE_VENDOR,CREATE_REGION,GET_REGIONS,EDIT_REGION,DELETE_REGION,GET_ROLES,GET_STATISTICS,GET_DASHBOARD_STATS,GET_USERS,CREATE_LICENSE,GET_LICENSES,UPDATE_LICENSE,DELETE_LICENSE,CREATE_RECEIPT,GET_RECEIPTS,UPDATE_RECEIPT,DELETE_RECEIPT,CREATE_LOCATION,GET_LOCATIONS,DELETE_LOCATION,GET_GRIEVANCES,UPDATE_GRIEVANCE,ADD_GRIEVANCE_COMMENT,GET_MY_GRIEVANCES,GET_ID_CARDS,GET_FEES,GET_SETTINGS}	system	\N	\N	2026-01-31 20:59:51.638	2026-01-31 20:59:51.638	\N
12e01475-888f-4365-8973-938b70ff8c87	EMPLOYEE	{GET_SCHOOLS,GET_VENDORS,CREATE_VENDOR,EDIT_VENDOR,GET_REGIONS,CREATE_REGION,CREATE_SCHOOL,CREATE_GRIEVANCE,GET_MY_GRIEVANCES,ADD_GRIEVANCE_COMMENT}	system	\N	\N	2026-01-31 20:59:51.638	2026-01-31 20:59:51.638	\N
f8c53c7c-72ae-4cc9-b99a-f633213aae54	SCHOOL_ADMIN	{CREATE_STUDENT,GET_STUDENTS,EDIT_STUDENT,DELETE_STUDENT,CREATE_TEACHER,GET_TEACHERS,EDIT_TEACHER,DELETE_TEACHER,CREATE_CLASSES,GET_CLASSES,EDIT_CLASSES,DELETE_CLASSES,CREATE_TRANSPORT,GET_TRANSPORTS,EDIT_TRANSPORT,DELETE_TRANSPORT,GET_MY_SCHOOL,CREATE_EVENT,GET_EVENTS,EDIT_EVENT,DELETE_EVENT,CREATE_HOLIDAY,GET_HOLIDAYS,EDIT_HOLIDAY,DELETE_HOLIDAY,CREATE_EXAM_CALENDAR,GET_EXAM_CALENDARS,EDIT_EXAM_CALENDAR,DELETE_EXAM_CALENDAR,CREATE_NOTICE,GET_NOTICES,EDIT_NOTICE,DELETE_NOTICE,CREATE_EXAM,GET_EXAMS,EDIT_EXAM,DELETE_EXAM,GET_CALENDAR,MANAGE_ID_CARD_CONFIG,GENERATE_ID_CARDS,GET_ID_CARDS,GET_SETTINGS,EDIT_SETTINGS,GET_FEES,RECORD_FEE_PAYMENT,CREATE_GRIEVANCE,GET_MY_GRIEVANCES,ADD_GRIEVANCE_COMMENT,GET_DASHBOARD_STATS}	system	\N	\N	2026-01-31 20:59:51.638	2026-01-31 20:59:51.638	\N
8a6428cc-58da-4f25-bdc5-c0889e6a2c77	STUDENT	{GET_MY_SCHOOL,GET_EVENTS,GET_HOLIDAYS,GET_EXAM_CALENDARS,GET_NOTICES,GET_EXAMS,GET_CALENDAR,GET_DASHBOARD_STATS}	system	\N	\N	2026-01-31 20:59:51.638	2026-01-31 20:59:51.638	\N
05dc2965-6ea6-4b33-8fe0-2ece6324601b	TEACHER	{GET_STUDENTS,GET_CLASSES,GET_MY_SCHOOL,GET_EVENTS,GET_HOLIDAYS,GET_EXAM_CALENDARS,GET_NOTICES,GET_EXAMS,GET_CALENDAR,GET_DASHBOARD_STATS}	system	\N	\N	2026-01-31 20:59:51.638	2026-01-31 20:59:51.638	\N
625018d7-cf94-4043-b6dc-da823bb1e629	STAFF	{GET_MY_SCHOOL,GET_EVENTS,GET_HOLIDAYS,GET_EXAM_CALENDARS,GET_NOTICES,GET_EXAMS,GET_CALENDAR,GET_DASHBOARD_STATS}	system	\N	\N	2026-01-31 20:59:51.638	2026-01-31 20:59:51.638	\N
\.


--
-- Data for Name: salaries; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.salaries (id, school_id, teacher_id, salary_structure_id, "from", till, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
abbe856f-4d18-45a6-b170-274dc09b543c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	b2fdbb78-6a0e-4734-9673-190ec4411205	ab424c0c-5c2c-4533-82cf-dd3631955a65	2026-01-01 00:00:00	2026-12-31 00:00:00	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.354	2026-01-31 21:07:38.354	\N
ed03cb3a-b79f-4814-ae7d-43cfedd687f6	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	b5116dd4-1f22-4b1b-8b75-3eceede309b1	ab424c0c-5c2c-4533-82cf-dd3631955a65	2026-01-01 00:00:00	2026-12-31 00:00:00	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.367	2026-01-31 21:07:38.367	\N
ccfdf791-046e-4936-86e6-e8209815e223	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ef3c97-312d-48c5-b01a-f617589cf7f9	ab424c0c-5c2c-4533-82cf-dd3631955a65	2026-01-01 00:00:00	2026-12-31 00:00:00	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.374	2026-01-31 21:07:38.374	\N
bb8c822c-cd85-447d-98f3-630df35db593	3a8d3873-81bc-4b79-ad76-5e335848ded1	66eaf9d1-7f04-49c5-844e-077bd96a7e10	44815dbe-f47a-4dbb-8925-c1e4bc797776	2026-01-01 00:00:00	2026-12-31 00:00:00	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.389	2026-01-31 21:07:38.389	\N
49f369ca-bf7b-4bfa-94fb-e9fddc8e0b2f	3a8d3873-81bc-4b79-ad76-5e335848ded1	3f7293fe-cfd2-4434-b79e-21a12fee6b04	44815dbe-f47a-4dbb-8925-c1e4bc797776	2026-01-01 00:00:00	2026-12-31 00:00:00	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.395	2026-01-31 21:07:38.395	\N
996d5dad-4acf-41f8-b4bb-64998254ac37	3a8d3873-81bc-4b79-ad76-5e335848ded1	181d2b96-2be1-4068-9360-cc0116753995	44815dbe-f47a-4dbb-8925-c1e4bc797776	2026-01-01 00:00:00	2026-12-31 00:00:00	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.402	2026-01-31 21:07:38.402	\N
68caae45-8402-4b2d-882e-c85d334c7087	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	0bbad251-9dca-4715-b112-70809267e1d4	eed66edc-74f7-46ca-8973-06095399f715	2026-01-01 00:00:00	2026-12-31 00:00:00	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.416	2026-01-31 21:07:38.416	\N
7b2d6363-db63-4fe3-880f-3db9f0c20ce9	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	efeba828-5ea6-4ff4-99c9-1d10c2722a51	eed66edc-74f7-46ca-8973-06095399f715	2026-01-01 00:00:00	2026-12-31 00:00:00	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.422	2026-01-31 21:07:38.422	\N
64def784-c177-4001-ab37-4bca62921fd0	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57890447-8a02-49f2-8293-ea0a92fe6882	eed66edc-74f7-46ca-8973-06095399f715	2026-01-01 00:00:00	2026-12-31 00:00:00	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.429	2026-01-31 21:07:38.429	\N
\.


--
-- Data for Name: salary_payments; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.salary_payments (id, school_id, teacher_id, month, total_amount, component_amounts, slip_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
84928e50-8b32-4d4d-bb81-bdc584969e5b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	b2fdbb78-6a0e-4734-9673-190ec4411205	2026-01	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.358	2026-01-31 21:07:38.358	\N
d8362756-b88a-465e-820c-5150b97bc403	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	b2fdbb78-6a0e-4734-9673-190ec4411205	2025-12	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.363	2026-01-31 21:07:38.363	\N
de049509-a9b2-4427-853c-d6677a4b9a96	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	b2fdbb78-6a0e-4734-9673-190ec4411205	2025-11	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.365	2026-01-31 21:07:38.365	\N
a649240d-b41e-481c-bbf4-cd516f920511	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	b5116dd4-1f22-4b1b-8b75-3eceede309b1	2026-01	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.369	2026-01-31 21:07:38.369	\N
2645c612-282c-459c-8207-f613991cd07c	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	b5116dd4-1f22-4b1b-8b75-3eceede309b1	2025-12	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.371	2026-01-31 21:07:38.371	\N
5998245b-0d73-40b7-a244-915a104cebd0	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	b5116dd4-1f22-4b1b-8b75-3eceede309b1	2025-11	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.372	2026-01-31 21:07:38.372	\N
469e4d57-6bee-4b99-a018-3ba26f761b94	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ef3c97-312d-48c5-b01a-f617589cf7f9	2026-01	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.375	2026-01-31 21:07:38.375	\N
2a084503-eefb-478d-b0a6-4c1de8f9aaa9	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ef3c97-312d-48c5-b01a-f617589cf7f9	2025-12	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.377	2026-01-31 21:07:38.377	\N
a8d40f3d-0419-48b8-b469-4e79c864e73a	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	40ef3c97-312d-48c5-b01a-f617589cf7f9	2025-11	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.379	2026-01-31 21:07:38.379	\N
0b44e60a-1fa5-4efd-b58a-f20738287baf	3a8d3873-81bc-4b79-ad76-5e335848ded1	66eaf9d1-7f04-49c5-844e-077bd96a7e10	2026-01	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.39	2026-01-31 21:07:38.39	\N
c20def2c-b5bd-40b4-a668-f0533d35409a	3a8d3873-81bc-4b79-ad76-5e335848ded1	66eaf9d1-7f04-49c5-844e-077bd96a7e10	2025-12	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.392	2026-01-31 21:07:38.392	\N
84bf72b9-31ee-4628-abb6-981a73e46876	3a8d3873-81bc-4b79-ad76-5e335848ded1	66eaf9d1-7f04-49c5-844e-077bd96a7e10	2025-11	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.393	2026-01-31 21:07:38.393	\N
cbcf2921-43d1-4ab9-bcd8-0e4aba429e82	3a8d3873-81bc-4b79-ad76-5e335848ded1	3f7293fe-cfd2-4434-b79e-21a12fee6b04	2026-01	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.397	2026-01-31 21:07:38.397	\N
6b5d4e8b-82f1-400d-8471-c3c5f4baa58e	3a8d3873-81bc-4b79-ad76-5e335848ded1	3f7293fe-cfd2-4434-b79e-21a12fee6b04	2025-12	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.399	2026-01-31 21:07:38.399	\N
2b78615f-ed97-43da-8f58-845696680b1b	3a8d3873-81bc-4b79-ad76-5e335848ded1	3f7293fe-cfd2-4434-b79e-21a12fee6b04	2025-11	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.401	2026-01-31 21:07:38.401	\N
54365955-6e40-4f3a-a815-d98cf5916af9	3a8d3873-81bc-4b79-ad76-5e335848ded1	181d2b96-2be1-4068-9360-cc0116753995	2026-01	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.404	2026-01-31 21:07:38.404	\N
d816033d-5db9-494e-bb32-ddb005365dd5	3a8d3873-81bc-4b79-ad76-5e335848ded1	181d2b96-2be1-4068-9360-cc0116753995	2025-12	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.405	2026-01-31 21:07:38.405	\N
7c92507d-1062-4119-9a3d-d03c2ba5e7c9	3a8d3873-81bc-4b79-ad76-5e335848ded1	181d2b96-2be1-4068-9360-cc0116753995	2025-11	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.407	2026-01-31 21:07:38.407	\N
d3e4ceb0-470f-4dad-a8d1-353b50181cc1	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	0bbad251-9dca-4715-b112-70809267e1d4	2026-01	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.417	2026-01-31 21:07:38.417	\N
97750581-562c-4729-9ce0-78f563ca8439	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	0bbad251-9dca-4715-b112-70809267e1d4	2025-12	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.419	2026-01-31 21:07:38.419	\N
8eca5e1f-da8c-425a-a02b-907fe3b45cad	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	0bbad251-9dca-4715-b112-70809267e1d4	2025-11	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.42	2026-01-31 21:07:38.42	\N
bf324fd4-2cf8-4d3a-8b7e-960eb3b31e68	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	efeba828-5ea6-4ff4-99c9-1d10c2722a51	2026-01	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.424	2026-01-31 21:07:38.424	\N
850d4fbd-6bef-4d0b-890b-6ecde1100b67	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	efeba828-5ea6-4ff4-99c9-1d10c2722a51	2025-12	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.426	2026-01-31 21:07:38.426	\N
b8660ab6-101f-47ab-87a5-d8774a778192	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	efeba828-5ea6-4ff4-99c9-1d10c2722a51	2025-11	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.427	2026-01-31 21:07:38.427	\N
154484eb-06b9-438a-8c3d-33f18784aded	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57890447-8a02-49f2-8293-ea0a92fe6882	2026-01	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.431	2026-01-31 21:07:38.431	\N
8567fd55-38af-484c-a0a8-a3eb18d14449	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57890447-8a02-49f2-8293-ea0a92fe6882	2025-12	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.433	2026-01-31 21:07:38.433	\N
438b8f0d-597d-4860-a4c8-eff09708ce85	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	57890447-8a02-49f2-8293-ea0a92fe6882	2025-11	40000	{"hra": 12000, "tax": 5000, "basic": 30000, "transport": 5000}	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.434	2026-01-31 21:07:38.434	\N
\.


--
-- Data for Name: salary_structure_components; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.salary_structure_components (id, salary_structure_id, school_id, name, type, value, value_type, frequency, is_base_pay_component, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
b001d3a8-6041-4563-a682-95b86eb079e4	ab424c0c-5c2c-4533-82cf-dd3631955a65	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	Basic Pay	GROSS	30000	ABSOLUTE	MONTHLY	t	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.344	2026-01-31 21:07:38.344	\N
5497299a-9aa8-4c1b-a8f0-ed9e68823293	ab424c0c-5c2c-4533-82cf-dd3631955a65	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	HRA	GROSS	40	PERCENTAGE	MONTHLY	f	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.348	2026-01-31 21:07:38.348	\N
90129bf5-cdd7-4831-878b-2f5dd80b6f94	ab424c0c-5c2c-4533-82cf-dd3631955a65	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	Transport Allowance	GROSS	5000	ABSOLUTE	MONTHLY	f	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.35	2026-01-31 21:07:38.35	\N
2fdc8b37-efc8-49e5-8dbd-269985df8a91	ab424c0c-5c2c-4533-82cf-dd3631955a65	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	Income Tax	NET	10	PERCENTAGE	MONTHLY	f	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.352	2026-01-31 21:07:38.352	\N
96fbcd29-066d-428f-8855-3bf11452c639	44815dbe-f47a-4dbb-8925-c1e4bc797776	3a8d3873-81bc-4b79-ad76-5e335848ded1	Basic Pay	GROSS	30000	ABSOLUTE	MONTHLY	t	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.382	2026-01-31 21:07:38.382	\N
83d20426-23ad-4c84-81e2-a6abf67899eb	44815dbe-f47a-4dbb-8925-c1e4bc797776	3a8d3873-81bc-4b79-ad76-5e335848ded1	HRA	GROSS	40	PERCENTAGE	MONTHLY	f	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.384	2026-01-31 21:07:38.384	\N
ef974e32-2d54-496d-a749-8711a0e77de8	44815dbe-f47a-4dbb-8925-c1e4bc797776	3a8d3873-81bc-4b79-ad76-5e335848ded1	Transport Allowance	GROSS	5000	ABSOLUTE	MONTHLY	f	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.385	2026-01-31 21:07:38.385	\N
c5d0c8d9-a78f-4b64-92d8-e8c0c540679e	44815dbe-f47a-4dbb-8925-c1e4bc797776	3a8d3873-81bc-4b79-ad76-5e335848ded1	Income Tax	NET	10	PERCENTAGE	MONTHLY	f	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.387	2026-01-31 21:07:38.387	\N
c359ceee-4b00-4623-b4bf-fa8e2857eefb	eed66edc-74f7-46ca-8973-06095399f715	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	Basic Pay	GROSS	30000	ABSOLUTE	MONTHLY	t	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.41	2026-01-31 21:07:38.41	\N
0b9c55c2-573c-4ab2-acfd-009323049574	eed66edc-74f7-46ca-8973-06095399f715	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	HRA	GROSS	40	PERCENTAGE	MONTHLY	f	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.411	2026-01-31 21:07:38.411	\N
2dca70a0-402f-47fa-ae6f-d32ce119d672	eed66edc-74f7-46ca-8973-06095399f715	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	Transport Allowance	GROSS	5000	ABSOLUTE	MONTHLY	f	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.413	2026-01-31 21:07:38.413	\N
d788c174-0a63-4495-88bb-10f7c0ee039e	eed66edc-74f7-46ca-8973-06095399f715	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	Income Tax	NET	10	PERCENTAGE	MONTHLY	f	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.414	2026-01-31 21:07:38.414	\N
6b2c11c5-c1db-4a02-829d-c4521a93017e	622106a6-c2ae-4af6-bb25-8f4fa76990ba	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	Basic Pay	GROSS	30000	ABSOLUTE	MONTHLY	t	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.436	2026-02-01 06:35:18.436	\N
82963786-885f-49fa-b64d-88f2c29434d8	622106a6-c2ae-4af6-bb25-8f4fa76990ba	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	HRA	GROSS	40	PERCENTAGE	MONTHLY	f	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.44	2026-02-01 06:35:18.44	\N
de78c65d-fe6f-479a-958e-f667ccc72a92	622106a6-c2ae-4af6-bb25-8f4fa76990ba	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	Transport Allowance	GROSS	5000	ABSOLUTE	MONTHLY	f	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.444	2026-02-01 06:35:18.444	\N
03c183cc-5da5-48eb-b022-840a06f73c60	622106a6-c2ae-4af6-bb25-8f4fa76990ba	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	Income Tax	NET	10	PERCENTAGE	MONTHLY	f	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.449	2026-02-01 06:35:18.449	\N
bec66b71-3fba-47ef-8483-648dd63aa069	b056ca0c-3026-448b-ad0b-aeff3bdbda39	3a8d3873-81bc-4b79-ad76-5e335848ded1	Basic Pay	GROSS	30000	ABSOLUTE	MONTHLY	t	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.454	2026-02-01 06:35:18.454	\N
94452d46-9161-4f11-b0ac-e57117c65d68	b056ca0c-3026-448b-ad0b-aeff3bdbda39	3a8d3873-81bc-4b79-ad76-5e335848ded1	HRA	GROSS	40	PERCENTAGE	MONTHLY	f	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.457	2026-02-01 06:35:18.457	\N
370d735e-450f-4efe-abfc-e0f1845a2e3e	b056ca0c-3026-448b-ad0b-aeff3bdbda39	3a8d3873-81bc-4b79-ad76-5e335848ded1	Transport Allowance	GROSS	5000	ABSOLUTE	MONTHLY	f	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.46	2026-02-01 06:35:18.46	\N
8c53335d-2fd9-40ef-9d51-2b36e49ea420	b056ca0c-3026-448b-ad0b-aeff3bdbda39	3a8d3873-81bc-4b79-ad76-5e335848ded1	Income Tax	NET	10	PERCENTAGE	MONTHLY	f	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.462	2026-02-01 06:35:18.462	\N
0e18cd44-856f-4500-95f6-1ae041f70d4a	88f9a7a7-f7bc-4b6c-9afd-df36ee205f1d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	Basic Pay	GROSS	30000	ABSOLUTE	MONTHLY	t	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.469	2026-02-01 06:35:18.469	\N
bfbfd743-f8d7-4d87-b2ac-ebb9f137ef7f	88f9a7a7-f7bc-4b6c-9afd-df36ee205f1d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	HRA	GROSS	40	PERCENTAGE	MONTHLY	f	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.473	2026-02-01 06:35:18.473	\N
dd0d5f34-4166-443e-bc06-6cd9cb5408fa	88f9a7a7-f7bc-4b6c-9afd-df36ee205f1d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	Transport Allowance	GROSS	5000	ABSOLUTE	MONTHLY	f	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.476	2026-02-01 06:35:18.476	\N
c2be2a0e-2d81-4894-a8ec-83103f9d260e	88f9a7a7-f7bc-4b6c-9afd-df36ee205f1d	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	Income Tax	NET	10	PERCENTAGE	MONTHLY	f	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.48	2026-02-01 06:35:18.48	\N
\.


--
-- Data for Name: salary_structures; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.salary_structures (id, name, school_id, "grossMonthlyAmount", "netMonthlyAmount", created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
ab424c0c-5c2c-4533-82cf-dd3631955a65	Standard Teacher Salary	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	50000	40000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.34	2026-01-31 21:07:38.34	\N
44815dbe-f47a-4dbb-8925-c1e4bc797776	Standard Teacher Salary	3a8d3873-81bc-4b79-ad76-5e335848ded1	50000	40000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.38	2026-01-31 21:07:38.38	\N
eed66edc-74f7-46ca-8973-06095399f715	Standard Teacher Salary	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	50000	40000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.408	2026-01-31 21:07:38.408	\N
622106a6-c2ae-4af6-bb25-8f4fa76990ba	Standard Teacher Salary	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	50000	40000	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:35:18.431	2026-02-01 06:35:18.431	\N
b056ca0c-3026-448b-ad0b-aeff3bdbda39	Standard Teacher Salary	3a8d3873-81bc-4b79-ad76-5e335848ded1	50000	40000	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:35:18.451	2026-02-01 06:35:18.451	\N
88f9a7a7-f7bc-4b6c-9afd-df36ee205f1d	Standard Teacher Salary	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	50000	40000	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:35:18.466	2026-02-01 06:35:18.466	\N
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.schools (id, name, code, address, email, phone, certificate_link, "logoId", gst_number, principal_name, principal_email, principal_phone, established_year, board_affiliation, student_strength, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
ae89b1e8-7f9c-41ee-9562-98534b17d8b5	Greenwood International School	GIS001	{"123 Education Street","Greenwood City","State - 123456"}	admin@greenwood.edu	+91-9876543210	\N	\N	29ABCDE1234F1Z5	Dr. Sarah Johnson	principal@greenwood.edu	+91-9876543211	1995	CBSE	1200	seed	\N	\N	2026-01-31 21:07:24.941	2026-01-31 21:07:24.941	\N
3a8d3873-81bc-4b79-ad76-5e335848ded1	Sunshine Public School	SPS002	{"456 Learning Avenue","Sunshine Town","State - 123457"}	admin@sunshine.edu	+91-9876543220	\N	\N	29FGHIJ5678K2L6	Mr. Rajesh Kumar	principal@sunshine.edu	+91-9876543221	2000	ICSE	800	seed	\N	\N	2026-01-31 21:07:24.955	2026-01-31 21:07:24.955	\N
3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	Bright Future Academy	BFA003	{"789 Knowledge Road","Bright City","State - 123458"}	admin@brightfuture.edu	+91-9876543230	\N	\N	29MNOPQ9012R3S7	Mrs. Priya Sharma	principal@brightfuture.edu	+91-9876543231	2010	State Board	600	seed	\N	\N	2026-01-31 21:07:24.967	2026-01-31 21:07:24.967	\N
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.settings (id, school_id, student_fee_installments, student_fee_amount, current_installement_number, logo_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
878b69c8-58e3-4907-b977-f6eca44bc45d	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	12	50000	6	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:38.32	2026-01-31 21:07:38.32	\N
cb77683c-3a3d-4eea-8d32-c2d945a82ea0	3a8d3873-81bc-4b79-ad76-5e335848ded1	12	50000	6	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:38.322	2026-01-31 21:07:38.322	\N
46828e03-1acd-45d7-a224-f2d8f2c334a2	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	12	50000	6	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:38.324	2026-01-31 21:07:38.324	\N
\.


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.student_profiles (id, user_id, roll_number, apaar_id, class_id, transport_id, father_name, mother_name, father_contact, mother_contact, father_occupation, annual_income, accommodation_type, blood_group, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
7bcbe70a-1481-4d2d-9df7-0e8cfee35da2	bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	1	APAARGIS001000001	99965d57-d9a6-46ca-a506-b0af51d3cbed	\N	Arjun's Father	Arjun's Mother	+91-9876560000	+91-9876570000	Engineer	1399877	HOSTELLER	A_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.487	2026-01-31 21:07:26.487	\N
d7816625-a31d-416f-90b7-0321ad8662f8	e45904e7-d5c9-4a2f-a99f-62c7254e617b	2	APAARGIS001000002	b9dcdb9e-4ff1-4492-98c9-eb0bb77d12aa	\N	Sita's Father	Sita's Mother	+91-9876560001	+91-9876570001	Doctor	1249408	DAY_SCHOLAR	A_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.589	2026-01-31 21:07:26.589	\N
8886d0e1-5406-403f-90d1-bd7705442050	712bff62-7b72-4209-9449-c6f71b4245c3	3	APAARGIS001000003	c03ad09c-d156-431e-a6de-54842ef464f2	\N	Krishna's Father	Krishna's Mother	+91-9876560002	+91-9876570002	Teacher	782308	DAY_SCHOLAR	B_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.703	2026-01-31 21:07:26.703	\N
a89dae80-a062-4922-857f-e2b57b8421d9	d093977f-47eb-4994-b86f-e168485ce4f8	4	APAARGIS001000004	90111446-8b2c-4c41-9352-3e89e306505d	\N	Radha's Father	Radha's Mother	+91-9876560003	+91-9876570003	Business	388276	HOSTELLER	B_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.823	2026-01-31 21:07:26.823	\N
6a9c6363-f21e-43ba-889c-5940b9da7d6b	6521d86c-e324-436b-a390-ea871d6bbc33	5	APAARGIS001000005	aba77e33-5439-44af-a2d4-7cbebbfe574c	\N	Ravi's Father	Ravi's Mother	+91-9876560004	+91-9876570004	Engineer	807047	DAY_SCHOLAR	AB_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.936	2026-01-31 21:07:26.936	\N
8d893f9a-707a-44e1-b79b-3b0748a17e62	a4e175d9-ab62-41bf-b520-1041d7d4a66e	6	APAARGIS001000006	d690284e-3d0a-42c3-881e-1c436d95ed70	\N	Meera's Father	Meera's Mother	+91-9876560005	+91-9876570005	Doctor	938516	DAY_SCHOLAR	AB_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.033	2026-01-31 21:07:27.033	\N
c2d48418-67d2-49d2-aead-1544816e4861	493828d5-6a30-483f-b97c-f3340071a9f3	7	APAARGIS001000007	bb84eddb-f8f3-4a7e-a307-72ff03e4829d	\N	Sohan's Father	Sohan's Mother	+91-9876560006	+91-9876570006	Teacher	498328	HOSTELLER	O_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.136	2026-01-31 21:07:27.136	\N
cfe1d94a-e487-40ad-84c4-af7b97ece6b0	a00e95cd-2cb5-4cc4-af0c-f15f84658b37	8	APAARGIS001000008	90b7bc33-30cd-49c1-9dca-415325b8b27b	\N	Lakshmi's Father	Lakshmi's Mother	+91-9876560007	+91-9876570007	Business	674257	DAY_SCHOLAR	O_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.228	2026-01-31 21:07:27.228	\N
0d68a878-20a8-4e8f-a90b-3eae2a9e261e	9e2b9f8a-2374-4889-b7a6-e1f70099d985	9	APAARGIS001000009	66c44981-b56e-494c-ba81-f29f01ce63bf	\N	Vishal's Father	Vishal's Mother	+91-9876560008	+91-9876570008	Engineer	1017958	DAY_SCHOLAR	A_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.32	2026-01-31 21:07:27.32	\N
dcfdaeb0-d83f-44f5-a069-ca2eafa1cefd	8f2eec09-50d0-45d4-a5f8-5298b616c517	10	APAARGIS001000010	3d0451c5-1a86-4148-a647-951fe70bb77c	\N	Pooja's Father	Pooja's Mother	+91-9876560009	+91-9876570009	Doctor	435813	HOSTELLER	A_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.411	2026-01-31 21:07:27.411	\N
f0f144b3-bcb6-4b1f-85d8-9301a894e485	6ba9f415-6f6e-4fbb-a564-2d9e65416c21	11	APAARGIS001000011	fc4b806a-d23f-4dae-b88a-5b6039a471fd	\N	Arjun's Father	Arjun's Mother	+91-9876560010	+91-9876570010	Teacher	765165	DAY_SCHOLAR	B_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.505	2026-01-31 21:07:27.505	\N
50ff6855-db7a-435c-b7ba-c8ee780eec86	1b5dad61-4a39-462d-bad2-37c28fd89114	12	APAARGIS001000012	b17bccf2-85ab-4823-a330-d65c0a1dc6b2	\N	Sita's Father	Sita's Mother	+91-9876560011	+91-9876570011	Business	1462923	DAY_SCHOLAR	B_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.611	2026-01-31 21:07:27.611	\N
a2f6d292-6ffb-499c-b6bf-e229998be942	37c91fcc-5a5c-44cc-a522-9a54294f029b	13	APAARGIS001000013	dbc7856d-e503-49ef-b7db-c7fa8fcbb6b8	\N	Krishna's Father	Krishna's Mother	+91-9876560012	+91-9876570012	Engineer	967722	HOSTELLER	AB_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.705	2026-01-31 21:07:27.705	\N
e547ca44-baba-4a49-8c4d-7d0396603953	4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	14	APAARGIS001000014	64f9c27d-1919-42bb-8676-186cb5b3cb83	\N	Radha's Father	Radha's Mother	+91-9876560013	+91-9876570013	Doctor	741586	DAY_SCHOLAR	AB_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.797	2026-01-31 21:07:27.797	\N
039307af-20f6-4eae-8ad8-8c19acf565f5	bfd569ab-9496-48de-9a3d-fc993d08506f	15	APAARGIS001000015	99965d57-d9a6-46ca-a506-b0af51d3cbed	\N	Ravi's Father	Ravi's Mother	+91-9876560014	+91-9876570014	Teacher	1484072	DAY_SCHOLAR	O_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.888	2026-01-31 21:07:27.888	\N
ac746242-b850-4a61-8296-2a2ceea3e6e3	6ad41b47-9a70-4b96-82f2-bd011e484425	16	APAARGIS001000016	b9dcdb9e-4ff1-4492-98c9-eb0bb77d12aa	\N	Meera's Father	Meera's Mother	+91-9876560015	+91-9876570015	Business	713346	HOSTELLER	O_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28	2026-01-31 21:07:28	\N
35fb57b4-e7d5-48b9-ad68-32c0e2dbb1f0	40ac006c-c566-42bb-bb54-b3f866aec6ef	17	APAARGIS001000017	c03ad09c-d156-431e-a6de-54842ef464f2	\N	Sohan's Father	Sohan's Mother	+91-9876560016	+91-9876570016	Engineer	1300896	DAY_SCHOLAR	A_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.096	2026-01-31 21:07:28.096	\N
0a5aa310-2365-4219-802e-0d78393cde3c	303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	18	APAARGIS001000018	90111446-8b2c-4c41-9352-3e89e306505d	\N	Lakshmi's Father	Lakshmi's Mother	+91-9876560017	+91-9876570017	Doctor	675360	DAY_SCHOLAR	A_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.194	2026-01-31 21:07:28.194	\N
ec280231-aae0-4c3c-8214-62707ec120ce	a65aec58-6d20-443d-b343-b523fd23c3fe	19	APAARGIS001000019	aba77e33-5439-44af-a2d4-7cbebbfe574c	\N	Vishal's Father	Vishal's Mother	+91-9876560018	+91-9876570018	Teacher	1092270	HOSTELLER	B_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.294	2026-01-31 21:07:28.294	\N
4690d604-eed0-42cf-85f3-1e154125adbf	642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	20	APAARGIS001000020	d690284e-3d0a-42c3-881e-1c436d95ed70	\N	Pooja's Father	Pooja's Mother	+91-9876560019	+91-9876570019	Business	581085	DAY_SCHOLAR	B_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.392	2026-01-31 21:07:28.392	\N
18fabfb3-0843-4974-871d-9159f8ed73eb	4c630659-8629-4c8c-8218-e8f2fdec3177	21	APAARGIS001000021	bb84eddb-f8f3-4a7e-a307-72ff03e4829d	\N	Arjun's Father	Arjun's Mother	+91-9876560020	+91-9876570020	Engineer	1051321	DAY_SCHOLAR	AB_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.487	2026-01-31 21:07:28.487	\N
2debb0a7-3a5e-47a5-a4c1-d9399cf87e97	5679f26f-a3a0-468a-a503-3048a3241e43	22	APAARGIS001000022	90b7bc33-30cd-49c1-9dca-415325b8b27b	\N	Sita's Father	Sita's Mother	+91-9876560021	+91-9876570021	Doctor	556503	HOSTELLER	AB_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.583	2026-01-31 21:07:28.583	\N
b49f611a-97b0-43cf-8184-9b4a23873584	d248beb0-da42-4f88-8154-e109df23fccd	23	APAARGIS001000023	66c44981-b56e-494c-ba81-f29f01ce63bf	\N	Krishna's Father	Krishna's Mother	+91-9876560022	+91-9876570022	Teacher	1293079	DAY_SCHOLAR	O_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.678	2026-01-31 21:07:28.678	\N
58779185-9531-4567-a473-2503920ec5d2	ec8cd6df-fe83-455e-9bc9-7d6217334203	24	APAARGIS001000024	3d0451c5-1a86-4148-a647-951fe70bb77c	\N	Radha's Father	Radha's Mother	+91-9876560023	+91-9876570023	Business	703446	DAY_SCHOLAR	O_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.769	2026-01-31 21:07:28.769	\N
7b0a93a9-7f9b-454a-967d-799213aebaad	6e4a1a46-f6e2-479d-afa9-be2c82bfb480	25	APAARGIS001000025	fc4b806a-d23f-4dae-b88a-5b6039a471fd	\N	Ravi's Father	Ravi's Mother	+91-9876560024	+91-9876570024	Engineer	787167	HOSTELLER	A_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.866	2026-01-31 21:07:28.866	\N
5c16ef13-076f-4c6a-8fe4-4fc945289824	68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	26	APAARGIS001000026	b17bccf2-85ab-4823-a330-d65c0a1dc6b2	\N	Meera's Father	Meera's Mother	+91-9876560025	+91-9876570025	Doctor	1474752	DAY_SCHOLAR	A_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.971	2026-01-31 21:07:28.971	\N
411e5d8c-b4d3-4d47-9e04-eed5ce99a419	771ff4aa-9a5a-46a3-8bec-63abca353800	27	APAARGIS001000027	dbc7856d-e503-49ef-b7db-c7fa8fcbb6b8	\N	Sohan's Father	Sohan's Mother	+91-9876560026	+91-9876570026	Teacher	772110	DAY_SCHOLAR	B_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:29.075	2026-01-31 21:07:29.075	\N
4cc241c9-cd03-4484-9942-eea6d18ac8a3	720bb673-1254-46f0-b3d8-b297a95b1cc0	1	APAARSPS002000001	0fa6a2ca-ed5b-4c55-aed5-9d0471755e3c	\N	Arjun's Father	Arjun's Mother	+91-9876561000	+91-9876571000	Engineer	654243	HOSTELLER	A_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.023	2026-01-31 21:07:30.023	\N
6b1a2b85-137c-4e72-bbf7-dd10452cbb8f	e0aa8f43-a713-4597-9c61-ef277e3a8dd6	2	APAARSPS002000002	af13ec7a-71d8-4166-ba68-d515846bd235	\N	Sita's Father	Sita's Mother	+91-9876561001	+91-9876571001	Doctor	1407735	DAY_SCHOLAR	A_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.119	2026-01-31 21:07:30.119	\N
f988a0bb-23b1-41d0-8161-49d36a9f70d4	6f2186bc-34b9-4216-9038-fc88557d74e8	3	APAARSPS002000003	1a62f98d-09ef-45a0-89d7-2ba15237b4e0	\N	Krishna's Father	Krishna's Mother	+91-9876561002	+91-9876571002	Teacher	620114	DAY_SCHOLAR	B_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.227	2026-01-31 21:07:30.227	\N
1360fd8f-069c-42af-b580-88705078cd65	553bdd85-9816-4f78-aa42-333fe4ea895a	4	APAARSPS002000004	5b733e1f-7300-4994-aa66-717d94925115	\N	Radha's Father	Radha's Mother	+91-9876561003	+91-9876571003	Business	1308399	HOSTELLER	B_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.321	2026-01-31 21:07:30.321	\N
ebcacfa1-9619-4b72-bdb9-04da9ed8e2af	7a080a93-5c97-4372-8877-3532d0c770b0	5	APAARSPS002000005	0eb92e39-b7e6-4a8e-9bfb-1517fb0b5ce1	\N	Ravi's Father	Ravi's Mother	+91-9876561004	+91-9876571004	Engineer	778924	DAY_SCHOLAR	AB_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.431	2026-01-31 21:07:30.431	\N
dddbf75d-7da5-496e-8e78-e056f862c0ad	a792810d-6eeb-4be3-9125-ed4167ef3d38	6	APAARSPS002000006	dd567ff4-dd17-42b2-82f4-d0e991072a3e	\N	Meera's Father	Meera's Mother	+91-9876561005	+91-9876571005	Doctor	709945	DAY_SCHOLAR	AB_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.534	2026-01-31 21:07:30.534	\N
2b3390c6-38ad-46ae-9fd3-9516f2192057	775b3337-def5-4cfc-97f7-67480f085e34	7	APAARSPS002000007	4d9626ce-1439-4238-8a7d-119f1ae0526a	\N	Sohan's Father	Sohan's Mother	+91-9876561006	+91-9876571006	Teacher	867044	HOSTELLER	O_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.63	2026-01-31 21:07:30.63	\N
df5d26dc-9c81-44a6-aa21-3ecb74c39167	ac9aacc9-1aca-4364-b741-721f83f86d39	8	APAARSPS002000008	9b22675d-a673-486f-ae61-3be3c3cd6b0a	\N	Lakshmi's Father	Lakshmi's Mother	+91-9876561007	+91-9876571007	Business	384324	DAY_SCHOLAR	O_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.733	2026-01-31 21:07:30.733	\N
50132ca8-f326-4503-bfef-20ec6e57fe63	9aa0bfcb-ddae-4075-8e0c-69a3050d963c	9	APAARSPS002000009	3ae5054e-52d5-46dd-8f65-cfaf46434997	\N	Vishal's Father	Vishal's Mother	+91-9876561008	+91-9876571008	Engineer	599120	DAY_SCHOLAR	A_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.837	2026-01-31 21:07:30.837	\N
cb6820d2-bbb0-44d7-bb6b-dfb7634f4ec4	30bffd05-b065-407f-acdd-1698a3fbc1b6	10	APAARSPS002000010	42eae334-bb4f-4b14-8870-6e6cd3e756b7	\N	Pooja's Father	Pooja's Mother	+91-9876561009	+91-9876571009	Doctor	894736	HOSTELLER	A_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.952	2026-01-31 21:07:30.952	\N
5e6c1d18-ae59-4ccb-b9e7-76f30eebc7ee	c340c2ec-3bc1-4288-8414-30d6afc77e3c	11	APAARSPS002000011	f03a0250-0254-4f32-9be7-ab1e0c46a6e1	\N	Arjun's Father	Arjun's Mother	+91-9876561010	+91-9876571010	Teacher	362754	DAY_SCHOLAR	B_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.061	2026-01-31 21:07:31.061	\N
978fbc4d-6080-43f0-ac27-a600b4c03047	2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	12	APAARSPS002000012	ae551295-5d18-4111-a9a6-3385262c1e9d	\N	Sita's Father	Sita's Mother	+91-9876561011	+91-9876571011	Business	544948	DAY_SCHOLAR	B_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.158	2026-01-31 21:07:31.158	\N
10ceea62-d337-4edc-aedc-271a551badd3	f0e447c9-a986-480e-97e5-b2e9fc586ca5	13	APAARSPS002000013	aeeb944d-d159-4f3f-927f-2143bf3452a6	\N	Krishna's Father	Krishna's Mother	+91-9876561012	+91-9876571012	Engineer	358689	HOSTELLER	AB_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.257	2026-01-31 21:07:31.257	\N
f9565558-3d29-4a76-8177-1a6a906e5e6b	ce386003-496f-49d0-af79-a1ed919fb083	14	APAARSPS002000014	f53f923e-a1d5-43e7-b1c3-943ac8b98947	\N	Radha's Father	Radha's Mother	+91-9876561013	+91-9876571013	Doctor	1440335	DAY_SCHOLAR	AB_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.364	2026-01-31 21:07:31.364	\N
488f19bc-9d9b-4a7a-bae5-ee381c2b0786	4a8857a1-2cd8-4fb5-82c6-f45df998ee99	15	APAARSPS002000015	da5c8ab5-1148-4ec5-b709-0c422f2955f6	\N	Ravi's Father	Ravi's Mother	+91-9876561014	+91-9876571014	Teacher	1287455	DAY_SCHOLAR	O_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.459	2026-01-31 21:07:31.459	\N
30957529-23cc-474c-bf8b-3f6723a789f4	a0012750-5ad8-4fd1-8e7d-e4d6d6106261	16	APAARSPS002000016	0fa6a2ca-ed5b-4c55-aed5-9d0471755e3c	\N	Meera's Father	Meera's Mother	+91-9876561015	+91-9876571015	Business	1129724	HOSTELLER	O_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.554	2026-01-31 21:07:31.554	\N
b4604150-89ea-45db-9566-e90d645f0c26	5262d4d8-59e0-4966-bbf4-901ce5962845	17	APAARSPS002000017	af13ec7a-71d8-4166-ba68-d515846bd235	\N	Sohan's Father	Sohan's Mother	+91-9876561016	+91-9876571016	Engineer	356795	DAY_SCHOLAR	A_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.649	2026-01-31 21:07:31.649	\N
f587dbfd-f72c-451a-8568-f3963e745c7e	b8418d07-b5a9-4386-8e28-7a6513511807	18	APAARSPS002000018	1a62f98d-09ef-45a0-89d7-2ba15237b4e0	\N	Lakshmi's Father	Lakshmi's Mother	+91-9876561017	+91-9876571017	Doctor	1117467	DAY_SCHOLAR	A_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.741	2026-01-31 21:07:31.741	\N
5f53c60d-afbf-4cd3-aea2-3d5ec720bd27	5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	19	APAARSPS002000019	5b733e1f-7300-4994-aa66-717d94925115	\N	Vishal's Father	Vishal's Mother	+91-9876561018	+91-9876571018	Teacher	626595	HOSTELLER	B_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.834	2026-01-31 21:07:31.834	\N
8128598f-358c-4123-8f84-a5b0a691c675	01db91ad-09c5-4fb6-9af0-0cbb6e8da161	20	APAARSPS002000020	0eb92e39-b7e6-4a8e-9bfb-1517fb0b5ce1	\N	Pooja's Father	Pooja's Mother	+91-9876561019	+91-9876571019	Business	795761	DAY_SCHOLAR	B_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.928	2026-01-31 21:07:31.928	\N
55104e3c-5a56-4d18-a322-67b1bd4ed585	30b04009-a242-43fd-a6e0-4a238ff1c533	21	APAARSPS002000021	dd567ff4-dd17-42b2-82f4-d0e991072a3e	\N	Arjun's Father	Arjun's Mother	+91-9876561020	+91-9876571020	Engineer	509524	DAY_SCHOLAR	AB_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:32.022	2026-01-31 21:07:32.022	\N
2722c0d5-30d6-4ac0-8d81-94bdffd6995a	5deab24a-a342-4d31-b98a-b900070f73fd	22	APAARSPS002000022	4d9626ce-1439-4238-8a7d-119f1ae0526a	\N	Sita's Father	Sita's Mother	+91-9876561021	+91-9876571021	Doctor	1385041	HOSTELLER	AB_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:32.118	2026-01-31 21:07:32.118	\N
bcc7c2f3-058e-45d2-9482-063f6dde7797	bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	1	APAARBFA003000001	d41a6879-faa6-470e-9382-d467e9cdfb45	\N	Arjun's Father	Arjun's Mother	+91-9876562000	+91-9876572000	Engineer	1131847	HOSTELLER	A_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.234	2026-01-31 21:07:33.234	\N
84e306f7-575b-42b1-9844-ed4ff8904aac	e44926dc-1879-4111-8db1-bb66a1f30281	2	APAARBFA003000002	e8df4774-5abb-42fd-b7dd-673080482bb9	\N	Sita's Father	Sita's Mother	+91-9876562001	+91-9876572001	Doctor	1385994	DAY_SCHOLAR	A_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.327	2026-01-31 21:07:33.327	\N
98af8c4e-a2a2-4753-ba24-f5956760c3b7	6a3e0aed-9726-4af7-9511-d81dc1deb671	3	APAARBFA003000003	94da982e-86c6-4033-959b-5d6ccb8c3051	\N	Krishna's Father	Krishna's Mother	+91-9876562002	+91-9876572002	Teacher	427626	DAY_SCHOLAR	B_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.432	2026-01-31 21:07:33.432	\N
9628a87f-54ae-4451-8844-450d9a4c7e1f	d921d166-1c6a-4340-b74e-73b969d90c04	4	APAARBFA003000004	9c28c8ca-66af-43f4-8460-c737c76e0fd7	\N	Radha's Father	Radha's Mother	+91-9876562003	+91-9876572003	Business	1012755	HOSTELLER	B_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.529	2026-01-31 21:07:33.529	\N
a55f067b-c88d-468e-8362-b43c84b6bed2	7604f074-20bd-4a5d-862c-6b20efded7cc	5	APAARBFA003000005	39646555-1b09-4906-8cf4-d0607030e24d	\N	Ravi's Father	Ravi's Mother	+91-9876562004	+91-9876572004	Engineer	844957	DAY_SCHOLAR	AB_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.626	2026-01-31 21:07:33.626	\N
b2a4df18-b2c2-4892-a5d3-de8d1d3679f0	b69e71f9-3ff3-44aa-8642-33db88c858b1	6	APAARBFA003000006	a42643d1-33a2-4cb5-9a48-b8ebadefebe9	\N	Meera's Father	Meera's Mother	+91-9876562005	+91-9876572005	Doctor	1015243	DAY_SCHOLAR	AB_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.724	2026-01-31 21:07:33.724	\N
7507ce05-6613-481a-9e50-80b1debea5c5	48786a4b-2515-45f3-ade9-2138f8f1bc89	7	APAARBFA003000007	46d4f4bd-a14f-4599-8fbc-087a87c4b5ba	\N	Sohan's Father	Sohan's Mother	+91-9876562006	+91-9876572006	Teacher	1333754	HOSTELLER	O_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.82	2026-01-31 21:07:33.82	\N
99a33367-0032-48c3-89d6-2d6eeefaeafa	ef593a77-cc85-410b-9ac0-ab5a8131742e	8	APAARBFA003000008	6a312ff6-b23e-4695-92d5-733e40bfd101	\N	Lakshmi's Father	Lakshmi's Mother	+91-9876562007	+91-9876572007	Business	1030612	DAY_SCHOLAR	O_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.916	2026-01-31 21:07:33.916	\N
a61273c4-de1a-43ef-92d3-98a8f7010696	64e30dd1-39da-4b8e-a184-8bf776638b66	9	APAARBFA003000009	083aeda9-6c26-4de6-983f-57f80a880b90	\N	Vishal's Father	Vishal's Mother	+91-9876562008	+91-9876572008	Engineer	824333	DAY_SCHOLAR	A_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.013	2026-01-31 21:07:34.013	\N
9affc9c0-5c54-47bb-8513-1540d06014b5	45a8ba58-a702-45c9-b181-6f91ab6c40a9	10	APAARBFA003000010	5775ad6f-83a2-473b-8349-ba8ac24d72e4	\N	Pooja's Father	Pooja's Mother	+91-9876562009	+91-9876572009	Doctor	582691	HOSTELLER	A_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.114	2026-01-31 21:07:34.114	\N
9bfae15b-3be8-4acf-bba5-f6e1ab1cc8bd	8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	11	APAARBFA003000011	4cb89199-dd0c-4a01-85d1-f2a52764fc1c	\N	Arjun's Father	Arjun's Mother	+91-9876562010	+91-9876572010	Teacher	1142998	DAY_SCHOLAR	B_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.215	2026-01-31 21:07:34.215	\N
c4ca906e-6135-4df3-9306-7d8d8195e855	838a8655-5f7c-4e1a-81d8-55a897328741	12	APAARBFA003000012	9843339a-cbf2-4466-83fe-ed944fc293f9	\N	Sita's Father	Sita's Mother	+91-9876562011	+91-9876572011	Business	1413429	DAY_SCHOLAR	B_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.314	2026-01-31 21:07:34.314	\N
0656e5e3-1afe-43a9-9678-f9bde1c2e985	a41e5329-c828-420a-9e3c-8d7713b33e29	13	APAARBFA003000013	11a888b9-2187-4d73-95cd-028b6652fc1b	\N	Krishna's Father	Krishna's Mother	+91-9876562012	+91-9876572012	Engineer	1350336	HOSTELLER	AB_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.411	2026-01-31 21:07:34.411	\N
a49d9f33-55bd-4cc2-bc57-f2fb8f5ba3ac	58596aae-9a88-4c44-9218-b36f600a6679	14	APAARBFA003000014	96906a0b-62f7-4d2a-abf7-ce3f434a09d3	\N	Radha's Father	Radha's Mother	+91-9876562013	+91-9876572013	Doctor	1080440	DAY_SCHOLAR	AB_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.504	2026-01-31 21:07:34.504	\N
0a4c4931-dbeb-4f0f-948f-a4970195dc5d	e6d78574-b683-4825-8ff2-c7b458004c6d	15	APAARBFA003000015	d41a6879-faa6-470e-9382-d467e9cdfb45	\N	Ravi's Father	Ravi's Mother	+91-9876562014	+91-9876572014	Teacher	448630	DAY_SCHOLAR	O_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.596	2026-01-31 21:07:34.596	\N
bb24f3ae-1247-4e51-b471-4a2b3a10a1f4	21f23385-0230-4170-96dc-8945f397030b	16	APAARBFA003000016	e8df4774-5abb-42fd-b7dd-673080482bb9	\N	Meera's Father	Meera's Mother	+91-9876562015	+91-9876572015	Business	459432	HOSTELLER	O_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.698	2026-01-31 21:07:34.698	\N
d3a9138a-3582-422f-927b-36550015212e	2de7165d-c0f7-4538-9de9-dc59f25006b1	17	APAARBFA003000017	94da982e-86c6-4033-959b-5d6ccb8c3051	\N	Sohan's Father	Sohan's Mother	+91-9876562016	+91-9876572016	Engineer	522281	DAY_SCHOLAR	A_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.79	2026-01-31 21:07:34.79	\N
540e4177-5a67-4d3c-92ac-7bd4b3499625	d0c8151d-b231-43ad-88b3-01bba8338bae	18	APAARBFA003000018	9c28c8ca-66af-43f4-8460-c737c76e0fd7	\N	Lakshmi's Father	Lakshmi's Mother	+91-9876562017	+91-9876572017	Doctor	1311372	DAY_SCHOLAR	A_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.882	2026-01-31 21:07:34.882	\N
224a12d4-7936-4d46-b081-6a62175fdecf	1620d4fa-643a-4599-9416-86d41c958e4c	19	APAARBFA003000019	39646555-1b09-4906-8cf4-d0607030e24d	\N	Vishal's Father	Vishal's Mother	+91-9876562018	+91-9876572018	Teacher	1031727	HOSTELLER	B_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.974	2026-01-31 21:07:34.974	\N
e83cc850-4d8a-4a4f-b841-d1a1292cfcb6	01705328-77b9-4769-ae3a-c42a8b5d2102	20	APAARBFA003000020	a42643d1-33a2-4cb5-9a48-b8ebadefebe9	\N	Pooja's Father	Pooja's Mother	+91-9876562019	+91-9876572019	Business	1017934	DAY_SCHOLAR	B_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.067	2026-01-31 21:07:35.067	\N
cd18e4dc-01f5-437a-af38-37c08af25175	c65ac420-c59a-4205-aeec-20b0e4b7d458	21	APAARBFA003000021	46d4f4bd-a14f-4599-8fbc-087a87c4b5ba	\N	Arjun's Father	Arjun's Mother	+91-9876562020	+91-9876572020	Engineer	1050437	DAY_SCHOLAR	AB_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.157	2026-01-31 21:07:35.157	\N
28019363-0c26-43c1-934d-1673f033d0d1	57a5828f-b710-4192-97d2-6b16f499e754	22	APAARBFA003000022	6a312ff6-b23e-4695-92d5-733e40bfd101	\N	Sita's Father	Sita's Mother	+91-9876562021	+91-9876572021	Doctor	320633	HOSTELLER	AB_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.249	2026-01-31 21:07:35.249	\N
aa1d2fbf-5dec-401b-9c6d-59cb7a5107a1	f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	23	APAARBFA003000023	083aeda9-6c26-4de6-983f-57f80a880b90	\N	Krishna's Father	Krishna's Mother	+91-9876562022	+91-9876572022	Teacher	728777	DAY_SCHOLAR	O_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.342	2026-01-31 21:07:35.342	\N
eb4f10f6-82b1-4c18-b0d2-e6acd03d6c96	48d46601-8536-4584-9015-a61f212b6c99	24	APAARBFA003000024	5775ad6f-83a2-473b-8349-ba8ac24d72e4	\N	Radha's Father	Radha's Mother	+91-9876562023	+91-9876572023	Business	693300	DAY_SCHOLAR	O_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.436	2026-01-31 21:07:35.436	\N
b813a563-1905-4bf5-8111-ff088c473d4f	52fed973-7f46-4b3c-a1ea-9c795b265100	25	APAARBFA003000025	4cb89199-dd0c-4a01-85d1-f2a52764fc1c	\N	Ravi's Father	Ravi's Mother	+91-9876562024	+91-9876572024	Engineer	1293957	HOSTELLER	A_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.531	2026-01-31 21:07:35.531	\N
438a9076-7ea2-4109-8c65-bd3974256cf0	1d448a82-b7b2-4f4a-9cce-2ee145490bf3	26	APAARBFA003000026	9843339a-cbf2-4466-83fe-ed944fc293f9	\N	Meera's Father	Meera's Mother	+91-9876562025	+91-9876572025	Doctor	320862	DAY_SCHOLAR	A_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.622	2026-01-31 21:07:35.622	\N
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.subjects (id, name, school_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
25a6f3e2-b6fb-4dd8-97af-72355d7c7c05	Mathematics	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	seed	\N	\N	2026-01-31 21:07:24.975	2026-01-31 21:07:24.975	\N
b4181abf-bc2f-4339-9177-ff25946cfcf2	English	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	seed	\N	\N	2026-01-31 21:07:24.992	2026-01-31 21:07:24.992	\N
125c2fc3-bdd0-495c-ba69-cc980271578f	Science	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	seed	\N	\N	2026-01-31 21:07:25.006	2026-01-31 21:07:25.006	\N
c45a7229-0493-4a06-99ba-9c5662f3554c	Social Studies	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	seed	\N	\N	2026-01-31 21:07:25.009	2026-01-31 21:07:25.009	\N
7a8f6b05-025e-4a5d-bd22-988ca4fd919d	Hindi	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	seed	\N	\N	2026-01-31 21:07:25.012	2026-01-31 21:07:25.012	\N
8ee6ceb0-4d03-4ce3-9d41-b9357dc7d715	Physical Education	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	seed	\N	\N	2026-01-31 21:07:25.015	2026-01-31 21:07:25.015	\N
1bfdc63d-4c1c-40a0-9338-808d432f05bc	Art	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	seed	\N	\N	2026-01-31 21:07:25.018	2026-01-31 21:07:25.018	\N
0ad66477-22b7-45c1-864c-c418c5aa4155	Music	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	seed	\N	\N	2026-01-31 21:07:25.032	2026-01-31 21:07:25.032	\N
91d83e1f-ec35-4e63-bbfd-eb7f5a3a9ca4	Mathematics	3a8d3873-81bc-4b79-ad76-5e335848ded1	seed	\N	\N	2026-01-31 21:07:25.101	2026-01-31 21:07:25.101	\N
e2dd4870-e4e0-4a19-a168-cdfd8e11cea8	English	3a8d3873-81bc-4b79-ad76-5e335848ded1	seed	\N	\N	2026-01-31 21:07:25.105	2026-01-31 21:07:25.105	\N
1d27cb36-e98a-4c1a-ac27-af3c1336b4a7	Science	3a8d3873-81bc-4b79-ad76-5e335848ded1	seed	\N	\N	2026-01-31 21:07:25.112	2026-01-31 21:07:25.112	\N
79675783-a208-432c-ace0-d522e7f924f1	Social Studies	3a8d3873-81bc-4b79-ad76-5e335848ded1	seed	\N	\N	2026-01-31 21:07:25.118	2026-01-31 21:07:25.118	\N
493da2e4-4a9f-4df3-9d30-e24333f9af32	Hindi	3a8d3873-81bc-4b79-ad76-5e335848ded1	seed	\N	\N	2026-01-31 21:07:25.122	2026-01-31 21:07:25.122	\N
e02293c1-f581-4bf6-bca1-8825e9ced211	Physical Education	3a8d3873-81bc-4b79-ad76-5e335848ded1	seed	\N	\N	2026-01-31 21:07:25.127	2026-01-31 21:07:25.127	\N
bd5ad67c-635a-44c4-a354-683b8343778b	Art	3a8d3873-81bc-4b79-ad76-5e335848ded1	seed	\N	\N	2026-01-31 21:07:25.131	2026-01-31 21:07:25.131	\N
60d00a20-8b37-4459-b99f-74280aea783e	Music	3a8d3873-81bc-4b79-ad76-5e335848ded1	seed	\N	\N	2026-01-31 21:07:25.135	2026-01-31 21:07:25.135	\N
d312e464-b7b2-4480-ad05-c1ca811de321	Mathematics	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	seed	\N	\N	2026-01-31 21:07:25.201	2026-01-31 21:07:25.201	\N
f389ed22-9ad5-477d-b9d6-89ee683d712b	English	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	seed	\N	\N	2026-01-31 21:07:25.205	2026-01-31 21:07:25.205	\N
16ff9daa-85db-4788-beb2-2bf5f32c4e8c	Science	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	seed	\N	\N	2026-01-31 21:07:25.209	2026-01-31 21:07:25.209	\N
0b986663-f81d-442d-a019-f8289fbc3e34	Social Studies	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	seed	\N	\N	2026-01-31 21:07:25.213	2026-01-31 21:07:25.213	\N
9557f724-7fe6-445b-9c24-f0cc9bed1578	Hindi	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	seed	\N	\N	2026-01-31 21:07:25.219	2026-01-31 21:07:25.219	\N
6a639da8-5531-487e-944d-56e40877015f	Physical Education	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	seed	\N	\N	2026-01-31 21:07:25.222	2026-01-31 21:07:25.222	\N
7550406d-1b8f-49c1-ad67-ba1819dfcedc	Art	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	seed	\N	\N	2026-01-31 21:07:25.227	2026-01-31 21:07:25.227	\N
3fcad1d7-9deb-46f4-bc95-8f37e410f4ea	Music	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	seed	\N	\N	2026-01-31 21:07:25.231	2026-01-31 21:07:25.231	\N
\.


--
-- Data for Name: teacher_profiles; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.teacher_profiles (id, user_id, designation, highest_qualification, university, year_of_passing, grade, transport_id, pan_card_number, blood_group, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
b374ec57-775e-462d-93ee-486a56f9a618	b2fdbb78-6a0e-4734-9673-190ec4411205	Senior Teacher	B.Ed	Delhi University	2010	A+	\N	ABCDE1000F	A_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:25.816	2026-01-31 21:07:25.816	\N
8ec1db6e-2d11-4910-89b3-ab81c9d722be	b5116dd4-1f22-4b1b-8b75-3eceede309b1	Teacher	M.Ed	Mumbai University	2011	A	\N	ABCDE1001F	A_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:25.913	2026-01-31 21:07:25.913	\N
b0e2412b-ff4c-459a-b41e-9072c43f6e1c	40ef3c97-312d-48c5-b01a-f617589cf7f9	Teacher	M.Sc	Bangalore University	2012	B+	\N	ABCDE1002F	B_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.015	2026-01-31 21:07:26.015	\N
5eb30f80-50c6-417e-a0a6-c88f51aa2975	5e52fcb9-178b-41e1-9ef1-d5981a472448	Teacher	B.Sc	Delhi University	2013	B	\N	ABCDE1003F	B_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.115	2026-01-31 21:07:26.115	\N
84a48057-3d85-4f59-a140-e2cb3307a2cb	59fb0b6e-c28d-46ce-a03d-e41bee48974f	Teacher	B.Ed	Mumbai University	2014	A+	\N	ABCDE1004F	AB_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.208	2026-01-31 21:07:26.208	\N
8f8ae12c-0176-48ba-8c64-804750318923	505eac16-9159-4f5c-bda4-662f0c6e168b	Teacher	M.Ed	Bangalore University	2015	A	\N	ABCDE1005F	AB_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.302	2026-01-31 21:07:26.302	\N
a17fe757-0b70-4ea4-8ae5-cfdf00efdf49	f6c31ec3-961d-4d8d-b584-e21a35c2d8ea	Teacher	M.Sc	Delhi University	2016	B+	\N	ABCDE1006F	O_POSITIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.394	2026-01-31 21:07:26.394	\N
29241c12-9914-4f46-98a7-dcaf40d41d67	66eaf9d1-7f04-49c5-844e-077bd96a7e10	Senior Teacher	B.Ed	Delhi University	2010	A+	\N	ABCDE1100F	A_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:29.527	2026-01-31 21:07:29.527	\N
2b80c12e-ff35-47ad-af79-cab746ba3908	3f7293fe-cfd2-4434-b79e-21a12fee6b04	Teacher	M.Ed	Mumbai University	2011	A	\N	ABCDE1101F	A_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:29.616	2026-01-31 21:07:29.616	\N
4a8ca261-b55f-4eb4-8f31-482bc3c3c779	181d2b96-2be1-4068-9360-cc0116753995	Teacher	M.Sc	Bangalore University	2012	B+	\N	ABCDE1102F	B_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:29.726	2026-01-31 21:07:29.726	\N
8cd61bb9-76c3-4c0c-ab68-2ce56c793a0f	3eccaf44-115c-4273-9e59-9bf3bd47858a	Teacher	B.Sc	Delhi University	2013	B	\N	ABCDE1103F	B_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:29.826	2026-01-31 21:07:29.826	\N
80fba57c-7402-47e9-933a-0677b8d570d9	ce6aa983-0944-4d4d-aa6c-00c77167386c	Teacher	B.Ed	Mumbai University	2014	A+	\N	ABCDE1104F	AB_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:29.92	2026-01-31 21:07:29.92	\N
3b1bad5e-0962-43ad-9088-65d6d1566c35	0bbad251-9dca-4715-b112-70809267e1d4	Senior Teacher	B.Ed	Delhi University	2010	A+	\N	ABCDE1200F	A_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:32.568	2026-01-31 21:07:32.568	\N
2e5f8553-b64b-4989-bb2f-0e3fdf5cb3ae	efeba828-5ea6-4ff4-99c9-1d10c2722a51	Teacher	M.Ed	Mumbai University	2011	A	\N	ABCDE1201F	A_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:32.667	2026-01-31 21:07:32.667	\N
6153843a-237d-4fd0-8754-b0407b963028	57890447-8a02-49f2-8293-ea0a92fe6882	Teacher	M.Sc	Bangalore University	2012	B+	\N	ABCDE1202F	B_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:32.759	2026-01-31 21:07:32.759	\N
bfd263c6-5755-4481-8bd3-9323aa58a9b4	3070175f-3f01-474f-a12c-22ad093a38f9	Teacher	B.Sc	Delhi University	2013	B	\N	ABCDE1203F	B_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:32.849	2026-01-31 21:07:32.849	\N
fa8b23e0-be50-471e-a24a-0220b489a336	d7ed0d7d-e2f1-44b8-833a-901dc022046a	Teacher	B.Ed	Mumbai University	2014	A+	\N	ABCDE1204F	AB_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:32.94	2026-01-31 21:07:32.94	\N
9dddeb8a-3a15-4b6f-9f88-b958d0d9d73e	4ccc50c5-f309-4061-bf3e-264810ba2cd4	Teacher	M.Ed	Bangalore University	2015	A	\N	ABCDE1205F	AB_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.034	2026-01-31 21:07:33.034	\N
3ef2f40b-a3a4-4cf5-b519-8b8e06570ebf	29ad7f4e-e798-4bc1-9053-96686087da16	Teacher	M.Sc	Delhi University	2016	B+	\N	ABCDE1206F	O_POSITIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.133	2026-01-31 21:07:33.133	\N
a968b825-3c2e-4677-a0b7-a695a65fd6d5	59799d3f-9973-473d-b0ef-77601d49fdc9	Teacher	M.Ed	Bangalore University	2015	A	\N	ABCDE1105F	AB_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:02.787	2026-02-01 06:31:02.787	\N
05e77435-ecbc-4904-919a-a9781809e56b	f5a138a5-96dc-4e75-b08a-d84f60851509	Teacher	M.Sc	Delhi University	2016	B+	\N	ABCDE1106F	O_POSITIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:02.948	2026-02-01 06:31:02.948	\N
eab722a9-0c7e-4b8d-8bd4-3a44bcbcfbeb	b6f90a52-a500-46c6-a3f4-96c654703ff6	Teacher	B.Sc	Mumbai University	2017	B	\N	ABCDE1007F	O_NEGATIVE	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:31:49.328	2026-02-01 06:31:49.328	\N
8ad0b3af-1404-4402-bb58-9d0f1b93a647	f174ccb9-7b89-4dc3-bd33-6e4afab70369	Teacher	B.Sc	Mumbai University	2017	B	\N	ABCDE1107F	O_NEGATIVE	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:49.603	2026-02-01 06:31:49.603	\N
5e0617fd-d5d6-4e84-a4f8-898b6b986414	5021ffd5-15c5-4377-b372-3401fd2694bd	Teacher	B.Sc	Mumbai University	2017	B	\N	ABCDE1207F	O_NEGATIVE	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:31:49.77	2026-02-01 06:31:49.77	\N
\.


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.templates (id, type, path, image_id, sample_id, title) FROM stdin;
\.


--
-- Data for Name: timetable_slots; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.timetable_slots (id, timetable_id, day_of_week, period_number, subject_id, teacher_id, room, start_time, end_time, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: timetables; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.timetables (id, name, class_id, school_id, effective_from, effective_till, is_active, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: transports; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.transports (id, type, license_number, vehicle_number, school_id, owner_first_name, owner_last_name, driver_first_name, driver_last_name, driver_date_of_birth, driver_contact, driver_gender, driver_photo_link, conductor_first_name, conductor_last_name, conductor_date_of_birth, conductor_contact, conductor_gender, conductor_photo_link, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
de1ff98d-ae82-446d-b697-710ee1b751fe	BUS	LIC001000	KA01AB1234	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	Ramesh	Kumar	Rajesh	Singh	1981-10-16 06:20:46.524	+91-9876590000	MALE	\N	Sunil	Yadav	1990-07-27 15:54:40.83	+91-9876591000	MALE	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.808	2026-01-31 21:07:35.808	\N
22b5ebd3-0ac5-4cbc-b7ee-6ff228ba6dd4	VAN	LIC001001	KA02CD5678	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	Suresh	Kumar	Vijay	Singh	1987-07-18 05:00:55.107	+91-9876590001	MALE	\N	Anil	Yadav	1985-01-18 03:58:31.352	+91-9876591001	MALE	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.812	2026-01-31 21:07:35.812	\N
d63eb6c7-e0af-4f13-9d7e-99f637c189de	CAR	LIC001002	KA03EF9012	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	Mahesh	Kumar	Ajay	Singh	1985-09-24 16:06:58.241	+91-9876590002	MALE	\N	Ramesh	Yadav	1985-10-07 01:30:25.894	+91-9876591002	MALE	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:35.816	2026-01-31 21:07:35.816	\N
64f921c6-a725-4df9-8c91-0f2f50f41bea	BUS	LIC002000	KA01AB1234	3a8d3873-81bc-4b79-ad76-5e335848ded1	Ramesh	Kumar	Rajesh	Singh	1981-09-22 17:59:24.51	+91-9876590000	MALE	\N	Sunil	Yadav	1987-04-11 16:39:17.256	+91-9876591000	MALE	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:35.819	2026-01-31 21:07:35.819	\N
6815e3ee-b913-4c9f-9f60-eb9a322bf2e1	VAN	LIC002001	KA02CD5678	3a8d3873-81bc-4b79-ad76-5e335848ded1	Suresh	Kumar	Vijay	Singh	1988-01-02 20:08:09.27	+91-9876590001	MALE	\N	Anil	Yadav	1985-04-16 01:27:07.595	+91-9876591001	MALE	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:35.822	2026-01-31 21:07:35.822	\N
df2fe605-650b-4965-955f-ff6fd9ef40a8	CAR	LIC002002	KA03EF9012	3a8d3873-81bc-4b79-ad76-5e335848ded1	Mahesh	Kumar	Ajay	Singh	1981-08-01 23:12:08.01	+91-9876590002	MALE	\N	Ramesh	Yadav	1987-01-01 18:24:48.274	+91-9876591002	MALE	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:35.825	2026-01-31 21:07:35.825	\N
62836049-e5ba-437c-a350-36c15f981701	BUS	LIC002003	KA04GH3456	3a8d3873-81bc-4b79-ad76-5e335848ded1	Ramesh	Kumar	Rajesh	Singh	1986-08-26 12:42:31.063	+91-9876590003	MALE	\N	Kumar	Yadav	1987-02-22 08:41:12.453	+91-9876591003	MALE	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:35.828	2026-01-31 21:07:35.828	\N
d38b70a2-8bca-47b0-b47c-500b74256c16	BUS	LIC003000	KA01AB1234	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	Ramesh	Kumar	Rajesh	Singh	1986-09-12 11:34:18.966	+91-9876590000	MALE	\N	Sunil	Yadav	1993-06-26 16:00:45.056	+91-9876591000	MALE	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.831	2026-01-31 21:07:35.831	\N
9f81cfc8-5c7e-4c58-b9ef-94611aadb6f4	VAN	LIC003001	KA02CD5678	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	Suresh	Kumar	Vijay	Singh	1986-08-28 05:50:10.037	+91-9876590001	MALE	\N	Anil	Yadav	1989-04-03 20:54:25.883	+91-9876591001	MALE	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.833	2026-01-31 21:07:35.833	\N
b920d869-920e-424c-84ba-cacdde1eef74	CAR	LIC003002	KA03EF9012	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	Mahesh	Kumar	Ajay	Singh	1986-09-02 18:26:16.241	+91-9876590002	MALE	\N	Ramesh	Yadav	1991-11-05 10:11:15.763	+91-9876591002	MALE	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.836	2026-01-31 21:07:35.836	\N
b4838fb2-e2d3-4720-bb7b-312c53234429	BUS	LIC001003	KA04GH3456	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	Ramesh	Kumar	Rajesh	Singh	1980-02-17 11:54:03.618	+91-9876590003	MALE	\N	Kumar	Yadav	1991-12-31 09:39:07.965	+91-9876591003	MALE	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:31:49.862	2026-02-01 06:31:49.862	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.users (id, public_user_id, user_type, email, password, first_name, last_name, contact, gender, date_of_birth, address, aadhaar_id, registration_photo_id, id_photo_id, role_id, school_id, assigned_region_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
1670a10d-e7b4-49e2-bf75-21fcf4949a20	APPE0001	APP	john.doe@schooliat.com	$2b$10$ThU2547zysoklRTMCuaL5OL884SRxFXzE8c8JFRvWi3.22oV1dmT2	John	Doe	+91-9876543001	MALE	1990-05-15 00:00:00	{"Employee Address",City}	\N	\N	\N	12e01475-888f-4365-8973-938b70ff8c87	\N	a754acd7-f709-4bfa-8cac-26f578ecdec6	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	\N	2026-01-31 21:07:25.393	2026-01-31 21:07:25.393	\N
88520431-09aa-4e37-bf9e-912c8060c79f	APPE0002	APP	jane.smith@schooliat.com	$2b$10$UoXxTChr8BEaNbeDBc2uROjW6eT8BYlwq6ia.4yY78zQ7hL61OmPm	Jane	Smith	+91-9876543002	FEMALE	1992-08-20 00:00:00	{"Employee Address",City}	\N	\N	\N	12e01475-888f-4365-8973-938b70ff8c87	\N	422678a5-580e-4a31-b685-890a810d5fa7	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	\N	2026-01-31 21:07:25.486	2026-01-31 21:07:25.486	\N
791098c9-a03a-470c-9b30-8852019eeb59	APPE0003	APP	mike.johnson@schooliat.com	$2b$10$hxuF4VPTITdkS.k0bl1TxeWabVsflPQFxfGT8hqOWZDjc.vwohnIi	Mike	Johnson	+91-9876543003	MALE	1988-03-10 00:00:00	{"Employee Address",City}	\N	\N	\N	12e01475-888f-4365-8973-938b70ff8c87	\N	89581564-f003-4808-a73b-733145506bd3	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	\N	2026-01-31 21:07:25.591	2026-01-31 21:07:25.591	\N
d858d9d6-a314-4a6c-9e95-fc49e0c964e3	GIS001A0001	SCHOOL	admin@gis001.edu	$2b$10$1Ca9JgL3tlguzFB/W2PIxOwgxj7JlMHfJW/B.PLt5BMKRXrwgjaCq	GIS001	Admin	+91-9876543210	MALE	1985-01-01 00:00:00	{"123 Education Street","Greenwood City","State - 123456"}	\N	\N	\N	f8c53c7c-72ae-4cc9-b99a-f633213aae54	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	\N	2026-01-31 21:07:25.695	2026-01-31 21:07:25.695	\N
b2fdbb78-6a0e-4734-9673-190ec4411205	GIS001T0001	SCHOOL	teacher1@gis001.edu	$2b$10$pZk6htH9HCgpfxY9Gme4aOTF9YlrfG8V6Nlqd3Lev0LI5X4cc6rYG	Rajesh	Kumar	+91-9876540000	MALE	1991-05-17 03:32:13.484	{"123 Education Street","Greenwood City","State - 123456"}	1234567890	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:25.816	2026-01-31 21:07:25.816	\N
b5116dd4-1f22-4b1b-8b75-3eceede309b1	GIS001T0002	SCHOOL	teacher2@gis001.edu	$2b$10$Rw07tNpjWVVon8ZZNfT/gOgU/AVt6OUIkMrCqo24NCemGy5i/YXLy	Priya	Sharma	+91-9876540001	FEMALE	1983-10-20 01:00:37.988	{"123 Education Street","Greenwood City","State - 123456"}	1234567891	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:25.913	2026-01-31 21:07:25.913	\N
40ef3c97-312d-48c5-b01a-f617589cf7f9	GIS001T0003	SCHOOL	teacher3@gis001.edu	$2b$10$h23DA49XHId1gBgiyIhXP.31v1mxLYaXGx4QFbZhKpY0i.MJpIaMi	Amit	Patel	+91-9876540002	MALE	1993-01-29 00:19:19.76	{"123 Education Street","Greenwood City","State - 123456"}	1234567892	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.015	2026-01-31 21:07:26.015	\N
5e52fcb9-178b-41e1-9ef1-d5981a472448	GIS001T0004	SCHOOL	teacher4@gis001.edu	$2b$10$oYA0TU7ukZUFR83V1KjpS.m616cM../sgRsV2WZBU/6SKNpe/SKmm	Sneha	Singh	+91-9876540003	FEMALE	1981-07-01 02:56:30.464	{"123 Education Street","Greenwood City","State - 123456"}	1234567893	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.115	2026-01-31 21:07:26.115	\N
59fb0b6e-c28d-46ce-a03d-e41bee48974f	GIS001T0005	SCHOOL	teacher5@gis001.edu	$2b$10$2zliZsgPmsV6Aw86JRW6S.AxzJ1s8mTqU2aiqlXf8/D/Aixg.rUC6	Vikram	Reddy	+91-9876540004	MALE	1989-07-02 13:07:33.922	{"123 Education Street","Greenwood City","State - 123456"}	1234567894	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.208	2026-01-31 21:07:26.208	\N
505eac16-9159-4f5c-bda4-662f0c6e168b	GIS001T0006	SCHOOL	teacher6@gis001.edu	$2b$10$QyAyw95nTzBsYpEPJEFX7e.txx.jTJFdCSMTV6U/BHY/L3ukzaioC	Anjali	Gupta	+91-9876540005	FEMALE	1992-12-27 09:03:45.756	{"123 Education Street","Greenwood City","State - 123456"}	1234567895	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.302	2026-01-31 21:07:26.302	\N
f6c31ec3-961d-4d8d-b584-e21a35c2d8ea	GIS001T0007	SCHOOL	teacher7@gis001.edu	$2b$10$Yk3fUOjdbUVAJhZZdaUUk.R9K6euqRq0/g2e7jlPy1RS3CiaaXc7O	Rahul	Mehta	+91-9876540006	MALE	1989-07-26 14:52:16.788	{"123 Education Street","Greenwood City","State - 123456"}	1234567896	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.394	2026-01-31 21:07:26.394	\N
bf6a9d9f-555e-4d5b-82d0-4f3129bdd0d3	GIS001S0001	SCHOOL	student1@gis001.edu	$2b$10$hyoyXh5gcn7QqI8TSYumBe7Ff4vGITEaEyjrQP0phhCVFxVmb3lli	Arjun	Kumar	+91-9876550000	MALE	2013-09-13 16:56:57.119	{"123 Education Street","Greenwood City","State - 123456"}	5678901234	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.487	2026-01-31 21:07:26.487	\N
e45904e7-d5c9-4a2f-a99f-62c7254e617b	GIS001S0002	SCHOOL	student2@gis001.edu	$2b$10$UD9YkUC.LKNIn.hH21G5mu/nf5CnkZmMvscnX92XF7aOfuPJH7Mxa	Sita	Sharma	+91-9876550001	FEMALE	2012-07-20 20:12:29.882	{"123 Education Street","Greenwood City","State - 123456"}	5678901235	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.589	2026-01-31 21:07:26.589	\N
712bff62-7b72-4209-9449-c6f71b4245c3	GIS001S0003	SCHOOL	student3@gis001.edu	$2b$10$WnlP.FxpYSOEewyRdV/sj.1Ew2QGwNm.Bhd8Uv1LMd8urPHqM.hfm	Krishna	Patel	+91-9876550002	MALE	2011-02-12 23:52:37.76	{"123 Education Street","Greenwood City","State - 123456"}	5678901236	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.703	2026-01-31 21:07:26.703	\N
d093977f-47eb-4994-b86f-e168485ce4f8	GIS001S0004	SCHOOL	student4@gis001.edu	$2b$10$8dSlPy8CGOFIeqRERmtgZe6FS9MLW/AypJnlggN7levSKsaVV5nXi	Radha	Singh	+91-9876550003	FEMALE	2012-04-18 03:16:01.548	{"123 Education Street","Greenwood City","State - 123456"}	5678901237	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.823	2026-01-31 21:07:26.823	\N
6521d86c-e324-436b-a390-ea871d6bbc33	GIS001S0005	SCHOOL	student5@gis001.edu	$2b$10$tgBp7kRRMM1znusHL5Pdr.MbB21dVSCc5ro0ZsvXgO8eQrFJhVLTa	Ravi	Reddy	+91-9876550004	MALE	2010-07-04 05:33:14.364	{"123 Education Street","Greenwood City","State - 123456"}	5678901238	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:26.936	2026-01-31 21:07:26.936	\N
a4e175d9-ab62-41bf-b520-1041d7d4a66e	GIS001S0006	SCHOOL	student6@gis001.edu	$2b$10$jZCWDY0PFaU/ZtLDflXJjOeD6FJRS3d/uyruOkkRhi5UIGZRjR6Nm	Meera	Gupta	+91-9876550005	FEMALE	2013-12-05 23:25:31.749	{"123 Education Street","Greenwood City","State - 123456"}	5678901239	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.033	2026-01-31 21:07:27.033	\N
493828d5-6a30-483f-b97c-f3340071a9f3	GIS001S0007	SCHOOL	student7@gis001.edu	$2b$10$vknZP0GXrLCicjxEy3eSPeVWfWuBueOr63cXUuf9Kp.YFYxt99IkW	Sohan	Mehta	+91-9876550006	MALE	2011-05-27 00:30:26.196	{"123 Education Street","Greenwood City","State - 123456"}	5678901240	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.136	2026-01-31 21:07:27.136	\N
a00e95cd-2cb5-4cc4-af0c-f15f84658b37	GIS001S0008	SCHOOL	student8@gis001.edu	$2b$10$lKi0KPcAXxjyJaWjRGO89uUuyATRIlmiHfvfmyvxQd2NJuZS7Nfd2	Lakshmi	Joshi	+91-9876550007	FEMALE	2012-06-06 05:04:13.459	{"123 Education Street","Greenwood City","State - 123456"}	5678901241	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.228	2026-01-31 21:07:27.228	\N
9e2b9f8a-2374-4889-b7a6-e1f70099d985	GIS001S0009	SCHOOL	student9@gis001.edu	$2b$10$PhO1wEVh/J3E6aS6z.eSVO/hCAHcj3Z78edTlSxYQ8QcvS8lECJE2	Vishal	Verma	+91-9876550008	MALE	2012-09-23 21:26:50.353	{"123 Education Street","Greenwood City","State - 123456"}	5678901242	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.32	2026-01-31 21:07:27.32	\N
8f2eec09-50d0-45d4-a5f8-5298b616c517	GIS001S0010	SCHOOL	student10@gis001.edu	$2b$10$F06gaqKKhGOCcjZmlKitFOgh3k3Itnoklt/EXINGPjGLwQDDSXjQO	Pooja	Yadav	+91-9876550009	FEMALE	2012-06-10 02:14:28.222	{"123 Education Street","Greenwood City","State - 123456"}	5678901243	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.411	2026-01-31 21:07:27.411	\N
6ba9f415-6f6e-4fbb-a564-2d9e65416c21	GIS001S0011	SCHOOL	student11@gis001.edu	$2b$10$afEBi.F2nctVjBSa0fQFoOlpODHRuaXuTMvbSoGeDdaPC8ziTlPiu	Arjun	Kumar	+91-9876550010	MALE	2012-06-17 08:00:09.296	{"123 Education Street","Greenwood City","State - 123456"}	5678901244	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.505	2026-01-31 21:07:27.505	\N
1b5dad61-4a39-462d-bad2-37c28fd89114	GIS001S0012	SCHOOL	student12@gis001.edu	$2b$10$D91j0sQyQVlBcXWFzFkoeeQsD91N8iympTkGYxBXgOp1/RAdJ0ZNG	Sita	Sharma	+91-9876550011	FEMALE	2010-04-13 09:59:39.637	{"123 Education Street","Greenwood City","State - 123456"}	5678901245	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.611	2026-01-31 21:07:27.611	\N
37c91fcc-5a5c-44cc-a522-9a54294f029b	GIS001S0013	SCHOOL	student13@gis001.edu	$2b$10$G3cUo0evdwEklkZp3u/3WuQIOz0fPKFBE8qW82ABpF3u7JhA1jSqe	Krishna	Patel	+91-9876550012	MALE	2012-03-23 01:07:33.677	{"123 Education Street","Greenwood City","State - 123456"}	5678901246	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.705	2026-01-31 21:07:27.705	\N
4165c5a1-b8bc-42e8-b9a0-5f2aefc71415	GIS001S0014	SCHOOL	student14@gis001.edu	$2b$10$lojEm5qo.d/rxFI/EvJN/.iWNK35KfrvhmjDlnOgAraFnjoV.Psv6	Radha	Singh	+91-9876550013	FEMALE	2010-08-14 00:59:20.423	{"123 Education Street","Greenwood City","State - 123456"}	5678901247	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.797	2026-01-31 21:07:27.797	\N
bfd569ab-9496-48de-9a3d-fc993d08506f	GIS001S0015	SCHOOL	student15@gis001.edu	$2b$10$dvpF8Zuc/X2jqk29mVyCeeKb3kcE6/h4KYyGH0dDgW3PDwQWHEJse	Ravi	Reddy	+91-9876550014	MALE	2011-03-30 04:19:02.736	{"123 Education Street","Greenwood City","State - 123456"}	5678901248	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:27.888	2026-01-31 21:07:27.888	\N
6ad41b47-9a70-4b96-82f2-bd011e484425	GIS001S0016	SCHOOL	student16@gis001.edu	$2b$10$pwcVFMrzJtndTCCKsu0Fw.CAvdXQn4PLfEZb9SSWyaJx.h/zGLbNW	Meera	Gupta	+91-9876550015	FEMALE	2013-07-04 15:57:48.759	{"123 Education Street","Greenwood City","State - 123456"}	5678901249	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28	2026-01-31 21:07:28	\N
40ac006c-c566-42bb-bb54-b3f866aec6ef	GIS001S0017	SCHOOL	student17@gis001.edu	$2b$10$RUC2KqooT3Fx7Fm1f8h8YuRuMFz1G7ZRPjhrXnOLr.nzK0hN/lZ2S	Sohan	Mehta	+91-9876550016	MALE	2014-11-22 08:08:08.128	{"123 Education Street","Greenwood City","State - 123456"}	5678901250	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.096	2026-01-31 21:07:28.096	\N
303fd3ae-b206-4cd0-a2df-e7e82f4d4f88	GIS001S0018	SCHOOL	student18@gis001.edu	$2b$10$phS3sJRjQcK8Ov0vCCGHPuypx7MxDg/5L0Eq6W4TPUq/QIndHM5hq	Lakshmi	Joshi	+91-9876550017	FEMALE	2012-01-19 00:30:24.769	{"123 Education Street","Greenwood City","State - 123456"}	5678901251	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.194	2026-01-31 21:07:28.194	\N
a65aec58-6d20-443d-b343-b523fd23c3fe	GIS001S0019	SCHOOL	student19@gis001.edu	$2b$10$l9UlffxX28TgBn5tYmdAve.nJzP.c1Fjuc.aoXQPdts/ioMYWfJfe	Vishal	Verma	+91-9876550018	MALE	2011-02-13 03:35:59.142	{"123 Education Street","Greenwood City","State - 123456"}	5678901252	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.294	2026-01-31 21:07:28.294	\N
642dd4e1-6bd2-493a-9cb3-cb8b66942bd6	GIS001S0020	SCHOOL	student20@gis001.edu	$2b$10$XJinWmiUVswRdXHyDA9svehtKMgQJ5ZGFOHymZP2r14QRBm4fkU3W	Pooja	Yadav	+91-9876550019	FEMALE	2013-07-26 01:30:13.102	{"123 Education Street","Greenwood City","State - 123456"}	5678901253	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.392	2026-01-31 21:07:28.392	\N
4c630659-8629-4c8c-8218-e8f2fdec3177	GIS001S0021	SCHOOL	student21@gis001.edu	$2b$10$lpi49wvtVQEK.9K0s95jVuvmlibBDxpO92cNdaJRJc678zY.T76dC	Arjun	Kumar	+91-9876550020	MALE	2013-09-01 02:20:55.962	{"123 Education Street","Greenwood City","State - 123456"}	5678901254	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.487	2026-01-31 21:07:28.487	\N
5679f26f-a3a0-468a-a503-3048a3241e43	GIS001S0022	SCHOOL	student22@gis001.edu	$2b$10$aaIgL18ZBfluuwJkNmcfIutvxoynhmX2eLRWJkM49WuMY7wJAPNBe	Sita	Sharma	+91-9876550021	FEMALE	2010-10-05 05:46:53.951	{"123 Education Street","Greenwood City","State - 123456"}	5678901255	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.583	2026-01-31 21:07:28.583	\N
d248beb0-da42-4f88-8154-e109df23fccd	GIS001S0023	SCHOOL	student23@gis001.edu	$2b$10$Vw8HryXxpCmz3DgeQ5p2BOJF8Lk9GQ6E23T7HLBmZSZvr04OdY6Mq	Krishna	Patel	+91-9876550022	MALE	2010-11-24 04:36:40.907	{"123 Education Street","Greenwood City","State - 123456"}	5678901256	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.678	2026-01-31 21:07:28.678	\N
ec8cd6df-fe83-455e-9bc9-7d6217334203	GIS001S0024	SCHOOL	student24@gis001.edu	$2b$10$nQXS4q.vgExZnj2HsGXkOu5oKHZJ1mmc/VBzrY3d96//Mt.DB3Jli	Radha	Singh	+91-9876550023	FEMALE	2011-12-13 11:26:39.73	{"123 Education Street","Greenwood City","State - 123456"}	5678901257	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.769	2026-01-31 21:07:28.769	\N
6e4a1a46-f6e2-479d-afa9-be2c82bfb480	GIS001S0025	SCHOOL	student25@gis001.edu	$2b$10$cWwtqbBdOXlaWwm6J3FQ0uXbFHuPpwfaFfeev06wrf6PAXcg8/6Yq	Ravi	Reddy	+91-9876550024	MALE	2013-06-03 06:49:45.325	{"123 Education Street","Greenwood City","State - 123456"}	5678901258	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.866	2026-01-31 21:07:28.866	\N
68e8a1b1-3b05-4ec3-82d3-14a765cb7ce6	GIS001S0026	SCHOOL	student26@gis001.edu	$2b$10$bsarj60GpOrNzCo4BR/UpOmSCPCJe9hpTc1fEOf450sbMT1xdnXme	Meera	Gupta	+91-9876550025	FEMALE	2011-10-29 06:36:44.577	{"123 Education Street","Greenwood City","State - 123456"}	5678901259	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:28.971	2026-01-31 21:07:28.971	\N
771ff4aa-9a5a-46a3-8bec-63abca353800	GIS001S0027	SCHOOL	student27@gis001.edu	$2b$10$.9/Z6fSJnVVMRnu4udvdguyGGQvtOhdZIJMbBBxfgm0xZMATkWab2	Sohan	Mehta	+91-9876550026	MALE	2013-11-27 05:50:16.86	{"123 Education Street","Greenwood City","State - 123456"}	5678901260	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:29.075	2026-01-31 21:07:29.075	\N
db38d8ab-b5ab-4cb3-88a1-dd39a2e4390d	GIS001ST0001	SCHOOL	staff1@gis001.edu	$2b$10$aEWBxcxVDkVJ2atODkP.4e07PBG8zXGtOOfbFwcBdkWkjlC3715Xu	Ramesh	Yadav	+91-9876580000	MALE	1994-08-22 22:59:42.071	{"123 Education Street","Greenwood City","State - 123456"}	\N	\N	\N	625018d7-cf94-4043-b6dc-da823bb1e629	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:29.177	2026-01-31 21:07:29.177	\N
dfb65df0-183a-4d53-9b72-c2a53dda3494	GIS001ST0002	SCHOOL	staff2@gis001.edu	$2b$10$JMvHTFQ9oL.TvEoDt5dunOSM3qMy8YV23AvBrH8ewnEaPRW/Q7OAK	Sunita	Devi	+91-9876580001	FEMALE	1988-08-27 02:09:19.272	{"123 Education Street","Greenwood City","State - 123456"}	\N	\N	\N	625018d7-cf94-4043-b6dc-da823bb1e629	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:29.264	2026-01-31 21:07:29.264	\N
ba80a6cb-c190-41a6-8def-d74a5eaf309f	GIS001ST0003	SCHOOL	staff3@gis001.edu	$2b$10$pu6hPcWapslbAtpEHgRIHOhoyZDOJdGHwmbqQvsAYEv1FTFGYeI6i	Mohan	Sharma	+91-9876580002	MALE	1991-10-27 07:44:53.665	{"123 Education Street","Greenwood City","State - 123456"}	\N	\N	\N	625018d7-cf94-4043-b6dc-da823bb1e629	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-01-31 21:07:29.353	2026-01-31 21:07:29.353	\N
8cd8e109-d8b7-43dd-8863-feba4f470fe6	SPS002A0001	SCHOOL	admin@sps002.edu	$2b$10$OEProHE9xRvoRUznFDqGQe6hsMR79SRYiLGgpE5txtPDCcYlDf2v.	SPS002	Admin	+91-9876543220	MALE	1985-01-01 00:00:00	{"456 Learning Avenue","Sunshine Town","State - 123457"}	\N	\N	\N	f8c53c7c-72ae-4cc9-b99a-f633213aae54	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	\N	2026-01-31 21:07:29.441	2026-01-31 21:07:29.441	\N
66eaf9d1-7f04-49c5-844e-077bd96a7e10	SPS002T0001	SCHOOL	teacher1@sps002.edu	$2b$10$FHhpfe/B92f5dTSE/o.i9uJTtJenLAE1OyTzgCldBniS9DbH34Rv.	Rajesh	Kumar	+91-9876540100	MALE	1990-09-30 19:12:45.669	{"456 Learning Avenue","Sunshine Town","State - 123457"}	1234568890	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:29.527	2026-01-31 21:07:29.527	\N
3f7293fe-cfd2-4434-b79e-21a12fee6b04	SPS002T0002	SCHOOL	teacher2@sps002.edu	$2b$10$/2ziJl3DDqNxJ/pkjPSYY.cVvhfkqvKF73XHHEQYPsbNEh3mY6Sa6	Priya	Sharma	+91-9876540101	FEMALE	1992-04-04 10:51:29.272	{"456 Learning Avenue","Sunshine Town","State - 123457"}	1234568891	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:29.616	2026-01-31 21:07:29.616	\N
181d2b96-2be1-4068-9360-cc0116753995	SPS002T0003	SCHOOL	teacher3@sps002.edu	$2b$10$nX/4FjYEUrhkXdGAc4DneuB.PCnnR.H/d0HTGwupcDW3QiHStxshG	Amit	Patel	+91-9876540102	MALE	1991-03-19 09:07:38.713	{"456 Learning Avenue","Sunshine Town","State - 123457"}	1234568892	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:29.726	2026-01-31 21:07:29.726	\N
3eccaf44-115c-4273-9e59-9bf3bd47858a	SPS002T0004	SCHOOL	teacher4@sps002.edu	$2b$10$JYF9oMoScY41AyMEMIzR7OHz.n/3mmsYlSY/KC5wpXvAYvn/QIDRq	Sneha	Singh	+91-9876540103	FEMALE	1985-09-28 10:00:56.224	{"456 Learning Avenue","Sunshine Town","State - 123457"}	1234568893	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:29.826	2026-01-31 21:07:29.826	\N
ce6aa983-0944-4d4d-aa6c-00c77167386c	SPS002T0005	SCHOOL	teacher5@sps002.edu	$2b$10$h4Qq6sVfY1AhE9vHtQnR2.zIdNrfNMdi.O9RJ6DFEfpdC8EOekMNe	Vikram	Reddy	+91-9876540104	MALE	1992-12-23 00:20:38.606	{"456 Learning Avenue","Sunshine Town","State - 123457"}	1234568894	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:29.92	2026-01-31 21:07:29.92	\N
720bb673-1254-46f0-b3d8-b297a95b1cc0	SPS002S0001	SCHOOL	student1@sps002.edu	$2b$10$xZvY70FrJ/OK4FDg/dgWb.ZtvHFYW.9Owhe3dXJYmQW.1ttSLy.0a	Arjun	Kumar	+91-9876551000	MALE	2011-05-29 11:30:27.842	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911234	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.023	2026-01-31 21:07:30.023	\N
e0aa8f43-a713-4597-9c61-ef277e3a8dd6	SPS002S0002	SCHOOL	student2@sps002.edu	$2b$10$9UlrmhNn.wYcx9tVlbdNReTpOsYCoLn9dVGli5kTLbjYXSskGd8le	Sita	Sharma	+91-9876551001	FEMALE	2010-09-08 15:58:53.423	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911235	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.119	2026-01-31 21:07:30.119	\N
6f2186bc-34b9-4216-9038-fc88557d74e8	SPS002S0003	SCHOOL	student3@sps002.edu	$2b$10$2VEqO6aLjoCvp8P/CQkNAeiCbzHsaj.C9J4DSZccORlE2lAfL3lFq	Krishna	Patel	+91-9876551002	MALE	2011-03-15 14:49:14.966	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911236	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.227	2026-01-31 21:07:30.227	\N
553bdd85-9816-4f78-aa42-333fe4ea895a	SPS002S0004	SCHOOL	student4@sps002.edu	$2b$10$PkkPei7h.9FtltFsOw1hneQhk2adN7hqz7dDJqVpnzpd2zUf.Rryy	Radha	Singh	+91-9876551003	FEMALE	2013-02-27 21:17:30.314	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911237	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.321	2026-01-31 21:07:30.321	\N
7a080a93-5c97-4372-8877-3532d0c770b0	SPS002S0005	SCHOOL	student5@sps002.edu	$2b$10$jFiV6TYMUyIIo0w80MCpBujnVOl0at89yty70KxNtEW86GMTvu3xC	Ravi	Reddy	+91-9876551004	MALE	2010-09-03 22:14:25.361	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911238	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.431	2026-01-31 21:07:30.431	\N
a792810d-6eeb-4be3-9125-ed4167ef3d38	SPS002S0006	SCHOOL	student6@sps002.edu	$2b$10$YWkRmh12HxYwUGNj2Euelulqhx/xw8TzdUgrA13MoS0ACecAkwf8K	Meera	Gupta	+91-9876551005	FEMALE	2012-08-27 15:42:12.026	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911239	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.534	2026-01-31 21:07:30.534	\N
775b3337-def5-4cfc-97f7-67480f085e34	SPS002S0007	SCHOOL	student7@sps002.edu	$2b$10$ynefOVOrdQqIBxR6zbOWdeFNB6k9J8aoFGS19XlCEFinsGgaiz2VW	Sohan	Mehta	+91-9876551006	MALE	2012-01-18 09:21:50.949	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911240	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.63	2026-01-31 21:07:30.63	\N
ac9aacc9-1aca-4364-b741-721f83f86d39	SPS002S0008	SCHOOL	student8@sps002.edu	$2b$10$Z8beLPu1r7QxkqFPXADaNu5LLEDB.JbmiCAWjpuFvyWPSyldmlAy2	Lakshmi	Joshi	+91-9876551007	FEMALE	2011-06-30 16:38:41.814	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911241	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.733	2026-01-31 21:07:30.733	\N
9aa0bfcb-ddae-4075-8e0c-69a3050d963c	SPS002S0009	SCHOOL	student9@sps002.edu	$2b$10$YvEByEPc/Gf2vy7F66bmP.sC1vFkhyRMISporNi8qrGbU.4CoO58q	Vishal	Verma	+91-9876551008	MALE	2010-05-25 14:56:49.809	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911242	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.837	2026-01-31 21:07:30.837	\N
30bffd05-b065-407f-acdd-1698a3fbc1b6	SPS002S0010	SCHOOL	student10@sps002.edu	$2b$10$.v8lORcz/nzbmkQWIgJiGOw99.EdRgoyGHWNE2duGBzJmAm5iORHK	Pooja	Yadav	+91-9876551009	FEMALE	2010-06-15 06:00:37.516	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911243	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:30.952	2026-01-31 21:07:30.952	\N
c340c2ec-3bc1-4288-8414-30d6afc77e3c	SPS002S0011	SCHOOL	student11@sps002.edu	$2b$10$UDrFNYJ5T5g7L7298NYemeSHDV7eOkm9wesu7gjjTzJXbWBo3wLN6	Arjun	Kumar	+91-9876551010	MALE	2014-08-26 07:13:11.71	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911244	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.061	2026-01-31 21:07:31.061	\N
2bb9017d-59a9-4a52-a7dc-0b5de4a4f5c8	SPS002S0012	SCHOOL	student12@sps002.edu	$2b$10$HKuHzbWnj6NB/9VBeUdPVui05hS64gDw/Rqads2fN5L7Jl3eQylre	Sita	Sharma	+91-9876551011	FEMALE	2013-12-14 06:41:05.905	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911245	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.158	2026-01-31 21:07:31.158	\N
f0e447c9-a986-480e-97e5-b2e9fc586ca5	SPS002S0013	SCHOOL	student13@sps002.edu	$2b$10$58J.Xq1253B4ZDrmOjg6nu7kdvlfdH6TKAn34.XGspW8YnNprsPju	Krishna	Patel	+91-9876551012	MALE	2011-03-09 04:35:55.559	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911246	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.257	2026-01-31 21:07:31.257	\N
ce386003-496f-49d0-af79-a1ed919fb083	SPS002S0014	SCHOOL	student14@sps002.edu	$2b$10$yJ5GS3wXjrfA8gaT.F75CenjTrO5Rp1bgrlx3eRie6kRd3eV4SDi6	Radha	Singh	+91-9876551013	FEMALE	2014-10-18 08:06:53.128	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911247	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.364	2026-01-31 21:07:31.364	\N
4a8857a1-2cd8-4fb5-82c6-f45df998ee99	SPS002S0015	SCHOOL	student15@sps002.edu	$2b$10$nQyZcUEqni9HKFPHqIgj8eQyMcY05ikM6mIAzp07MS5BpBH/KUSoa	Ravi	Reddy	+91-9876551014	MALE	2013-12-10 13:04:19.036	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911248	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.459	2026-01-31 21:07:31.459	\N
a0012750-5ad8-4fd1-8e7d-e4d6d6106261	SPS002S0016	SCHOOL	student16@sps002.edu	$2b$10$DGMjdtu2E191NYMvut97puT5yz7ENZA7SkRENU.TNPjVL4m4po1Ze	Meera	Gupta	+91-9876551015	FEMALE	2014-03-23 12:20:44.536	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911249	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.554	2026-01-31 21:07:31.554	\N
5262d4d8-59e0-4966-bbf4-901ce5962845	SPS002S0017	SCHOOL	student17@sps002.edu	$2b$10$pJgLAocBVmfV3HYfjXmBXOuWJ/D6/uDMCxK7NxhLfahB3DV/alFSO	Sohan	Mehta	+91-9876551016	MALE	2012-08-29 21:23:35.989	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911250	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.649	2026-01-31 21:07:31.649	\N
b8418d07-b5a9-4386-8e28-7a6513511807	SPS002S0018	SCHOOL	student18@sps002.edu	$2b$10$X4UJPzUV5GIJPpiLoQXDlOBo6dyeasSf5I2meZ8/iUpFXT.R.FLmW	Lakshmi	Joshi	+91-9876551017	FEMALE	2014-06-18 00:57:12.168	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911251	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.741	2026-01-31 21:07:31.741	\N
5b7ce11c-ce1a-47fb-96c0-9693c4d05f22	SPS002S0019	SCHOOL	student19@sps002.edu	$2b$10$igX0U935DwVH5BjcKzFlwOuSOKn/aZbdfngveYtExShxoTJ.nJeiq	Vishal	Verma	+91-9876551018	MALE	2011-04-29 07:46:35.687	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911252	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.834	2026-01-31 21:07:31.834	\N
01db91ad-09c5-4fb6-9af0-0cbb6e8da161	SPS002S0020	SCHOOL	student20@sps002.edu	$2b$10$K53kw1CsBDW6dHYrfEfZ1uec8osMCCc5X30NtHlNNHRhK1uYOvr1q	Pooja	Yadav	+91-9876551019	FEMALE	2013-05-29 06:50:59.697	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911253	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:31.928	2026-01-31 21:07:31.928	\N
30b04009-a242-43fd-a6e0-4a238ff1c533	SPS002S0021	SCHOOL	student21@sps002.edu	$2b$10$b3OBYtoYdnHkgVIKD09nCuMj6fdfDPNViqazHhT243IsRsUGLVtPa	Arjun	Kumar	+91-9876551020	MALE	2011-12-14 20:06:04.144	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911254	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:32.022	2026-01-31 21:07:32.022	\N
5deab24a-a342-4d31-b98a-b900070f73fd	SPS002S0022	SCHOOL	student22@sps002.edu	$2b$10$vVsIZWBxjc8RCDMnNq867.ldPwlVk4gRdUGUVbcgfbYZNHZTgCpG.	Sita	Sharma	+91-9876551021	FEMALE	2011-06-02 10:21:38.915	{"456 Learning Avenue","Sunshine Town","State - 123457"}	5678911255	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:32.118	2026-01-31 21:07:32.118	\N
5c9de88a-f3bc-42fc-9edd-0945e50b4f9e	SPS002ST0001	SCHOOL	staff1@sps002.edu	$2b$10$5t6TuI6HhhANO5zd7vSE6uT4yKsLbjjXaLDd91N6PQA1l5kXIhHce	Ramesh	Yadav	+91-9876580000	MALE	1985-06-13 09:44:12.668	{"456 Learning Avenue","Sunshine Town","State - 123457"}	\N	\N	\N	625018d7-cf94-4043-b6dc-da823bb1e629	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:32.208	2026-01-31 21:07:32.208	\N
c7404c44-4cc6-4c8b-af2e-e88c30c6e153	SPS002ST0002	SCHOOL	staff2@sps002.edu	$2b$10$KZSKxktTyPb16g2UvwsIzOR7.6PbdY8fHYSJZDtI0aaK6TleOMygC	Sunita	Devi	+91-9876580001	FEMALE	1992-07-11 08:01:47.444	{"456 Learning Avenue","Sunshine Town","State - 123457"}	\N	\N	\N	625018d7-cf94-4043-b6dc-da823bb1e629	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:32.297	2026-01-31 21:07:32.297	\N
c5f92e8f-b469-40e0-b07d-d4bfd559f015	SPS002ST0003	SCHOOL	staff3@sps002.edu	$2b$10$ycWaLvjrOYlThATKiHZd6ueMXPTfJ5ABPEL9Qeb0CncF5v46ajUwq	Mohan	Sharma	+91-9876580002	MALE	1986-04-01 12:33:06.765	{"456 Learning Avenue","Sunshine Town","State - 123457"}	\N	\N	\N	625018d7-cf94-4043-b6dc-da823bb1e629	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-01-31 21:07:32.387	2026-01-31 21:07:32.387	\N
4ee74e6e-9f84-4036-9502-4927b4a4595c	BFA003A0001	SCHOOL	admin@bfa003.edu	$2b$10$SGdKSKf.cC6WhGASnfSHOuWSrVZIUVklJJbf2gPQNXIeHpcOEzUzK	BFA003	Admin	+91-9876543230	MALE	1985-01-01 00:00:00	{"789 Knowledge Road","Bright City","State - 123458"}	\N	\N	\N	f8c53c7c-72ae-4cc9-b99a-f633213aae54	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	\N	2026-01-31 21:07:32.476	2026-01-31 21:07:32.476	\N
0bbad251-9dca-4715-b112-70809267e1d4	BFA003T0001	SCHOOL	teacher1@bfa003.edu	$2b$10$Bu8hyEWBVPbGsRZvOe2n..5gUfK4/Zr.n35DcX2z8uxzk6eMo8x/2	Rajesh	Kumar	+91-9876540200	MALE	1982-12-09 20:26:18.359	{"789 Knowledge Road","Bright City","State - 123458"}	1234569890	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:32.568	2026-01-31 21:07:32.568	\N
efeba828-5ea6-4ff4-99c9-1d10c2722a51	BFA003T0002	SCHOOL	teacher2@bfa003.edu	$2b$10$UX7VtTEMXsVfv8w/nXj.1O0YuoEt.Jvfexs6MXzwSJv/RnOqHUhka	Priya	Sharma	+91-9876540201	FEMALE	1991-02-24 21:45:10.937	{"789 Knowledge Road","Bright City","State - 123458"}	1234569891	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:32.667	2026-01-31 21:07:32.667	\N
57890447-8a02-49f2-8293-ea0a92fe6882	BFA003T0003	SCHOOL	teacher3@bfa003.edu	$2b$10$QkrCCVs60W/b6RVqfQRGwukCi2eNut7q/UmKHYfuqQnDlKy5hR37i	Amit	Patel	+91-9876540202	MALE	1989-05-19 19:04:50.222	{"789 Knowledge Road","Bright City","State - 123458"}	1234569892	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:32.759	2026-01-31 21:07:32.759	\N
3070175f-3f01-474f-a12c-22ad093a38f9	BFA003T0004	SCHOOL	teacher4@bfa003.edu	$2b$10$H3fJnxfussXShYRfBJ2L4.1F6/qQ4kthZRQ1Tvd7OOdzIuuyiPnyW	Sneha	Singh	+91-9876540203	FEMALE	1986-12-17 17:43:58.361	{"789 Knowledge Road","Bright City","State - 123458"}	1234569893	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:32.849	2026-01-31 21:07:32.849	\N
d7ed0d7d-e2f1-44b8-833a-901dc022046a	BFA003T0005	SCHOOL	teacher5@bfa003.edu	$2b$10$nwMTswX6an1g4DW0qX6Q8upulZiORHF/MMyDEEXi1FRHyMSk2ctxK	Vikram	Reddy	+91-9876540204	MALE	1984-11-02 16:22:50.728	{"789 Knowledge Road","Bright City","State - 123458"}	1234569894	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:32.94	2026-01-31 21:07:32.94	\N
4ccc50c5-f309-4061-bf3e-264810ba2cd4	BFA003T0006	SCHOOL	teacher6@bfa003.edu	$2b$10$vYKfh0GrpalhcIBnr.dTzeY/anUDTAdjWsy.7ix66rk/t/ZUlc9L.	Anjali	Gupta	+91-9876540205	FEMALE	1992-05-24 20:26:25.612	{"789 Knowledge Road","Bright City","State - 123458"}	1234569895	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.034	2026-01-31 21:07:33.034	\N
29ad7f4e-e798-4bc1-9053-96686087da16	BFA003T0007	SCHOOL	teacher7@bfa003.edu	$2b$10$tSHaO9PQR4AmPPYoJyEfbuF89JcGipcRNInVjhIVsWmX4FVuISGUS	Rahul	Mehta	+91-9876540206	MALE	1987-05-13 18:35:21.215	{"789 Knowledge Road","Bright City","State - 123458"}	1234569896	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.133	2026-01-31 21:07:33.133	\N
bf8d0a41-edef-4917-8a7c-37c4fd8f26bb	BFA003S0001	SCHOOL	student1@bfa003.edu	$2b$10$1Ozd509kuQ0bc.KEJVBYjOb6omb9GN2/rhts1P6DE6VMkdV4wlj56	Arjun	Kumar	+91-9876552000	MALE	2011-08-29 02:14:02.491	{"789 Knowledge Road","Bright City","State - 123458"}	5678921234	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.234	2026-01-31 21:07:33.234	\N
e44926dc-1879-4111-8db1-bb66a1f30281	BFA003S0002	SCHOOL	student2@bfa003.edu	$2b$10$jhaO1OUIgg8bB5adJohZXOTiDSIDDfu6n5fQ3bvGN0gOlu8r9fa4G	Sita	Sharma	+91-9876552001	FEMALE	2012-09-05 11:32:57.226	{"789 Knowledge Road","Bright City","State - 123458"}	5678921235	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.327	2026-01-31 21:07:33.327	\N
6a3e0aed-9726-4af7-9511-d81dc1deb671	BFA003S0003	SCHOOL	student3@bfa003.edu	$2b$10$QVgFQtW6iHm6CCTRKOwIWeC/HHi2W0SR4iq6zwZzcxTEw.Wot0Ebi	Krishna	Patel	+91-9876552002	MALE	2014-03-08 19:38:13.08	{"789 Knowledge Road","Bright City","State - 123458"}	5678921236	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.432	2026-01-31 21:07:33.432	\N
d921d166-1c6a-4340-b74e-73b969d90c04	BFA003S0004	SCHOOL	student4@bfa003.edu	$2b$10$CNa2jA3vtpfuq8bgbKCGa.j07D8yAj0FPnwOJF9DX5nBKv/FhbYom	Radha	Singh	+91-9876552003	FEMALE	2011-05-10 02:29:36.155	{"789 Knowledge Road","Bright City","State - 123458"}	5678921237	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.529	2026-01-31 21:07:33.529	\N
7604f074-20bd-4a5d-862c-6b20efded7cc	BFA003S0005	SCHOOL	student5@bfa003.edu	$2b$10$1Qvq8iJoZfAfWvo86.qhn.eZlluzmUEvoRcM1plRBy4y4rnp1ZqWm	Ravi	Reddy	+91-9876552004	MALE	2011-06-28 00:33:56.321	{"789 Knowledge Road","Bright City","State - 123458"}	5678921238	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.626	2026-01-31 21:07:33.626	\N
b69e71f9-3ff3-44aa-8642-33db88c858b1	BFA003S0006	SCHOOL	student6@bfa003.edu	$2b$10$/i/pBxhCDw8MZubdT7XEuOiHiiGLmcRY3HP4jLMxClJKtZMdLok4K	Meera	Gupta	+91-9876552005	FEMALE	2013-12-05 20:04:58.982	{"789 Knowledge Road","Bright City","State - 123458"}	5678921239	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.724	2026-01-31 21:07:33.724	\N
48786a4b-2515-45f3-ade9-2138f8f1bc89	BFA003S0007	SCHOOL	student7@bfa003.edu	$2b$10$60fDUZcNXpCE5WXBrEFqbu5cDBmBjdm4n7eJQizNaTxvxLdWsp3KK	Sohan	Mehta	+91-9876552006	MALE	2012-11-05 04:24:57.276	{"789 Knowledge Road","Bright City","State - 123458"}	5678921240	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.82	2026-01-31 21:07:33.82	\N
ef593a77-cc85-410b-9ac0-ab5a8131742e	BFA003S0008	SCHOOL	student8@bfa003.edu	$2b$10$sLi7Kp119EBIVg5u4mUOxOhmQNNQdK/zOLWF6IgnIR0JUk9533Jk2	Lakshmi	Joshi	+91-9876552007	FEMALE	2014-09-24 03:08:00.471	{"789 Knowledge Road","Bright City","State - 123458"}	5678921241	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:33.916	2026-01-31 21:07:33.916	\N
64e30dd1-39da-4b8e-a184-8bf776638b66	BFA003S0009	SCHOOL	student9@bfa003.edu	$2b$10$nwOYz7YuVz/gstP7WauZOu5r61Vx9wRJI3rO8eAHynlZ0rhDfi76a	Vishal	Verma	+91-9876552008	MALE	2012-02-09 21:06:43.158	{"789 Knowledge Road","Bright City","State - 123458"}	5678921242	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.013	2026-01-31 21:07:34.013	\N
45a8ba58-a702-45c9-b181-6f91ab6c40a9	BFA003S0010	SCHOOL	student10@bfa003.edu	$2b$10$cG5cjFstLcBR4/qcUtUDgem5ySQM19WHcaFAzYauofehJytZ73R/O	Pooja	Yadav	+91-9876552009	FEMALE	2012-02-01 00:51:32.565	{"789 Knowledge Road","Bright City","State - 123458"}	5678921243	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.114	2026-01-31 21:07:34.114	\N
8b89bdec-e1b7-40b5-8ecc-d0dd83692b83	BFA003S0011	SCHOOL	student11@bfa003.edu	$2b$10$QMLPE.cpeK7iuJR2bGLVTOCyuXf3TqnB0nOk1gYfGURSMZn6z09YK	Arjun	Kumar	+91-9876552010	MALE	2014-09-05 13:45:08.09	{"789 Knowledge Road","Bright City","State - 123458"}	5678921244	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.215	2026-01-31 21:07:34.215	\N
838a8655-5f7c-4e1a-81d8-55a897328741	BFA003S0012	SCHOOL	student12@bfa003.edu	$2b$10$n9jn7MGq.9eSGlWjsnP5YOMqxGuMe8OeeqFtWydfefCLsiwgey.1u	Sita	Sharma	+91-9876552011	FEMALE	2011-07-15 05:46:42.931	{"789 Knowledge Road","Bright City","State - 123458"}	5678921245	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.314	2026-01-31 21:07:34.314	\N
a41e5329-c828-420a-9e3c-8d7713b33e29	BFA003S0013	SCHOOL	student13@bfa003.edu	$2b$10$Kc780bjHL867avJockeRBOk81AlQWhwvwqJhHfcFQaydxjmC4boIW	Krishna	Patel	+91-9876552012	MALE	2011-08-23 13:41:48.29	{"789 Knowledge Road","Bright City","State - 123458"}	5678921246	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.411	2026-01-31 21:07:34.411	\N
58596aae-9a88-4c44-9218-b36f600a6679	BFA003S0014	SCHOOL	student14@bfa003.edu	$2b$10$mb9/RYEvJW9diZwkWkX5auzVsloI4AKDfPBOM.iVWR7g/lCyvLoZK	Radha	Singh	+91-9876552013	FEMALE	2014-04-21 15:39:13.579	{"789 Knowledge Road","Bright City","State - 123458"}	5678921247	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.504	2026-01-31 21:07:34.504	\N
e6d78574-b683-4825-8ff2-c7b458004c6d	BFA003S0015	SCHOOL	student15@bfa003.edu	$2b$10$UdzA5VlzRMGVi7vTwIXoXe5f9oFoFUJ2K2pZmKSjv4aG5MPeLP1S6	Ravi	Reddy	+91-9876552014	MALE	2014-07-03 23:18:38.269	{"789 Knowledge Road","Bright City","State - 123458"}	5678921248	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.596	2026-01-31 21:07:34.596	\N
21f23385-0230-4170-96dc-8945f397030b	BFA003S0016	SCHOOL	student16@bfa003.edu	$2b$10$w0LaGRNJFUkgIUH6IZMKg.JENij3i7hIWzqdYrcHALKZwMplpM33K	Meera	Gupta	+91-9876552015	FEMALE	2010-03-01 07:04:45.786	{"789 Knowledge Road","Bright City","State - 123458"}	5678921249	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.698	2026-01-31 21:07:34.698	\N
2de7165d-c0f7-4538-9de9-dc59f25006b1	BFA003S0017	SCHOOL	student17@bfa003.edu	$2b$10$MlDqvDO1iN3lnHPPSvg8J.9sC9XfIGUSOwA5ICJSWDo7zo8CtkYs.	Sohan	Mehta	+91-9876552016	MALE	2011-12-23 13:50:11.396	{"789 Knowledge Road","Bright City","State - 123458"}	5678921250	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.79	2026-01-31 21:07:34.79	\N
d0c8151d-b231-43ad-88b3-01bba8338bae	BFA003S0018	SCHOOL	student18@bfa003.edu	$2b$10$IglNEY5XJNM.GS4SxBTB/e3IhvPVQm1DGiQVMndZZi5mTZAXa7cBa	Lakshmi	Joshi	+91-9876552017	FEMALE	2013-05-31 11:05:36.338	{"789 Knowledge Road","Bright City","State - 123458"}	5678921251	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.882	2026-01-31 21:07:34.882	\N
1620d4fa-643a-4599-9416-86d41c958e4c	BFA003S0019	SCHOOL	student19@bfa003.edu	$2b$10$fss8wf2FyV.xBjNdCEwAM.vhN7K2b./7IWTu6wk0EDIVaqmYBeG1a	Vishal	Verma	+91-9876552018	MALE	2012-09-20 01:51:26.406	{"789 Knowledge Road","Bright City","State - 123458"}	5678921252	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:34.974	2026-01-31 21:07:34.974	\N
01705328-77b9-4769-ae3a-c42a8b5d2102	BFA003S0020	SCHOOL	student20@bfa003.edu	$2b$10$b1m51u9zwQSYv6bBBDHNiODL3ZxBEwCVx3iyP7m1gBO/DApSEd3C.	Pooja	Yadav	+91-9876552019	FEMALE	2011-04-12 22:03:33.949	{"789 Knowledge Road","Bright City","State - 123458"}	5678921253	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.067	2026-01-31 21:07:35.067	\N
c65ac420-c59a-4205-aeec-20b0e4b7d458	BFA003S0021	SCHOOL	student21@bfa003.edu	$2b$10$HTVTUluuj77coTUYJpwKl.yPARLD60FUdghs/ubqGIqkVpWPJ3aFu	Arjun	Kumar	+91-9876552020	MALE	2011-11-20 17:44:15.892	{"789 Knowledge Road","Bright City","State - 123458"}	5678921254	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.157	2026-01-31 21:07:35.157	\N
57a5828f-b710-4192-97d2-6b16f499e754	BFA003S0022	SCHOOL	student22@bfa003.edu	$2b$10$jOXd0jZoWu9alHIYKZNAWOCwBXPgbkbo4i9LFqj/EfPr6.j27gux2	Sita	Sharma	+91-9876552021	FEMALE	2012-01-11 03:11:54.589	{"789 Knowledge Road","Bright City","State - 123458"}	5678921255	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.249	2026-01-31 21:07:35.249	\N
f3d4830f-ecc8-4e8f-9dd1-5803e5ea3056	BFA003S0023	SCHOOL	student23@bfa003.edu	$2b$10$UrGGgLRpY412ZcgwDrbPveh6cAb4fGUq72JIqpeCQh2x1boThrE7S	Krishna	Patel	+91-9876552022	MALE	2012-02-01 15:16:33.063	{"789 Knowledge Road","Bright City","State - 123458"}	5678921256	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.342	2026-01-31 21:07:35.342	\N
48d46601-8536-4584-9015-a61f212b6c99	BFA003S0024	SCHOOL	student24@bfa003.edu	$2b$10$c7PkELcCk7sLa6SO85gkmeJNhfhMaVETU4kQFiSgDLuuVXvBLs4ri	Radha	Singh	+91-9876552023	FEMALE	2014-04-28 11:22:05.192	{"789 Knowledge Road","Bright City","State - 123458"}	5678921257	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.436	2026-01-31 21:07:35.436	\N
52fed973-7f46-4b3c-a1ea-9c795b265100	BFA003S0025	SCHOOL	student25@bfa003.edu	$2b$10$ObGC8WWEMzIBJmvP1PUy9OBGmNyACFvgvQi3vrRlYOTV7bNbPb3Oa	Ravi	Reddy	+91-9876552024	MALE	2013-03-15 20:52:00.058	{"789 Knowledge Road","Bright City","State - 123458"}	5678921258	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.531	2026-01-31 21:07:35.531	\N
1d448a82-b7b2-4f4a-9cce-2ee145490bf3	BFA003S0026	SCHOOL	student26@bfa003.edu	$2b$10$vJIqt9vmjaOreM0y7C12tel5wah7AK3umg6jskueUNN9ZPbCHKngq	Meera	Gupta	+91-9876552025	FEMALE	2011-01-03 11:56:05.083	{"789 Knowledge Road","Bright City","State - 123458"}	5678921259	\N	\N	8a6428cc-58da-4f25-bdc5-c0889e6a2c77	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.622	2026-01-31 21:07:35.622	\N
1aa0de56-2baa-4459-8796-7018b987176e	BFA003ST0001	SCHOOL	staff1@bfa003.edu	$2b$10$OhCH7n/fFhW27BAzgZx4wOWnbuD7gpKK/37BYg.KkPnvkSGGjwHry	Ramesh	Yadav	+91-9876580000	MALE	1994-07-07 16:31:46.938	{"789 Knowledge Road","Bright City","State - 123458"}	\N	\N	\N	625018d7-cf94-4043-b6dc-da823bb1e629	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.712	2026-01-31 21:07:35.712	\N
88e0b88a-c770-4988-bb24-8dff2c77f4c6	BFA003ST0002	SCHOOL	staff2@bfa003.edu	$2b$10$gYQ8WUnbf2JfbDLj1jmWUu5RLKbhZCRe.hi.SJOW9cg0Z8GqBTxHe	Sunita	Devi	+91-9876580001	FEMALE	1992-11-09 08:56:50.03	{"789 Knowledge Road","Bright City","State - 123458"}	\N	\N	\N	625018d7-cf94-4043-b6dc-da823bb1e629	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-01-31 21:07:35.802	2026-01-31 21:07:35.802	\N
59799d3f-9973-473d-b0ef-77601d49fdc9	SPS002T0006	SCHOOL	teacher6@sps002.edu	$2b$10$r8p6p6oFzzL6wputiBjkwOaqLvM3DMvVqP0yVo6pwHoefsFpU70ye	Anjali	Gupta	+91-9876540105	FEMALE	1987-12-20 10:32:11.327	{"456 Learning Avenue","Sunshine Town","State - 123457"}	1234568895	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:02.787	2026-02-01 06:31:02.787	\N
f5a138a5-96dc-4e75-b08a-d84f60851509	SPS002T0007	SCHOOL	teacher7@sps002.edu	$2b$10$I59poeJOjQt1smKkHylK5uAv.QnGcluYBz3hd7Sb0WJ.FXpF8HOP.	Rahul	Mehta	+91-9876540106	MALE	1984-05-24 01:07:21.312	{"456 Learning Avenue","Sunshine Town","State - 123457"}	1234568896	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:02.948	2026-02-01 06:31:02.948	\N
b6f90a52-a500-46c6-a3f4-96c654703ff6	GIS001T0008	SCHOOL	teacher8@gis001.edu	$2b$10$zOOhggFZcQiJRru9basoyuuOH1HgoD3IRDIeidkppS5JZhDA7Iry.	Kavita	Joshi	+91-9876540007	FEMALE	1981-12-04 23:25:42.193	{"123 Education Street","Greenwood City","State - 123456"}	1234567897	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	ae89b1e8-7f9c-41ee-9562-98534b17d8b5	\N	d858d9d6-a314-4a6c-9e95-fc49e0c964e3	\N	\N	2026-02-01 06:31:49.328	2026-02-01 06:31:49.328	\N
f174ccb9-7b89-4dc3-bd33-6e4afab70369	SPS002T0008	SCHOOL	teacher8@sps002.edu	$2b$10$0z26odgfZHb9hIECQ4Cy8.JDRdDUTLpFBpf.O/gKv5KIorCECtgOa	Kavita	Joshi	+91-9876540107	FEMALE	1987-05-05 22:51:58.59	{"456 Learning Avenue","Sunshine Town","State - 123457"}	1234568897	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3a8d3873-81bc-4b79-ad76-5e335848ded1	\N	8cd8e109-d8b7-43dd-8863-feba4f470fe6	\N	\N	2026-02-01 06:31:49.603	2026-02-01 06:31:49.603	\N
5021ffd5-15c5-4377-b372-3401fd2694bd	BFA003T0008	SCHOOL	teacher8@bfa003.edu	$2b$10$ElZMmjw9ohnJPGItAkVrv.Hmz/ttvWdpkWqDAfk5g7Mfk3NIQp8Fy	Kavita	Joshi	+91-9876540207	FEMALE	1982-10-04 06:36:05.811	{"789 Knowledge Road","Bright City","State - 123458"}	1234569897	\N	\N	05dc2965-6ea6-4b33-8fe0-2ece6324601b	3d2e99ba-17dc-4d2a-b6fb-7fc1485396bc	\N	4ee74e6e-9f84-4036-9502-4927b4a4595c	\N	\N	2026-02-01 06:31:49.77	2026-02-01 06:31:49.77	\N
f0188176-8c0b-4a09-a4e7-6d1781e410a5	ADMIN001	APP	admin@schooliat.com	$2b$10$H.ASWXYvFZuGYW1dZZwJCOXIXH99TnbONJINIz7ajrI33V5ErlHL6	App	Admin User	0000000000	MALE	1990-01-01 00:00:00	{}	\N	asdads	\N	bec6a1ac-c18e-4132-8463-6a20e41bc682	\N	\N	system	\N	\N	2026-01-31 20:59:51.935	2026-02-01 07:07:59.364	\N
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: schooliat_user
--

COPY public.vendors (id, name, email, contact, address, status, comments, region_id, employee_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
38b4bb59-59e4-4d8b-a497-d2b278c947f6	ABC Stationery Supplies	contact@abcstationery.com	+91-9876544001	{"123 Supply Street",City}	CONVERTED	Regular supplier of stationery items	a754acd7-f709-4bfa-8cac-26f578ecdec6	1670a10d-e7b4-49e2-bf75-21fcf4949a20	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	\N	2026-01-31 21:07:38.31	2026-01-31 21:07:38.31	\N
ca6dc1bf-2e61-437b-a5c3-8f9f15add4df	XYZ Uniform Manufacturers	info@xyzuniforms.com	+91-9876544002	{"456 Uniform Road",City}	HOT	Potential supplier for school uniforms	422678a5-580e-4a31-b685-890a810d5fa7	88520431-09aa-4e37-bf9e-912c8060c79f	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	\N	2026-01-31 21:07:38.313	2026-01-31 21:07:38.313	\N
7ae71d7f-697c-4d65-96db-aac2ed1ff33b	Tech Solutions Pvt Ltd	sales@techsolutions.com	+91-9876544003	{"789 Tech Avenue",City}	FOLLOW_UP	IT equipment supplier	89581564-f003-4808-a73b-733145506bd3	791098c9-a03a-470c-9b30-8852019eeb59	f0188176-8c0b-4a09-a4e7-6d1781e410a5	\N	\N	2026-01-31 21:07:38.317	2026-01-31 21:07:38.317	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: attendance_periods attendance_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.attendance_periods
    ADD CONSTRAINT attendance_periods_pkey PRIMARY KEY (id);


--
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: exam_calendar_items exam_calendar_items_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.exam_calendar_items
    ADD CONSTRAINT exam_calendar_items_pkey PRIMARY KEY (id);


--
-- Name: exam_calendar exam_calendar_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.exam_calendar
    ADD CONSTRAINT exam_calendar_pkey PRIMARY KEY (id);


--
-- Name: exams exams_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);


--
-- Name: fee_installments fee_installments_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.fee_installments
    ADD CONSTRAINT fee_installments_pkey PRIMARY KEY (id);


--
-- Name: fees fees_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.fees
    ADD CONSTRAINT fees_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: grievance_comments grievance_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.grievance_comments
    ADD CONSTRAINT grievance_comments_pkey PRIMARY KEY (id);


--
-- Name: grievances grievances_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT grievances_pkey PRIMARY KEY (id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: homework_submissions homework_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_pkey PRIMARY KEY (id);


--
-- Name: homeworks homeworks_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_pkey PRIMARY KEY (id);


--
-- Name: id_card_collections id_card_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.id_card_collections
    ADD CONSTRAINT id_card_collections_pkey PRIMARY KEY (id);


--
-- Name: id_card_configs id_card_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.id_card_configs
    ADD CONSTRAINT id_card_configs_pkey PRIMARY KEY (id);


--
-- Name: id_cards id_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.id_cards
    ADD CONSTRAINT id_cards_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: licenses licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: marks marks_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.marks
    ADD CONSTRAINT marks_pkey PRIMARY KEY (id);


--
-- Name: mcq_answers mcq_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.mcq_answers
    ADD CONSTRAINT mcq_answers_pkey PRIMARY KEY (id);


--
-- Name: mcq_questions mcq_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.mcq_questions
    ADD CONSTRAINT mcq_questions_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notices notices_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: otps otps_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT otps_pkey PRIMARY KEY (id);


--
-- Name: parent_child_links parent_child_links_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.parent_child_links
    ADD CONSTRAINT parent_child_links_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: receipts receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: results results_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: salaries salaries_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.salaries
    ADD CONSTRAINT salaries_pkey PRIMARY KEY (id);


--
-- Name: salary_payments salary_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.salary_payments
    ADD CONSTRAINT salary_payments_pkey PRIMARY KEY (id);


--
-- Name: salary_structure_components salary_structure_components_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.salary_structure_components
    ADD CONSTRAINT salary_structure_components_pkey PRIMARY KEY (id);


--
-- Name: salary_structures salary_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_pkey PRIMARY KEY (id);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: teacher_profiles teacher_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: timetable_slots timetable_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_pkey PRIMARY KEY (id);


--
-- Name: timetables timetables_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_pkey PRIMARY KEY (id);


--
-- Name: transports transports_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.transports
    ADD CONSTRAINT transports_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: attendance_class_id_date_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX attendance_class_id_date_deleted_at_idx ON public.attendances USING btree (class_id, date, deleted_at);


--
-- Name: attendance_marked_by_date_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX attendance_marked_by_date_deleted_at_idx ON public.attendances USING btree (marked_by, date, deleted_at);


--
-- Name: attendance_periods_name_school_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX attendance_periods_name_school_id_key ON public.attendance_periods USING btree (name, school_id);


--
-- Name: attendance_periods_school_id_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX attendance_periods_school_id_deleted_at_idx ON public.attendance_periods USING btree (school_id, deleted_at);


--
-- Name: attendance_school_id_date_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX attendance_school_id_date_deleted_at_idx ON public.attendances USING btree (school_id, date, deleted_at);


--
-- Name: attendance_student_id_date_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX attendance_student_id_date_deleted_at_idx ON public.attendances USING btree (student_id, date, deleted_at);


--
-- Name: attendances_student_id_class_id_date_period_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX attendances_student_id_class_id_date_period_id_key ON public.attendances USING btree (student_id, class_id, date, period_id);


--
-- Name: audit_logs_action_timestamp_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX audit_logs_action_timestamp_idx ON public.audit_logs USING btree (action, "timestamp");


--
-- Name: audit_logs_entity_timestamp_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX audit_logs_entity_timestamp_idx ON public.audit_logs USING btree (entity_type, entity_id, "timestamp");


--
-- Name: audit_logs_user_timestamp_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX audit_logs_user_timestamp_idx ON public.audit_logs USING btree (user_id, "timestamp");


--
-- Name: classes_grade_division_school_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX classes_grade_division_school_id_key ON public.classes USING btree (grade, division, school_id);


--
-- Name: conversations_school_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX conversations_school_deleted_at_idx ON public.conversations USING btree (school_id, deleted_at);


--
-- Name: exams_school_year_type_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX exams_school_year_type_idx ON public.exams USING btree (school_id, year, type);


--
-- Name: fee_installments_school_id_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX fee_installments_school_id_deleted_at_idx ON public.fee_installments USING btree (school_id, deleted_at);


--
-- Name: fee_installments_school_installment_status_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX fee_installments_school_installment_status_idx ON public.fee_installments USING btree (school_id, installement_number, payment_status, deleted_at);


--
-- Name: fee_installments_student_id_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX fee_installments_student_id_deleted_at_idx ON public.fee_installments USING btree (student_id, deleted_at);


--
-- Name: homework_submissions_homework_id_student_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX homework_submissions_homework_id_student_id_key ON public.homework_submissions USING btree (homework_id, student_id);


--
-- Name: homework_submissions_homework_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX homework_submissions_homework_status_deleted_at_idx ON public.homework_submissions USING btree (homework_id, status, deleted_at);


--
-- Name: homework_submissions_student_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX homework_submissions_student_deleted_at_idx ON public.homework_submissions USING btree (student_id, deleted_at);


--
-- Name: homeworks_school_due_date_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX homeworks_school_due_date_deleted_at_idx ON public.homeworks USING btree (school_id, due_date, deleted_at);


--
-- Name: homeworks_school_subject_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX homeworks_school_subject_deleted_at_idx ON public.homeworks USING btree (school_id, subject_id, deleted_at);


--
-- Name: homeworks_teacher_due_date_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX homeworks_teacher_due_date_deleted_at_idx ON public.homeworks USING btree (teacher_id, due_date, deleted_at);


--
-- Name: id_card_collections_school_id_class_id_year_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX id_card_collections_school_id_class_id_year_key ON public.id_card_collections USING btree (school_id, class_id, year);


--
-- Name: leave_balances_school_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX leave_balances_school_deleted_at_idx ON public.leave_balances USING btree (school_id, deleted_at);


--
-- Name: leave_balances_user_id_leave_type_id_year_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX leave_balances_user_id_leave_type_id_year_key ON public.leave_balances USING btree (user_id, leave_type_id, year);


--
-- Name: leave_balances_user_year_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX leave_balances_user_year_deleted_at_idx ON public.leave_balances USING btree (user_id, year, deleted_at);


--
-- Name: leave_requests_approved_by_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX leave_requests_approved_by_deleted_at_idx ON public.leave_requests USING btree (approved_by, deleted_at);


--
-- Name: leave_requests_school_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX leave_requests_school_status_deleted_at_idx ON public.leave_requests USING btree (school_id, status, deleted_at);


--
-- Name: leave_requests_user_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX leave_requests_user_status_deleted_at_idx ON public.leave_requests USING btree (user_id, status, deleted_at);


--
-- Name: leave_types_name_school_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX leave_types_name_school_id_key ON public.leave_types USING btree (name, school_id);


--
-- Name: leave_types_school_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX leave_types_school_deleted_at_idx ON public.leave_types USING btree (school_id, deleted_at);


--
-- Name: licenses_certificate_number_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX licenses_certificate_number_key ON public.licenses USING btree (certificate_number);


--
-- Name: marks_exam_id_student_id_subject_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX marks_exam_id_student_id_subject_id_key ON public.marks USING btree (exam_id, student_id, subject_id);


--
-- Name: marks_exam_student_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX marks_exam_student_deleted_at_idx ON public.marks USING btree (exam_id, student_id, deleted_at);


--
-- Name: marks_school_exam_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX marks_school_exam_deleted_at_idx ON public.marks USING btree (school_id, exam_id, deleted_at);


--
-- Name: marks_student_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX marks_student_deleted_at_idx ON public.marks USING btree (student_id, deleted_at);


--
-- Name: mcq_answers_submission_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX mcq_answers_submission_deleted_at_idx ON public.mcq_answers USING btree (submission_id, deleted_at);


--
-- Name: mcq_answers_submission_id_question_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX mcq_answers_submission_id_question_id_key ON public.mcq_answers USING btree (submission_id, question_id);


--
-- Name: mcq_questions_homework_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX mcq_questions_homework_deleted_at_idx ON public.mcq_questions USING btree (homework_id, deleted_at);


--
-- Name: messages_conversation_sent_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX messages_conversation_sent_deleted_at_idx ON public.messages USING btree (conversation_id, sent_at, deleted_at);


--
-- Name: messages_sender_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX messages_sender_deleted_at_idx ON public.messages USING btree (sender_id, deleted_at);


--
-- Name: notices_school_id_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX notices_school_id_deleted_at_idx ON public.notices USING btree (school_id, deleted_at);


--
-- Name: notices_school_id_visible_range_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX notices_school_id_visible_range_idx ON public.notices USING btree (school_id, visible_from, visible_to);


--
-- Name: notifications_school_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX notifications_school_deleted_at_idx ON public.notifications USING btree (school_id, deleted_at);


--
-- Name: notifications_user_created_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX notifications_user_created_deleted_at_idx ON public.notifications USING btree (user_id, created_at, deleted_at);


--
-- Name: notifications_user_read_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX notifications_user_read_deleted_at_idx ON public.notifications USING btree (user_id, is_read, deleted_at);


--
-- Name: otps_email_expires_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX otps_email_expires_idx ON public.otps USING btree (email, expires_at);


--
-- Name: otps_email_purpose_status_expires_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX otps_email_purpose_status_expires_idx ON public.otps USING btree (email, purpose, is_used, expires_at);


--
-- Name: parent_child_links_child_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX parent_child_links_child_deleted_at_idx ON public.parent_child_links USING btree (child_id, deleted_at);


--
-- Name: parent_child_links_parent_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX parent_child_links_parent_deleted_at_idx ON public.parent_child_links USING btree (parent_id, deleted_at);


--
-- Name: parent_child_links_parent_id_child_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX parent_child_links_parent_id_child_id_key ON public.parent_child_links USING btree (parent_id, child_id);


--
-- Name: password_reset_tokens_token_expires_used_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX password_reset_tokens_token_expires_used_idx ON public.password_reset_tokens USING btree (token, expires_at, is_used);


--
-- Name: password_reset_tokens_token_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX password_reset_tokens_token_key ON public.password_reset_tokens USING btree (token);


--
-- Name: password_reset_tokens_user_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX password_reset_tokens_user_id_key ON public.password_reset_tokens USING btree (user_id);


--
-- Name: receipts_receipt_number_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX receipts_receipt_number_key ON public.receipts USING btree (receipt_number);


--
-- Name: results_exam_id_student_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX results_exam_id_student_id_key ON public.results USING btree (exam_id, student_id);


--
-- Name: results_exam_pass_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX results_exam_pass_deleted_at_idx ON public.results USING btree (exam_id, is_pass, deleted_at);


--
-- Name: results_school_exam_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX results_school_exam_deleted_at_idx ON public.results USING btree (school_id, exam_id, deleted_at);


--
-- Name: results_student_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX results_student_deleted_at_idx ON public.results USING btree (student_id, deleted_at);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: schools_address_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX schools_address_key ON public.schools USING btree (address);


--
-- Name: schools_code_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX schools_code_key ON public.schools USING btree (code);


--
-- Name: schools_email_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX schools_email_key ON public.schools USING btree (email);


--
-- Name: schools_phone_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX schools_phone_key ON public.schools USING btree (phone);


--
-- Name: student_profiles_apaar_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX student_profiles_apaar_id_key ON public.student_profiles USING btree (apaar_id);


--
-- Name: student_profiles_user_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX student_profiles_user_id_key ON public.student_profiles USING btree (user_id);


--
-- Name: subjects_name_school_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX subjects_name_school_id_key ON public.subjects USING btree (name, school_id);


--
-- Name: teacher_profiles_user_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX teacher_profiles_user_id_key ON public.teacher_profiles USING btree (user_id);


--
-- Name: templates_type_path_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX templates_type_path_key ON public.templates USING btree (type, path);


--
-- Name: timetable_slots_teacher_day_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX timetable_slots_teacher_day_deleted_at_idx ON public.timetable_slots USING btree (teacher_id, day_of_week, deleted_at);


--
-- Name: timetable_slots_timetable_day_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX timetable_slots_timetable_day_deleted_at_idx ON public.timetable_slots USING btree (timetable_id, day_of_week, deleted_at);


--
-- Name: timetable_slots_timetable_id_day_of_week_period_number_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX timetable_slots_timetable_id_day_of_week_period_number_key ON public.timetable_slots USING btree (timetable_id, day_of_week, period_number);


--
-- Name: timetables_school_active_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX timetables_school_active_deleted_at_idx ON public.timetables USING btree (school_id, is_active, deleted_at);


--
-- Name: timetables_school_class_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX timetables_school_class_deleted_at_idx ON public.timetables USING btree (school_id, class_id, deleted_at);


--
-- Name: transports_license_number_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX transports_license_number_key ON public.transports USING btree (license_number);


--
-- Name: transports_vehicle_number_school_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX transports_vehicle_number_school_id_key ON public.transports USING btree (vehicle_number, school_id);


--
-- Name: users_aadhaar_id_key; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX users_aadhaar_id_key ON public.users USING btree (aadhaar_id);


--
-- Name: users_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX users_deleted_at_idx ON public.users USING btree (deleted_at);


--
-- Name: users_role_id_user_type_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX users_role_id_user_type_deleted_at_idx ON public.users USING btree (role_id, user_type, deleted_at);


--
-- Name: users_school_id_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX users_school_id_deleted_at_idx ON public.users USING btree (school_id, deleted_at);


--
-- Name: users_school_id_role_id_deleted_at_idx; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE INDEX users_school_id_role_id_deleted_at_idx ON public.users USING btree (school_id, role_id, deleted_at);


--
-- Name: users_unique_email; Type: INDEX; Schema: public; Owner: schooliat_user
--

CREATE UNIQUE INDEX users_unique_email ON public.users USING btree (email);


--
-- Name: attendances attendances_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: attendances attendances_marked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: attendances attendances_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.attendance_periods(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: attendances attendances_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: grievance_comments grievance_comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.grievance_comments
    ADD CONSTRAINT grievance_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: grievance_comments grievance_comments_grievance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.grievance_comments
    ADD CONSTRAINT grievance_comments_grievance_id_fkey FOREIGN KEY (grievance_id) REFERENCES public.grievances(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grievances grievances_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT grievances_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: grievances grievances_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT grievances_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: homework_submissions homework_submissions_homework_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_homework_id_fkey FOREIGN KEY (homework_id) REFERENCES public.homeworks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: homework_submissions homework_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: homeworks homeworks_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: homeworks homeworks_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.homeworks
    ADD CONSTRAINT homeworks_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_balances leave_balances_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_balances leave_balances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_requests leave_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: leave_requests leave_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: locations locations_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: locations locations_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: marks marks_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.marks
    ADD CONSTRAINT marks_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: marks marks_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.marks
    ADD CONSTRAINT marks_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: marks marks_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.marks
    ADD CONSTRAINT marks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: marks marks_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.marks
    ADD CONSTRAINT marks_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: mcq_answers mcq_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.mcq_answers
    ADD CONSTRAINT mcq_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.mcq_questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mcq_answers mcq_answers_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.mcq_answers
    ADD CONSTRAINT mcq_answers_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.homework_submissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mcq_questions mcq_questions_homework_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.mcq_questions
    ADD CONSTRAINT mcq_questions_homework_id_fkey FOREIGN KEY (homework_id) REFERENCES public.homeworks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: parent_child_links parent_child_links_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.parent_child_links
    ADD CONSTRAINT parent_child_links_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: parent_child_links parent_child_links_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.parent_child_links
    ADD CONSTRAINT parent_child_links_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: receipts receipts_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: results results_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: results results_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: results results_published_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_published_by_fkey FOREIGN KEY (published_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: results results_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_profiles student_profiles_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_profiles student_profiles_transport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_transport_id_fkey FOREIGN KEY (transport_id) REFERENCES public.transports(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_profiles teacher_profiles_transport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_transport_id_fkey FOREIGN KEY (transport_id) REFERENCES public.transports(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teacher_profiles teacher_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.teacher_profiles
    ADD CONSTRAINT teacher_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timetable_slots timetable_slots_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: timetable_slots timetable_slots_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: timetable_slots timetable_slots_timetable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_timetable_id_fkey FOREIGN KEY (timetable_id) REFERENCES public.timetables(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timetables timetables_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.timetables
    ADD CONSTRAINT timetables_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_assigned_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_assigned_region_id_fkey FOREIGN KEY (assigned_region_id) REFERENCES public.regions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vendors vendors_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vendors vendors_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: schooliat_user
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict c8nZKfHsyk15DEccHYpfOmhYrx0eWsVbhhMnHaEfeHN0gzqlWgS9MNwIxM6YKi8

