import prisma from "../prisma/client.js";
import bcryptjs from "bcryptjs";
import { RoleName, UserType, Gender } from "../prisma/generated/index.js";
import roleService from "./role.service.js";
import fileService from "./file.service.js";
import logger from "../config/logger.js";
import stringUtil from "../utils/string.util.js";

const getUserSelect = (
  fetchStudentProfile = false,
  fetchTeacherProfile = false,
  fetchStaffProfile = false,
) => {
  const baseSelect = {
    id: true,
    email: true,
    userType: true,
    roleId: true,
    firstName: true,
    lastName: true,
    schoolId: true,
    assignedRegionId: true,
    address: true,
    aadhaarId: true,
    contact: true,
    gender: true,
    dateOfBirth: true,
    publicUserId: true,
    registrationPhotoId: true,
    idPhotoId: true,
  };

  const select = { ...baseSelect };

  if (fetchStudentProfile) {
    select.studentProfile = {
      select: {
        id: true,
        rollNumber: true,
        apaarId: true,
        classId: true,
        transportId: true,
        fatherName: true,
        motherName: true,
        fatherContact: true,
        motherContact: true,
        fatherOccupation: true,
        annualIncome: true,
        accommodationType: true,
        bloodGroup: true,
        class: {
          select: {
            id: true,
            grade: true,
            division: true,
          },
        },
        transport: {
          select: {
            id: true,
            type: true,
            vehicleNumber: true,
          },
        },
      },
    };
  }

  if (fetchTeacherProfile) {
    select.teacherProfile = {
      select: {
        id: true,
        designation: true,
        highestQualification: true,
        university: true,
        yearOfPassing: true,
        grade: true,
        transportId: true,
        panCardNumber: true,
        bloodGroup: true,
        basicSalary: true,
        subjects: true,
        transport: {
          select: {
            id: true,
            type: true,
            vehicleNumber: true,
          },
        },
      },
    };
  }

  if (fetchStaffProfile) {
    select.staffProfile = {
      select: {
        id: true,
        designation: true,
        basicSalary: true,
      },
    };
  }

  return select;
};

// Convenience exports for different user types
const getStudentSelect = () => getUserSelect(true, false, false);
const getTeacherSelect = () => getUserSelect(false, true, false);
const getStaffSelect = () => getUserSelect(false, false, true);
const getEmployeeSelect = () => ({
  ...getUserSelect(false, false, false),
  assignedRegion: {
    select: {
      id: true,
      name: true,
    },
  },
});

const createSuperAdmin = async () => {
  const superAdminRole = await roleService.getOrCreateRoleByName(
    RoleName.SUPER_ADMIN,
  );

  // Check if a user with the SUPER_ADMIN role already exists
  const existingSuperAdminUser = await prisma.user.findFirst({
    where: {
      roleId: superAdminRole.id,
    },
  });

  // Also check if a user with the default admin email already exists (to avoid unique constraint violation)
  const existingAdminByEmail = await prisma.user.findUnique({
    where: { email: "admin@schooliat.com" },
  });

  if (existingSuperAdminUser || existingAdminByEmail) {
    return logger.info("Super Admin already exists or admin email is already in use.");
  }

  const generatedPassword = stringUtil.generateRandomString(15);
  logger.info(
    `Generating super admin user with creds for super admin: ${JSON.stringify({
      email: "admin@schooliat.com",
      password: generatedPassword,
    })}`,
  );

  const user = await prisma.user.create({
    data: {
      email: "admin@schooliat.com",
      password: await bcryptjs.hash(generatedPassword, 10),
      roleId: superAdminRole.id,
      publicUserId: "ADMIN001",
      registrationPhotoId: "asdads",
      userType: UserType.APP,
      firstName: "App",
      lastName: "Admin User",
      gender: Gender.MALE,
      dateOfBirth: new Date("1990-01-01"),
      contact: "0000000000",
      address: [],
      createdBy: "system",
    },
  });
  logger.info("Admin User Created");
};

