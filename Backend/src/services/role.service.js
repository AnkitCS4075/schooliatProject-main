import prisma from "../prisma/client.js";
import { RoleName, Permission } from "../prisma/generated/index.js";
import logger from "../config/logger.js";
import cacheService from "./cache.service.js";

/** Return set of permission enum labels present in the DB (so we never write invalid enum values). */
async function getDbPermissionValues() {
  try {
    const rows = await prisma.$queryRaw`
      SELECT enumlabel FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'permission')
      ORDER BY enumsortorder
    `;
    return new Set(rows.map((r) => r.enumlabel));
  } catch (err) {
    logger.warn({ err }, "Could not read permission enum from DB, skipping filter");
    return null;
  }
}

const getRoleByName = async (roleName) => {
  // Cache roles for 1 hour (roles rarely change)
  const cacheKey = `role:${roleName}`;
  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await prisma.role.findUnique({
        where: { name: roleName },
      });
    },
    60 * 60 * 1000, // 1 hour TTL
  );
};

/**
 * Ensure a role exists in DB; auto-create from default map if missing.
 * This prevents runtime failures on role-dependent routes.
 */
const getOrCreateRoleByName = async (roleName) => {
  const existing = await getRoleByName(roleName);
  if (existing) return existing;

  const defaultPermissions = defaultRolePermissionsMap[roleName];
  if (!defaultPermissions) {
    throw new Error(`No default permissions configured for role: ${roleName}`);
  }

  try {
    const created = await prisma.role.create({
      data: {
        name: roleName,
        permissions: defaultPermissions,
        createdBy: "system",
      },
    });
    await cacheService.delete(`role:${roleName}`).catch(() => {});
    return created;
  } catch (error) {
    // If another request created it concurrently, fetch it.
    if (error?.code === "P2002") {
      await cacheService.delete(`role:${roleName}`).catch(() => {});
      const retried = await getRoleByName(roleName);
      if (retried) return retried;
    }
    throw error;
  }
};

const getExistingRolesNames = async () => {
  const roles = await prisma.role.findMany();
  return roles.map((role) => role.name);
};

