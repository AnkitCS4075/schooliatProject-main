/** Labels must match backend `entityType` strings passed to POST /deletion-otp/request */

export const SCHOOL_DELETION_ENTITY = {
  TEACHER: "Teacher",
  STUDENT: "Student",
  STAFF: "Staff",
  CLASS: "Class",
  SUBJECT: "Subject",
  TRANSPORT: "Transport",
  TRANSPORT_ROUTE: "TransportRoute",
  CALENDAR_EVENT: "CalendarEvent",
  HOLIDAY: "Holiday",
  EXAM_CALENDAR: "ExamCalendar",
  NOTICE: "Notice",
  HOMEWORK: "Homework",
  NOTE: "Note",
  SYLLABUS: "Syllabus",
  GALLERY: "Gallery",
  GALLERY_IMAGE: "GalleryImage",
  LIBRARY_BOOK: "LibraryBook",
  TIMETABLE: "Timetable",
  CIRCULAR: "Circular",
  COURIER: "Courier",
  INVENTORY_ITEM: "InventoryItem",
  LEAVE_TYPE: "LeaveType",
  EMERGENCY_CONTACT: "EmergencyContact",
  FAQ: "FAQ",
  EXAM: "Exam",
  TRANSFER_CERTIFICATE: "TransferCertificate",
} as const;

export type SchoolDeletionEntityType =
  (typeof SCHOOL_DELETION_ENTITY)[keyof typeof SCHOOL_DELETION_ENTITY];