const createSchoolAdmin = async (school, currentUser) => {
  const { name, email } = school;

  const role = await roleService.getRoleByName(RoleName.SCHOOL_ADMIN);
  const generatedPassword = stringUtil.generateRandomString(15);

  logger.info(
    `Generating school admin user with creds for school admin of ${name}: ${JSON.stringify({ email, password: generatedPassword })}`,
  );

  const schoolAdmin = await prisma.user.create({
    data: {
      publicUserId: `${school.code}A0001`,
      firstName: school.code,
      lastName: "Admin",
      email,
      userType: UserType.SCHOOL,
      roleId: role.id,
      schoolId: school.id,
      password: await bcryptjs.hash(generatedPassword, 10),
      gender: Gender.MALE,
      dateOfBirth: new Date("1990-01-01"),
      contact: school.phone || "0000000000",
      address: school.address || [],
      createdBy: currentUser.id,
    },
    select: getUserSelect(false, false), // School admin doesn't have profile
  });

  return { ...schoolAdmin, password: generatedPassword };
};

const getEmployeeById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: getEmployeeSelect(),
  });
};

/** Display label for a class row (aligned with dashboard classes list). */
function formatClassTeacherLabel(cls) {
  const grade = cls?.grade != null ? String(cls.grade).trim() : "";
  const div = cls?.division != null ? String(cls.division).trim() : "";
  if (!grade && !div) return "";
  return div ? `${grade} ${div}` : grade;
}

/**
 * Classes assign a "class teacher" via `classes.class_teacher_id` → User.id.
 * TeacherProfile has no class assignment field; list/detail must derive this from Class rows.
 */
const attachClassTeacherAssignments = async (users, schoolId) => {
  if (!Array.isArray(users) || users.length === 0 || !schoolId) return users;

  const teacherIds = users.map((u) => u?.id).filter(Boolean);
  if (teacherIds.length === 0) return users;

  const classes = await prisma.class.findMany({
    where: {
      schoolId,
      deletedAt: null,
      deletedBy: null,
      classTeacherId: { in: teacherIds },
    },
    select: { id: true, grade: true, division: true, classTeacherId: true },
  });

  const byTeacher = new Map();
  for (const row of classes) {
    if (!row.classTeacherId) continue;
    const label = formatClassTeacherLabel(row);
    if (!byTeacher.has(row.classTeacherId)) {
      byTeacher.set(row.classTeacherId, []);
    }
    byTeacher.get(row.classTeacherId).push({
      id: row.id,
      label: label || row.id,
    });
  }

  for (const user of users) {
    if (!user) continue;
    const pairs = byTeacher.get(user.id) || [];
    pairs.sort((a, b) => String(a.label).localeCompare(String(b.label)));
    const assignedClasses = pairs.map((p) => p.label);
    const assignedClassIds = pairs.map((p) => p.id);
    user.assignedClassIds = assignedClassIds;
    user.assignedClasses = assignedClasses;
    user.class = assignedClasses.length > 0 ? assignedClasses.join(", ") : null;
  }

  return users;
};

/** Student attendance rows & teacher "marked" rows: count these as present-like. */
const ATTENDANCE_PRESENT_LIKE_STATUSES = new Set(["PRESENT", "LATE", "HALF_DAY"]);