// Define default role permissions map at module level so it can be reused
const defaultRolePermissionsMap = {
  // App Roles
  [RoleName.SUPER_ADMIN]: [
    Permission.CREATE_EMPLOYEE,
    Permission.GET_EMPLOYEES,
    Permission.EDIT_EMPLOYEE,
    Permission.DELETE_EMPLOYEE,
    Permission.CREATE_SCHOOL,
    Permission.GET_SCHOOLS,
    Permission.EDIT_SCHOOL,
    Permission.DELETE_SCHOOL,
    Permission.CREATE_VENDOR,
    Permission.GET_VENDORS,
    Permission.EDIT_VENDOR,
    Permission.DELETE_VENDOR,
    Permission.CREATE_REGION,
    Permission.GET_REGIONS,
    Permission.EDIT_REGION,
    Permission.DELETE_REGION,
    Permission.GET_ROLES,
    Permission.GET_STATISTICS,
    Permission.GET_DASHBOARD_STATS,
    Permission.GET_USERS,
    Permission.CREATE_LICENSE,
    Permission.GET_LICENSES,
    Permission.UPDATE_LICENSE,
    Permission.DELETE_LICENSE,
    Permission.CREATE_RECEIPT,
    Permission.GET_RECEIPTS,
    Permission.UPDATE_RECEIPT,
    Permission.DELETE_RECEIPT,
    Permission.CREATE_INVOICE,
    Permission.GET_INVOICES,
    Permission.UPDATE_INVOICE,
    Permission.DELETE_INVOICE,
    Permission.CREATE_LOCATION,
    Permission.GET_LOCATIONS,
    Permission.DELETE_LOCATION,
    Permission.GET_GRIEVANCES,
    Permission.CREATE_GRIEVANCE,
    Permission.UPDATE_GRIEVANCE,
    Permission.ADD_GRIEVANCE_COMMENT,
    Permission.GET_MY_GRIEVANCES,
    Permission.GET_ID_CARDS,
    Permission.GET_FEES,
    Permission.GET_SETTINGS,
    /** Platform PATCH /settings (logo, SMTP, platformConfig, fee receipt defaults, etc.) */
    Permission.EDIT_SETTINGS,
    Permission.GET_ATTENDANCE_REPORTS,
    Permission.GET_FEE_ANALYTICS,
    Permission.GET_ACADEMIC_REPORTS,
    Permission.GET_SALARY_REPORTS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.GET_MESSAGES,
    Permission.SEND_MESSAGE,
    Permission.CREATE_ANNOUNCEMENT,
    Permission.SEND_NOTIFICATION,
    Permission.REQUEST_DELETION_OTP,
    // AI & Chatbot
    Permission.USE_CHATBOT,
    Permission.GET_CHATBOT_HISTORY,
    Permission.MANAGE_FAQ,
    // Quotation
    Permission.CREATE_QUOTATION,
    Permission.GET_QUOTATIONS,
    Permission.EDIT_QUOTATION,
    Permission.DELETE_QUOTATION,
    Permission.APPROVE_QUOTATION,
    Permission.CANCEL_QUOTATION,
    Permission.CONVERT_QUOTATION,
    Permission.EXPORT_QUOTATION,
    Permission.SEND_QUOTATION,
    // Reports
    Permission.GET_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.SCHEDULE_REPORTS,
    // Custom Roles & User Permissions
    Permission.MANAGE_CUSTOM_ROLES,
    Permission.ASSIGN_USER_PERMISSIONS,
    // System
    Permission.MANAGE_DATABASE_BACKUP,
    Permission.MANAGE_SUBSCRIPTION,
    Permission.MANAGE_BRANDING,
  ],
  [RoleName.EMPLOYEE]: [
    Permission.GET_SCHOOLS,
    Permission.GET_VENDORS,
    Permission.CREATE_VENDOR,
    Permission.EDIT_VENDOR,
    Permission.GET_REGIONS,
    Permission.CREATE_REGION,
    Permission.CREATE_SCHOOL,
    Permission.CREATE_GRIEVANCE,
    Permission.GET_MY_GRIEVANCES,
    Permission.ADD_GRIEVANCE_COMMENT,
    Permission.GET_MESSAGES,
    Permission.SEND_MESSAGE,
    Permission.SEND_NOTIFICATION,
  ],
  // School Roles
  [RoleName.SCHOOL_ADMIN]: [
    Permission.CREATE_STUDENT,
    Permission.GET_STUDENTS,
    Permission.EDIT_STUDENT,
    Permission.DELETE_STUDENT,
    Permission.CREATE_TEACHER,
    Permission.GET_TEACHERS,
    Permission.EDIT_TEACHER,
    Permission.DELETE_TEACHER,
    Permission.CREATE_STAFF,
    Permission.GET_STAFF,
    Permission.EDIT_STAFF,
    Permission.DELETE_STAFF,
    Permission.CREATE_CLASSES,
    Permission.GET_CLASSES,
    Permission.EDIT_CLASSES,
    Permission.DELETE_CLASSES,
    Permission.CREATE_TRANSPORT,
    Permission.GET_TRANSPORTS,
    Permission.EDIT_TRANSPORT,
    Permission.DELETE_TRANSPORT,
    Permission.GET_MY_SCHOOL,
    Permission.CREATE_EVENT,
    Permission.GET_EVENTS,
    Permission.EDIT_EVENT,
    Permission.DELETE_EVENT,
    Permission.CREATE_HOLIDAY,
    Permission.GET_HOLIDAYS,
    Permission.EDIT_HOLIDAY,
    Permission.DELETE_HOLIDAY,
    Permission.CREATE_EXAM_CALENDAR,
    Permission.GET_EXAM_CALENDARS,
    Permission.EDIT_EXAM_CALENDAR,
    Permission.DELETE_EXAM_CALENDAR,
    Permission.CREATE_NOTICE,
    Permission.GET_NOTICES,
    Permission.EDIT_NOTICE,
    Permission.DELETE_NOTICE,
    Permission.CREATE_EXAM,
    Permission.GET_EXAMS,
    Permission.EDIT_EXAM,
    Permission.DELETE_EXAM,
    Permission.GET_CALENDAR,
    Permission.MANAGE_ID_CARD_CONFIG,
    Permission.GENERATE_ID_CARDS,
    Permission.GET_ID_CARDS,
    Permission.GET_SETTINGS,
    Permission.EDIT_SETTINGS,
    Permission.GET_FEES,
    Permission.RECORD_FEE_PAYMENT,
    Permission.CREATE_GRIEVANCE,
    Permission.GET_MY_GRIEVANCES,
    Permission.ADD_GRIEVANCE_COMMENT,
    Permission.GET_DASHBOARD_STATS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.GET_GALLERIES,
    Permission.CREATE_GALLERY,
    Permission.EDIT_GALLERY,
    Permission.DELETE_GALLERY,
    Permission.UPLOAD_GALLERY_IMAGE,
    Permission.DELETE_GALLERY_IMAGE,
    Permission.GET_MESSAGES,
    Permission.SEND_MESSAGE,
    // Attendance permissions
    Permission.MARK_ATTENDANCE,
    Permission.GET_ATTENDANCE,
    Permission.EXPORT_ATTENDANCE,
    // Homework permissions
    Permission.CREATE_HOMEWORK,
    Permission.GET_HOMEWORK,
    Permission.EDIT_HOMEWORK,
    Permission.DELETE_HOMEWORK,
    Permission.SUBMIT_HOMEWORK,
    Permission.GRADE_HOMEWORK,
    // Marks & Results permissions
    Permission.ENTER_MARKS,
    Permission.GET_MARKS,
    Permission.EDIT_MARKS,
    Permission.PUBLISH_RESULTS,
    Permission.GET_RESULTS,
    // Leave permissions
    Permission.CREATE_LEAVE_REQUEST,
    Permission.GET_LEAVE_REQUESTS,
    Permission.APPROVE_LEAVE,
    Permission.REJECT_LEAVE,
    // Timetable permissions
    Permission.CREATE_TIMETABLE,
    Permission.GET_TIMETABLE,
    Permission.EDIT_TIMETABLE,
    Permission.DELETE_TIMETABLE,
    // Notes & Syllabus permissions
    Permission.CREATE_NOTE,
    Permission.EDIT_NOTE,
    Permission.GET_NOTES,
    Permission.DELETE_NOTE,
    Permission.CREATE_SYLLABUS,
    Permission.EDIT_SYLLABUS,
    Permission.GET_SYLLABUS,
    Permission.DELETE_SYLLABUS,
    // Circular permissions
    Permission.CREATE_CIRCULAR,
    Permission.EDIT_CIRCULAR,
    Permission.PUBLISH_CIRCULAR,
    Permission.GET_CIRCULARS,
    Permission.DELETE_CIRCULAR,
    // Library permissions
    Permission.CREATE_LIBRARY_BOOK,
    Permission.EDIT_LIBRARY_BOOK,
    Permission.GET_LIBRARY_BOOKS,
    Permission.ISSUE_LIBRARY_BOOK,
    Permission.RETURN_LIBRARY_BOOK,
    Permission.RESERVE_LIBRARY_BOOK,
    Permission.GET_LIBRARY_HISTORY,
    // Reports permissions
    Permission.GET_ATTENDANCE_REPORTS,
    Permission.GET_FEE_ANALYTICS,
    Permission.GET_ACADEMIC_REPORTS,
    Permission.GET_SALARY_REPORTS,
    // AI/Chatbot permissions
    Permission.USE_CHATBOT,
    Permission.GET_CHATBOT_HISTORY,
    Permission.MANAGE_FAQ,
    // Communication permissions
    Permission.CREATE_ANNOUNCEMENT,
    Permission.SEND_NOTIFICATION,
    // Transport Routes permissions
    Permission.MANAGE_ROUTES,
    Permission.GET_ROUTES,
    Permission.ASSIGN_STUDENTS_TO_ROUTE,
    // Parent features permissions
    Permission.GET_CHILDREN,
    Permission.GET_CHILD_DATA,
    Permission.GET_CONSOLIDATED_DASHBOARD,
    // Security permissions
    Permission.REQUEST_DELETION_OTP,
    // Inventory permissions
    Permission.CREATE_INVENTORY_ITEM,
    Permission.GET_INVENTORY,
    Permission.EDIT_INVENTORY_ITEM,
    Permission.DELETE_INVENTORY_ITEM,
    Permission.GET_COURIERS,
    Permission.CREATE_COURIER_ENTRY,
    Permission.UPDATE_COURIER_ENTRY,
    Permission.DELETE_COURIER_ENTRY,
    // Gate Entry permissions
    Permission.CREATE_GATE_ENTRY,
    Permission.GET_GATE_ENTRIES,
    Permission.UPDATE_GATE_ENTRY,
    Permission.DELETE_GATE_ENTRY,
    // CRM permissions
    Permission.CREATE_CRM_LEAD,
    Permission.GET_CRM_LEADS,
    Permission.UPDATE_CRM_LEAD,
    Permission.DELETE_CRM_LEAD,
    // Bonafide permissions
    Permission.GENERATE_BONAFIDE,
    Permission.GET_BONAFIDE_CERTIFICATES,
    // Quotation permissions
    Permission.CREATE_QUOTATION,
    Permission.GET_QUOTATIONS,
    Permission.EDIT_QUOTATION,
    Permission.DELETE_QUOTATION,
    Permission.APPROVE_QUOTATION,
    Permission.CANCEL_QUOTATION,
    Permission.CONVERT_QUOTATION,
    Permission.EXPORT_QUOTATION,
    Permission.SEND_QUOTATION,
    // Reports & Export
    Permission.GET_REPORTS,
    Permission.EXPORT_REPORTS,
    // Roles & Custom Roles
    Permission.GET_ROLES,
    Permission.MANAGE_CUSTOM_ROLES,
    Permission.ASSIGN_USER_PERMISSIONS,
  ],
  [RoleName.STUDENT]: [
    Permission.GET_MY_SCHOOL,
    Permission.GET_EVENTS,
    Permission.GET_HOLIDAYS,
    Permission.GET_EXAM_CALENDARS,
    Permission.GET_NOTICES,
    Permission.GET_EXAMS,
    Permission.GET_CALENDAR,
    Permission.GET_DASHBOARD_STATS,
    Permission.GET_MESSAGES,
    Permission.SEND_MESSAGE,
    Permission.SEND_NOTIFICATION,
    // Mobile app: attendance, homework, marks, fees, grievances
    Permission.GET_ATTENDANCE,
    Permission.GET_HOMEWORK,
    Permission.SUBMIT_HOMEWORK,
    Permission.GET_MARKS,
    Permission.GET_RESULTS,
    Permission.GET_FEES,
    Permission.GET_MY_GRIEVANCES,
    Permission.CREATE_GRIEVANCE,
    Permission.ADD_GRIEVANCE_COMMENT,
    Permission.GET_LEAVE_REQUESTS,
    Permission.CREATE_LEAVE_REQUEST,
  ],
  [RoleName.TEACHER]: [
    Permission.GET_STUDENTS,
    Permission.GET_CLASSES,
    Permission.GET_MY_SCHOOL,
    Permission.GET_EVENTS,
    Permission.GET_HOLIDAYS,
    Permission.GET_EXAM_CALENDARS,
    Permission.GET_NOTICES,
    Permission.GET_EXAMS,
    Permission.GET_CALENDAR,
    Permission.GET_DASHBOARD_STATS,
    Permission.GET_MESSAGES,
    Permission.SEND_MESSAGE,
    Permission.SEND_NOTIFICATION,
    // Mobile app: timetable, homework, attendance, marks, notes, syllabus, fees, grievances, leave
    Permission.GET_TIMETABLE,
    Permission.CREATE_TIMETABLE,
    Permission.EDIT_TIMETABLE,
    Permission.DELETE_TIMETABLE,
    Permission.GET_HOMEWORK,
    Permission.CREATE_HOMEWORK,
    Permission.EDIT_HOMEWORK,
    Permission.DELETE_HOMEWORK,
    Permission.SUBMIT_HOMEWORK,
    Permission.GRADE_HOMEWORK,
    Permission.MARK_ATTENDANCE,
    Permission.GET_ATTENDANCE,
    Permission.EXPORT_ATTENDANCE,
    Permission.ENTER_MARKS,
    Permission.GET_MARKS,
    Permission.EDIT_MARKS,
    Permission.PUBLISH_RESULTS,
    Permission.GET_RESULTS,
    Permission.GET_NOTES,
    Permission.CREATE_NOTE,
    Permission.EDIT_NOTE,
    Permission.DELETE_NOTE,
    Permission.GET_SYLLABUS,
    Permission.CREATE_SYLLABUS,
    Permission.EDIT_SYLLABUS,
    Permission.DELETE_SYLLABUS,
    Permission.GET_FEES,
    Permission.RECORD_FEE_PAYMENT,
    Permission.GET_MY_GRIEVANCES,
    Permission.CREATE_GRIEVANCE,
    Permission.ADD_GRIEVANCE_COMMENT,
    Permission.UPDATE_GRIEVANCE,
    Permission.GET_GRIEVANCES,
    Permission.GET_LEAVE_REQUESTS,
    Permission.CREATE_LEAVE_REQUEST,
    Permission.APPROVE_LEAVE,
    Permission.REJECT_LEAVE,
    Permission.GET_STATISTICS,
    // Quotation view
    Permission.GET_QUOTATIONS,
    // Reports
    Permission.GET_REPORTS,
    Permission.EXPORT_REPORTS,
  ],
  [RoleName.STAFF]: [
    Permission.GET_MY_SCHOOL,
    Permission.GET_EVENTS,
    Permission.GET_HOLIDAYS,
    Permission.GET_EXAM_CALENDARS,
    Permission.GET_NOTICES,
    Permission.GET_EXAMS,
    Permission.GET_CALENDAR,
    Permission.GET_DASHBOARD_STATS,
    // Quotation view
    Permission.GET_QUOTATIONS,
  ],
  // Internal Winforge roles
  [RoleName.MANAGEMENT]: [
    Permission.CREATE_SCHOOL,
    Permission.GET_SCHOOLS,
    Permission.EDIT_SCHOOL,
    Permission.DELETE_SCHOOL,
    Permission.CREATE_EMPLOYEE,
    Permission.GET_EMPLOYEES,
    Permission.EDIT_EMPLOYEE,
    Permission.DELETE_EMPLOYEE,
    Permission.CREATE_VENDOR,
    Permission.GET_VENDORS,
    Permission.EDIT_VENDOR,
    Permission.DELETE_VENDOR,
    Permission.CREATE_REGION,
    Permission.GET_REGIONS,
    Permission.EDIT_REGION,
    Permission.DELETE_REGION,
    Permission.CREATE_LOCATION,
    Permission.GET_LOCATIONS,
    Permission.DELETE_LOCATION,
    Permission.GET_STATISTICS,
    Permission.GET_DASHBOARD_STATS,
    Permission.GET_ROLES,
    Permission.GET_USERS,
    Permission.CREATE_LICENSE,
    Permission.GET_LICENSES,
    Permission.UPDATE_LICENSE,
    Permission.DELETE_LICENSE,
    Permission.CREATE_RECEIPT,
    Permission.GET_RECEIPTS,
    Permission.UPDATE_RECEIPT,
    Permission.DELETE_RECEIPT,
    Permission.CREATE_INVOICE,
    Permission.GET_INVOICES,
    Permission.UPDATE_INVOICE,
    Permission.DELETE_INVOICE,
    Permission.GET_SETTINGS,
    Permission.EDIT_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.GET_MESSAGES,
    Permission.SEND_MESSAGE,
    Permission.CREATE_ANNOUNCEMENT,
    Permission.SEND_NOTIFICATION,
    Permission.MANAGE_ONBOARDING,
    Permission.GET_ONBOARDING,
    Permission.MANAGE_PLATFORM_FINANCE,
    Permission.GET_PLATFORM_FINANCE,
    Permission.CREATE_SALES_LEAD,
    Permission.GET_SALES_LEADS,
    Permission.UPDATE_SALES_LEAD,
    Permission.DELETE_SALES_LEAD,
    Permission.GET_SALES_PERFORMANCE,
    // Quotation permissions
    Permission.CREATE_QUOTATION,
    Permission.GET_QUOTATIONS,
    Permission.EDIT_QUOTATION,
    Permission.DELETE_QUOTATION,
    Permission.APPROVE_QUOTATION,
    Permission.CANCEL_QUOTATION,
    Permission.CONVERT_QUOTATION,
    Permission.EXPORT_QUOTATION,
    Permission.SEND_QUOTATION,
    // Custom Role permissions
    Permission.MANAGE_CUSTOM_ROLES,
    Permission.ASSIGN_USER_PERMISSIONS,
    // Reports & Export
    Permission.GET_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.SCHEDULE_REPORTS,
    // System Admin
    Permission.MANAGE_DATABASE_BACKUP,
    Permission.MANAGE_SUBSCRIPTION,
    Permission.MANAGE_BRANDING,
  ],
  [RoleName.HR_ADMIN]: [
    Permission.CREATE_EMPLOYEE,
    Permission.GET_EMPLOYEES,
    Permission.EDIT_EMPLOYEE,
    Permission.DELETE_EMPLOYEE,
    Permission.GET_SCHOOLS,
    Permission.GET_ROLES,
    Permission.GET_USERS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.GET_MESSAGES,
    Permission.SEND_MESSAGE,
  ],
  [RoleName.IT]: [
    Permission.GET_SCHOOLS,
    Permission.GET_EMPLOYEES,
    Permission.GET_SETTINGS,
    Permission.EDIT_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.GET_MESSAGES,
    Permission.SEND_MESSAGE,
  ],
  [RoleName.SALES]: [
    Permission.GET_SCHOOLS,
    Permission.CREATE_SALES_LEAD,
    Permission.GET_SALES_LEADS,
    Permission.UPDATE_SALES_LEAD,
    Permission.DELETE_SALES_LEAD,
    Permission.GET_SALES_PERFORMANCE,
    Permission.MANAGE_ONBOARDING,
    Permission.GET_ONBOARDING,
    Permission.GET_MESSAGES,
    Permission.SEND_MESSAGE,
    // Quotation permissions
    Permission.CREATE_QUOTATION,
    Permission.GET_QUOTATIONS,
    Permission.EDIT_QUOTATION,
    Permission.DELETE_QUOTATION,
    Permission.APPROVE_QUOTATION,
    Permission.CANCEL_QUOTATION,
    Permission.CONVERT_QUOTATION,
    Permission.EXPORT_QUOTATION,
    Permission.SEND_QUOTATION,
    // Reports
    Permission.GET_REPORTS,
    Permission.EXPORT_REPORTS,
  ],
};

