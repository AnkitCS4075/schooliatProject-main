-- Add Permission enum values that exist in schema but were missing from init migration.
-- Production-safe: each value is added only if not present.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'MARK_ATTENDANCE') THEN
    ALTER TYPE "permission" ADD VALUE 'MARK_ATTENDANCE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_ATTENDANCE') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_ATTENDANCE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'EXPORT_ATTENDANCE') THEN
    ALTER TYPE "permission" ADD VALUE 'EXPORT_ATTENDANCE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'CREATE_TIMETABLE') THEN
    ALTER TYPE "permission" ADD VALUE 'CREATE_TIMETABLE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_TIMETABLE') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_TIMETABLE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'EDIT_TIMETABLE') THEN
    ALTER TYPE "permission" ADD VALUE 'EDIT_TIMETABLE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'DELETE_TIMETABLE') THEN
    ALTER TYPE "permission" ADD VALUE 'DELETE_TIMETABLE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'CREATE_HOMEWORK') THEN
    ALTER TYPE "permission" ADD VALUE 'CREATE_HOMEWORK';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_HOMEWORK') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_HOMEWORK';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'EDIT_HOMEWORK') THEN
    ALTER TYPE "permission" ADD VALUE 'EDIT_HOMEWORK';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'DELETE_HOMEWORK') THEN
    ALTER TYPE "permission" ADD VALUE 'DELETE_HOMEWORK';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'SUBMIT_HOMEWORK') THEN
    ALTER TYPE "permission" ADD VALUE 'SUBMIT_HOMEWORK';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GRADE_HOMEWORK') THEN
    ALTER TYPE "permission" ADD VALUE 'GRADE_HOMEWORK';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'ENTER_MARKS') THEN
    ALTER TYPE "permission" ADD VALUE 'ENTER_MARKS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_MARKS') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_MARKS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'EDIT_MARKS') THEN
    ALTER TYPE "permission" ADD VALUE 'EDIT_MARKS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'PUBLISH_RESULTS') THEN
    ALTER TYPE "permission" ADD VALUE 'PUBLISH_RESULTS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_RESULTS') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_RESULTS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'CREATE_LEAVE_REQUEST') THEN
    ALTER TYPE "permission" ADD VALUE 'CREATE_LEAVE_REQUEST';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_LEAVE_REQUESTS') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_LEAVE_REQUESTS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'APPROVE_LEAVE') THEN
    ALTER TYPE "permission" ADD VALUE 'APPROVE_LEAVE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'REJECT_LEAVE') THEN
    ALTER TYPE "permission" ADD VALUE 'REJECT_LEAVE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'SEND_MESSAGE') THEN
    ALTER TYPE "permission" ADD VALUE 'SEND_MESSAGE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_MESSAGES') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_MESSAGES';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'CREATE_ANNOUNCEMENT') THEN
    ALTER TYPE "permission" ADD VALUE 'CREATE_ANNOUNCEMENT';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'SEND_NOTIFICATION') THEN
    ALTER TYPE "permission" ADD VALUE 'SEND_NOTIFICATION';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'CREATE_NOTE') THEN
    ALTER TYPE "permission" ADD VALUE 'CREATE_NOTE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'EDIT_NOTE') THEN
    ALTER TYPE "permission" ADD VALUE 'EDIT_NOTE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_NOTES') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_NOTES';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'DELETE_NOTE') THEN
    ALTER TYPE "permission" ADD VALUE 'DELETE_NOTE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'CREATE_SYLLABUS') THEN
    ALTER TYPE "permission" ADD VALUE 'CREATE_SYLLABUS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'EDIT_SYLLABUS') THEN
    ALTER TYPE "permission" ADD VALUE 'EDIT_SYLLABUS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_SYLLABUS') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_SYLLABUS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'DELETE_SYLLABUS') THEN
    ALTER TYPE "permission" ADD VALUE 'DELETE_SYLLABUS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'CREATE_CIRCULAR') THEN
    ALTER TYPE "permission" ADD VALUE 'CREATE_CIRCULAR';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'EDIT_CIRCULAR') THEN
    ALTER TYPE "permission" ADD VALUE 'EDIT_CIRCULAR';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'PUBLISH_CIRCULAR') THEN
    ALTER TYPE "permission" ADD VALUE 'PUBLISH_CIRCULAR';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_CIRCULARS') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_CIRCULARS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'DELETE_CIRCULAR') THEN
    ALTER TYPE "permission" ADD VALUE 'DELETE_CIRCULAR';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'CREATE_LIBRARY_BOOK') THEN
    ALTER TYPE "permission" ADD VALUE 'CREATE_LIBRARY_BOOK';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'EDIT_LIBRARY_BOOK') THEN
    ALTER TYPE "permission" ADD VALUE 'EDIT_LIBRARY_BOOK';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_LIBRARY_BOOKS') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_LIBRARY_BOOKS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'ISSUE_LIBRARY_BOOK') THEN
    ALTER TYPE "permission" ADD VALUE 'ISSUE_LIBRARY_BOOK';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'RETURN_LIBRARY_BOOK') THEN
    ALTER TYPE "permission" ADD VALUE 'RETURN_LIBRARY_BOOK';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'RESERVE_LIBRARY_BOOK') THEN
    ALTER TYPE "permission" ADD VALUE 'RESERVE_LIBRARY_BOOK';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_LIBRARY_HISTORY') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_LIBRARY_HISTORY';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_ATTENDANCE_REPORTS') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_ATTENDANCE_REPORTS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_FEE_ANALYTICS') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_FEE_ANALYTICS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_ACADEMIC_REPORTS') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_ACADEMIC_REPORTS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_SALARY_REPORTS') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_SALARY_REPORTS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'USE_CHATBOT') THEN
    ALTER TYPE "permission" ADD VALUE 'USE_CHATBOT';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_CHATBOT_HISTORY') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_CHATBOT_HISTORY';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'MANAGE_FAQ') THEN
    ALTER TYPE "permission" ADD VALUE 'MANAGE_FAQ';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'MANAGE_ROUTES') THEN
    ALTER TYPE "permission" ADD VALUE 'MANAGE_ROUTES';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_ROUTES') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_ROUTES';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'ASSIGN_STUDENTS_TO_ROUTE') THEN
    ALTER TYPE "permission" ADD VALUE 'ASSIGN_STUDENTS_TO_ROUTE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_CHILDREN') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_CHILDREN';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_CHILD_DATA') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_CHILD_DATA';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_CONSOLIDATED_DASHBOARD') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_CONSOLIDATED_DASHBOARD';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'VIEW_AUDIT_LOGS') THEN
    ALTER TYPE "permission" ADD VALUE 'VIEW_AUDIT_LOGS';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'REQUEST_DELETION_OTP') THEN
    ALTER TYPE "permission" ADD VALUE 'REQUEST_DELETION_OTP';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'GET_GALLERIES') THEN
    ALTER TYPE "permission" ADD VALUE 'GET_GALLERIES';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'CREATE_GALLERY') THEN
    ALTER TYPE "permission" ADD VALUE 'CREATE_GALLERY';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'EDIT_GALLERY') THEN
    ALTER TYPE "permission" ADD VALUE 'EDIT_GALLERY';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'DELETE_GALLERY') THEN
    ALTER TYPE "permission" ADD VALUE 'DELETE_GALLERY';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'UPLOAD_GALLERY_IMAGE') THEN
    ALTER TYPE "permission" ADD VALUE 'UPLOAD_GALLERY_IMAGE';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'permission' AND e.enumlabel = 'DELETE_GALLERY_IMAGE') THEN
    ALTER TYPE "permission" ADD VALUE 'DELETE_GALLERY_IMAGE';
  END IF;
END $$;
