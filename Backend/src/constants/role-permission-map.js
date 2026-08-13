import { Permission } from "../prisma/generated/index.js";

/**
 * Feature permission matrix: every module maps its available permission levels
 * (VIEW / CREATE / EDIT / DELETE / EXPORT / APPROVE) to the runtime `Permission`
 * enum values the platform enforces via the `withPermission` middleware.
 *
 * This map is the single source of truth for:
 *   - the `GET /custom-roles/matrix` definition served to the dashboard grid
 *   - converting a granular matrix into a flat `Permission[]` array
 *   - converting a flat `Permission[]` array back into a matrix
 */

export const PERMISSION_LEVELS = [
  "VIEW",
  "CREATE",
  "EDIT",
  "DELETE",
  "EXPORT",
  "APPROVE",
];

const P = Permission;

export const MODULE_PERMISSION_MAP = {
  STUDENTS: {
    label: "Students",
    VIEW: [P.GET_STUDENTS],
    CREATE: [P.CREATE_STUDENT],
    EDIT: [P.EDIT_STUDENT],
    DELETE: [P.DELETE_STUDENT],
  },
  TEACHERS: {
    label: "Teachers",
    VIEW: [P.GET_TEACHERS],
    CREATE: [P.CREATE_TEACHER],
    EDIT: [P.EDIT_TEACHER],
    DELETE: [P.DELETE_TEACHER],
  },
  STAFF: {
    label: "Staff",
    VIEW: [P.GET_STAFF],
    CREATE: [P.CREATE_STAFF],
    EDIT: [P.EDIT_STAFF],
    DELETE: [P.DELETE_STAFF],
  },
  CLASSES: {
    label: "Classes",
    VIEW: [P.GET_CLASSES],
    CREATE: [P.CREATE_CLASSES],
    EDIT: [P.EDIT_CLASSES],
    DELETE: [P.DELETE_CLASSES],
  },
  TRANSPORT: {
    label: "Transport",
    VIEW: [P.GET_TRANSPORTS],
    CREATE: [P.CREATE_TRANSPORT],
    EDIT: [P.EDIT_TRANSPORT],
    DELETE: [P.DELETE_TRANSPORT],
  },
  FEES: {
    label: "Fees & Receipts",
    VIEW: [P.GET_FEES],
    CREATE: [P.RECORD_FEE_PAYMENT],
    EDIT: [P.UPDATE_RECEIPT],
    DELETE: [P.DELETE_RECEIPT],
    EXPORT: [P.GET_FEE_ANALYTICS],
  },
  EVENTS: {
    label: "Events",
    VIEW: [P.GET_EVENTS],
    CREATE: [P.CREATE_EVENT],
    EDIT: [P.EDIT_EVENT],
    DELETE: [P.DELETE_EVENT],
  },
  HOLIDAYS: {
    label: "Holidays",
    VIEW: [P.GET_HOLIDAYS],
    CREATE: [P.CREATE_HOLIDAY],
    EDIT: [P.EDIT_HOLIDAY],
    DELETE: [P.DELETE_HOLIDAY],
  },
  EXAM_CALENDAR: {
    label: "Exam Calendar",
    VIEW: [P.GET_EXAM_CALENDARS],
    CREATE: [P.CREATE_EXAM_CALENDAR],
    EDIT: [P.EDIT_EXAM_CALENDAR],
    DELETE: [P.DELETE_EXAM_CALENDAR],
  },
  NOTICES: {
    label: "Notices",
    VIEW: [P.GET_NOTICES],
    CREATE: [P.CREATE_NOTICE],
    EDIT: [P.EDIT_NOTICE],
    DELETE: [P.DELETE_NOTICE],
  },
  EXAMS: {
    label: "Exams",
    VIEW: [P.GET_EXAMS],
    CREATE: [P.CREATE_EXAM],
    EDIT: [P.EDIT_EXAM],
    DELETE: [P.DELETE_EXAM],
  },
  ATTENDANCE: {
    label: "Attendance",
    VIEW: [P.GET_ATTENDANCE],
    CREATE: [P.MARK_ATTENDANCE],
    EXPORT: [P.EXPORT_ATTENDANCE],
  },
  TIMETABLE: {
    label: "Timetable",
    VIEW: [P.GET_TIMETABLE],
    CREATE: [P.CREATE_TIMETABLE],
    EDIT: [P.EDIT_TIMETABLE],
    DELETE: [P.DELETE_TIMETABLE],
  },
  HOMEWORK: {
    label: "Homework",
    VIEW: [P.GET_HOMEWORK],
    CREATE: [P.CREATE_HOMEWORK],
    EDIT: [P.EDIT_HOMEWORK],
    DELETE: [P.DELETE_HOMEWORK],
  },
  MARKS_RESULTS: {
    label: "Marks & Results",
    VIEW: [P.GET_MARKS, P.GET_RESULTS],
    CREATE: [P.ENTER_MARKS],
    EDIT: [P.EDIT_MARKS],
    APPROVE: [P.PUBLISH_RESULTS],
  },
  LEAVE: {
    label: "Leave",
    VIEW: [P.GET_LEAVE_REQUESTS],
    CREATE: [P.CREATE_LEAVE_REQUEST],
    APPROVE: [P.APPROVE_LEAVE, P.REJECT_LEAVE],
  },
  LIBRARY: {
    label: "Library",
    VIEW: [P.GET_LIBRARY_BOOKS],
    CREATE: [P.CREATE_LIBRARY_BOOK],
    EDIT: [P.EDIT_LIBRARY_BOOK],
    EXPORT: [P.GET_LIBRARY_HISTORY],
  },
  INVENTORY: {
    label: "Inventory",
    VIEW: [P.GET_INVENTORY],
    CREATE: [P.CREATE_INVENTORY_ITEM],
    EDIT: [P.EDIT_INVENTORY_ITEM],
    DELETE: [P.DELETE_INVENTORY_ITEM],
  },
  COURIERS: {
    label: "Couriers",
    VIEW: [P.GET_COURIERS],
    CREATE: [P.CREATE_COURIER_ENTRY],
    EDIT: [P.UPDATE_COURIER_ENTRY],
    DELETE: [P.DELETE_COURIER_ENTRY],
  },
  GATE_ENTRY: {
    label: "Gate Entry",
    VIEW: [P.GET_GATE_ENTRIES],
    CREATE: [P.CREATE_GATE_ENTRY],
    EDIT: [P.UPDATE_GATE_ENTRY],
    DELETE: [P.DELETE_GATE_ENTRY],
  },
  BONAFIDE: {
    label: "Bonafide Certificates",
    VIEW: [P.GET_BONAFIDE_CERTIFICATES],
    CREATE: [P.GENERATE_BONAFIDE],
  },
  QUOTATIONS: {
    label: "Quotations",
    VIEW: [P.GET_QUOTATIONS],
    CREATE: [P.CREATE_QUOTATION],
    EDIT: [P.EDIT_QUOTATION],
    DELETE: [P.DELETE_QUOTATION],
    APPROVE: [P.APPROVE_QUOTATION],
    EXPORT: [P.EXPORT_QUOTATION],
  },
  CRM: {
    label: "CRM Leads",
    VIEW: [P.GET_CRM_LEADS],
    CREATE: [P.CREATE_CRM_LEAD],
    EDIT: [P.UPDATE_CRM_LEAD],
    DELETE: [P.DELETE_CRM_LEAD],
  },
  GALLERY: {
    label: "Gallery",
    VIEW: [P.GET_GALLERIES],
    CREATE: [P.CREATE_GALLERY],
    EDIT: [P.EDIT_GALLERY],
    DELETE: [P.DELETE_GALLERY],
  },
  CIRCULARS: {
    label: "Circulars",
    VIEW: [P.GET_CIRCULARS],
    CREATE: [P.CREATE_CIRCULAR],
    EDIT: [P.EDIT_CIRCULAR],
    DELETE: [P.DELETE_CIRCULAR],
  },
  SYLLABUS: {
    label: "Syllabus",
    VIEW: [P.GET_SYLLABUS],
    CREATE: [P.CREATE_SYLLABUS],
    EDIT: [P.EDIT_SYLLABUS],
    DELETE: [P.DELETE_SYLLABUS],
  },
  NOTES: {
    label: "Notes",
    VIEW: [P.GET_NOTES],
    CREATE: [P.CREATE_NOTE],
    EDIT: [P.EDIT_NOTE],
    DELETE: [P.DELETE_NOTE],
  },
  ANNOUNCEMENTS: {
    label: "Announcements",
    CREATE: [P.CREATE_ANNOUNCEMENT, P.SEND_NOTIFICATION],
  },
  ID_CARDS: {
    label: "ID Cards",
    VIEW: [P.GET_ID_CARDS],
    CREATE: [P.GENERATE_ID_CARDS],
    EDIT: [P.MANAGE_ID_CARD_CONFIG],
  },
  REPORTS: {
    label: "Reports",
    VIEW: [P.GET_REPORTS],
    EXPORT: [P.EXPORT_REPORTS],
  },
  COMMUNICATION: {
    label: "Messaging",
    VIEW: [P.GET_MESSAGES],
    CREATE: [P.SEND_MESSAGE],
  },
  GRIEVANCES: {
    label: "Grievances",
    VIEW: [P.GET_GRIEVANCES, P.GET_MY_GRIEVANCES],
    CREATE: [P.CREATE_GRIEVANCE],
    EDIT: [P.UPDATE_GRIEVANCE, P.ADD_GRIEVANCE_COMMENT],
  },
  ROUTES: {
    label: "Transport Routes",
    VIEW: [P.GET_ROUTES],
    CREATE: [P.MANAGE_ROUTES, P.ASSIGN_STUDENTS_TO_ROUTE],
    EDIT: [P.MANAGE_ROUTES],
  },
  EMPLOYEES: {
    label: "Employees (Platform)",
    VIEW: [P.GET_EMPLOYEES],
    CREATE: [P.CREATE_EMPLOYEE],
    EDIT: [P.EDIT_EMPLOYEE],
    DELETE: [P.DELETE_EMPLOYEE],
  },
  SCHOOLS: {
    label: "Schools (Platform)",
    VIEW: [P.GET_SCHOOLS],
    CREATE: [P.CREATE_SCHOOL],
    EDIT: [P.EDIT_SCHOOL],
    DELETE: [P.DELETE_SCHOOL],
  },
  SETTINGS: {
    label: "Settings",
    VIEW: [P.GET_SETTINGS],
    EDIT: [P.EDIT_SETTINGS],
  },
  SALARY: {
    label: "Salary",
    VIEW: [P.GET_SALARY_REPORTS, P.GET_SETTINGS],
    CREATE: [P.EDIT_SETTINGS],
    EDIT: [P.EDIT_SETTINGS],
    EXPORT: [P.GET_SALARY_REPORTS],
  },
  LETTERHEAD: {
    label: "Letterhead",
    VIEW: [P.GET_SETTINGS],
    CREATE: [P.CREATE_RECEIPT],
    EDIT: [P.CREATE_RECEIPT, P.EDIT_SETTINGS],
    DELETE: [P.CREATE_RECEIPT],
  },
  ACCOUNTING: {
    label: "Accounting",
    VIEW: [P.GET_SETTINGS],
    CREATE: [P.EDIT_SETTINGS],
    EDIT: [P.EDIT_SETTINGS],
    DELETE: [P.EDIT_SETTINGS],
    EXPORT: [P.GET_FEE_ANALYTICS, P.GET_SALARY_REPORTS],
  },
  APPROVALS: {
    label: "Approvals",
    VIEW: [P.GET_LEAVE_REQUESTS, P.GET_FEES],
    APPROVE: [P.APPROVE_LEAVE, P.REJECT_LEAVE, P.APPROVE_QUOTATION, P.SEND_NOTIFICATION],
  },
};