const createDefaultRoles = async () => {
  let roleNames = [
    RoleName.SUPER_ADMIN,
    RoleName.EMPLOYEE,
    RoleName.SCHOOL_ADMIN,
    RoleName.STUDENT,
    RoleName.TEACHER,
    RoleName.STAFF,
    RoleName.MANAGEMENT,
    RoleName.HR_ADMIN,
    RoleName.IT,
    RoleName.SALES,
  ];

  const existingRoleNames = await getExistingRolesNames();
  roleNames = roleNames.filter(
    (roleName) => !existingRoleNames.includes(roleName),
  );

  logger.info(`Exising Roles: ${JSON.stringify(existingRoleNames || [])}`);

  const roles = roleNames.map((roleName) => ({
    name: roleName,
    permissions: defaultRolePermissionsMap[roleName],
    createdBy: "system",
  }));

  logger.info(`Creating Roles: ${JSON.stringify(roleNames)}`);

  return await prisma.role.createManyAndReturn({
    data: roles,
    select: {
      id: true,
      name: true,
      permissions: true,
    },
  });
};

const updateRolePermissions = async () => {
  const dbPermissions = await getDbPermissionValues();
  const existingRoles = await prisma.role.findMany({
    where: { deletedAt: null },
  });

  const updates = [];
  for (const role of existingRoles) {
    let expectedPermissions = defaultRolePermissionsMap[role.name];
    if (expectedPermissions) {
      // Only set permissions that exist in the DB enum (e.g. after migrations)
      if (dbPermissions && dbPermissions.size > 0) {
        expectedPermissions = expectedPermissions.filter((p) => dbPermissions.has(p));
      }
      const currentPermissions = role.permissions || [];
      const expectedSet = new Set(expectedPermissions);
      const currentSet = new Set(currentPermissions.map((p) => String(p)));

      // Check if permissions are different (compare as strings for enum/string consistency)
      const needsUpdate =
        expectedPermissions.length !== currentPermissions.length ||
        expectedPermissions.some((p) => !currentSet.has(String(p))) ||
        currentPermissions.some((p) => !expectedSet.has(String(p)));

      if (needsUpdate) {
        logger.info(
          {
            roleName: role.name,
            currentPermissions: currentPermissions.length,
            expectedPermissions: expectedPermissions.length,
          },
          "Updating role permissions",
        );
        updates.push(
          prisma.role.update({
            where: { id: role.id },
            data: {
              permissions: expectedPermissions,
              updatedBy: "system",
            },
          }),
        );
      }
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates);
    for (const roleName of Object.keys(defaultRolePermissionsMap)) {
      await cacheService.delete(`role:${roleName}`).catch(() => {});
    }
    logger.info(`Updated permissions for ${updates.length} role(s)`);
  } else {
    logger.info("All roles have up-to-date permissions");
  }
};

const roleService = {
  getRoleByName,
  getOrCreateRoleByName,
  createDefaultRoles,
  updateRolePermissions,
  defaultRolePermissionsMap,
};

export default roleService;