function formatTransportLabel(transport) {
  if (!transport) return null;
  const typeRaw = transport.type != null ? String(transport.type) : "";
  const type = typeRaw.replace(/_/g, " ");
  const v = transport.vehicleNumber?.trim?.() ?? "";
  const parts = [type, v].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/**
 * Flattens metrics the dashboard expects on each teacher user:
 * - `transport` (string) from TeacherProfile.transport
 * - `salary` "PAID" | "DUE" | null from SalaryPayments (month) + basicSalary
 * - `attendance` { percentage } from **this teacher's own** attendance rows (current calendar month).
 *   Staff/teacher attendance (admin `/admin/attendance/staff`) stores the attendee in `Attendance.studentId`
 *   (same field as students). It must NOT use `markedBy` (that is who recorded the row, e.g. when marking students).
 */
const attachTeacherListMetrics = async (users, schoolId) => {
  if (!Array.isArray(users) || users.length === 0 || !schoolId) return users;

  const teacherIds = users.map((u) => u?.id).filter(Boolean);
  if (teacherIds.length === 0) return users;

  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [payments, attendanceGroups] = await Promise.all([
    prisma.salaryPayments.findMany({
      where: {
        schoolId,
        userId: { in: teacherIds },
        month: monthStr,
        deletedAt: null,
      },
      select: { userId: true },
    }),
    prisma.attendance.groupBy({
      by: ["studentId", "status"],
      where: {
        schoolId,
        studentId: { in: teacherIds },
        date: { gte: startOfMonth, lte: endOfMonth },
        deletedAt: null,
      },
      _count: { _all: true },
    }),
  ]);

  const paidThisMonth = new Set(payments.map((p) => p.userId));

  const statsByTeacher = new Map();
  for (const row of attendanceGroups) {
    const id = row.studentId;
    if (!statsByTeacher.has(id)) {
      statsByTeacher.set(id, { present: 0, total: 0 });
    }
    const s = statsByTeacher.get(id);
    const c = row._count._all;
    s.total += c;
    if (ATTENDANCE_PRESENT_LIKE_STATUSES.has(row.status)) {
      s.present += c;
    }
  }

  for (const user of users) {
    if (!user) continue;
    const tp = user.teacherProfile;
    user.transport = formatTransportLabel(tp?.transport) ?? null;

    const base = tp?.basicSalary;
    if (paidThisMonth.has(user.id)) {
      user.salary = "PAID";
    } else if (base != null && base > 0) {
      user.salary = "DUE";
    } else {
      user.salary = null;
    }

    const st = statsByTeacher.get(user.id);
    if (st && st.total > 0) {
      const pct = Math.round((st.present / st.total) * 100);
      user.attendance = { percentage: pct };
    } else {
      user.attendance = null;
    }
  }

  return users;
};

/**
 * Flattens metrics the admin staff list/detail UIs expect on each staff user:
 * - `transport` is always `null` (StaffProfile has no transport; avoids shape drift vs teachers).
 * - `salary` "PAID" | "DUE" | null from SalaryPayments (month) + staffProfile.basicSalary
 * - `attendance` { percentage } from **this staff member's own** rows (current calendar month).
 *   Staff attendance stores the attendee in `Attendance.studentId` (same as teachers).
 */
const attachStaffListMetrics = async (users, schoolId) => {
  if (!Array.isArray(users) || users.length === 0 || !schoolId) return users;

  const staffIds = users.map((u) => u?.id).filter(Boolean);
  if (staffIds.length === 0) return users;

  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [payments, attendanceGroups] = await Promise.all([
    prisma.salaryPayments.findMany({
      where: {
        schoolId,
        userId: { in: staffIds },
        month: monthStr,
        deletedAt: null,
      },
      select: { userId: true },
    }),
    prisma.attendance.groupBy({
      by: ["studentId", "status"],
      where: {
        schoolId,
        studentId: { in: staffIds },
        date: { gte: startOfMonth, lte: endOfMonth },
        deletedAt: null,
      },
      _count: { _all: true },
    }),
  ]);

  const paidThisMonth = new Set(payments.map((p) => p.userId));

  const statsByStaff = new Map();
  for (const row of attendanceGroups) {
    const id = row.studentId;
    if (!statsByStaff.has(id)) {
      statsByStaff.set(id, { present: 0, total: 0 });
    }
    const s = statsByStaff.get(id);
    const c = row._count._all;
    s.total += c;
    if (ATTENDANCE_PRESENT_LIKE_STATUSES.has(row.status)) {
      s.present += c;
    }
  }

  for (const user of users) {
    if (!user) continue;
    user.transport = null;

    const sp = user.staffProfile;
    const base = sp?.basicSalary;
    if (paidThisMonth.has(user.id)) {
      user.salary = "PAID";
    } else if (base != null && base > 0) {
      user.salary = "DUE";
    } else {
      user.salary = null;
    }

    const st = statsByStaff.get(user.id);
    if (st && st.total > 0) {
      const pct = Math.round((st.present / st.total) * 100);
      user.attendance = { percentage: pct };
    } else {
      user.attendance = null;
    }
  }

  return users;
};

/**
 * Flattens metrics the admin students table expects on each user:
 * - `transport` (string) from StudentProfile.transport
 * - `fees` "PAID" | "DUE" | null from Fee (latest year row per student)
 * - `attendance` { percentage } from Attendance rows for this student (current calendar month)
 */
const attachStudentListMetrics = async (users, schoolId) => {
  if (!Array.isArray(users) || users.length === 0 || !schoolId) return users;

  const studentIds = users.map((u) => u?.id).filter(Boolean);
  if (studentIds.length === 0) return users;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [attendanceGroups, feeRows] = await Promise.all([
    prisma.attendance.groupBy({
      by: ["studentId", "status"],
      where: {
        schoolId,
        studentId: { in: studentIds },
        date: { gte: startOfMonth, lte: endOfMonth },
        deletedAt: null,
      },
      _count: { _all: true },
    }),
    prisma.fee.findMany({
      where: {
        schoolId,
        studentId: { in: studentIds },
        deletedAt: null,
      },
      select: {
        studentId: true,
        totalRemainingAmount: true,
        year: true,
      },
      orderBy: [{ year: "desc" }, { id: "desc" }],
    }),
  ]);

  const statsByStudent = new Map();
  for (const row of attendanceGroups) {
    const id = row.studentId;
    if (!statsByStudent.has(id)) {
      statsByStudent.set(id, { present: 0, total: 0 });
    }
    const s = statsByStudent.get(id);
    const c = row._count._all;
    s.total += c;
    if (ATTENDANCE_PRESENT_LIKE_STATUSES.has(row.status)) {
      s.present += c;
    }
  }

  const feeByStudent = new Map();
  for (const f of feeRows) {
    if (f.studentId && !feeByStudent.has(f.studentId)) {
      feeByStudent.set(f.studentId, f);
    }
  }

  for (const user of users) {
    if (!user) continue;
    const sp = user.studentProfile;
    user.transport = formatTransportLabel(sp?.transport) ?? null;

    const st = statsByStudent.get(user.id);
    if (st && st.total > 0) {
      const pct = Math.round((st.present / st.total) * 100);
      user.attendance = { percentage: pct };
    } else {
      user.attendance = null;
    }

    const fee = feeByStudent.get(user.id);
    if (fee) {
      user.fees = fee.totalRemainingAmount > 0 ? "DUE" : "PAID";
    } else {
      user.fees = null;
    }
  }

  return users;
};

const attachFileURLs = async (users) => {
  // Handle both array and single user
  if (users.length === 0) return users;

  // Collect all file IDs
  const fileIds = new Set();
  users.forEach((user) => {
    if (user?.registrationPhotoId) fileIds.add(user.registrationPhotoId);
    if (user?.idPhotoId) fileIds.add(user.idPhotoId);
  });

  // Fetch all files in one go
  const files = await fileService.getFilesByIds(Array.from(fileIds));
  const fileUrlMap = new Map(files.map((file) => [file.id, file.url]));

  // Attach photo URLs to users
  users.forEach((user) => {
    if (user) {
      user.registrationPhotoUrl = user.registrationPhotoId
        ? fileUrlMap.get(user.registrationPhotoId) || null
        : null;
      user.idPhotoUrl = user.idPhotoId
        ? fileUrlMap.get(user.idPhotoId) || null
        : null;
    }
  });

  return users;
};

const userService = {
  createSuperAdmin,
  createSchoolAdmin,
  getUserSelect,
  getStudentSelect,
  getTeacherSelect,
  getStaffSelect,
  getEmployeeSelect,
  getEmployeeById,
  attachFileURLs,
  attachClassTeacherAssignments,
  attachTeacherListMetrics,
  attachStaffListMetrics,
  attachStudentListMetrics,
};

export default userService;
