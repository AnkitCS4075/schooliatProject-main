import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission, RoleName, UserType } from "../prisma/generated/index.js";
import userService from "../services/user.service.js";
import { Prisma } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import idCardService from "../services/id-card.service.js";
import createSchoolSchema from "../schemas/school/create-school.schema.js";
import createClassesSchema from "../schemas/school/create-classes.schema.js";
import updateSchoolSchema from "../schemas/school/update-school.schema.js";
import updateClassSchema from "../schemas/school/update-class.schema.js";
import getSchoolsSchema from "../schemas/school/get-schools.schema.js";
import getMySchoolSchema from "../schemas/school/get-my-school.schema.js";
import updateMySchoolSchema from "../schemas/school/update-my-school.schema.js";
import getClassesSchema from "../schemas/school/get-classes.schema.js";
import getClassByIdSchema from "../schemas/school/get-class-by-id.schema.js";
import getClassStudentsSchema from "../schemas/school/get-class-students.schema.js";
import {
  getClassDetailForSchool,
  listStudentsInClass,
} from "../services/school-class-detail.service.js";
import deleteSchoolSchema from "../schemas/school/delete-school.schema.js";
import deleteClassSchema from "../schemas/school/delete-class.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import logger from "../config/logger.js";
import emailService from "../services/email.service.js";
import roleService from "../services/role.service.js";
import sendSchoolAdminWelcomeSchema from "../schemas/school/send-school-admin-welcome.schema.js";
import { getSchoolMasterOverview } from "../services/school-master-overview.service.js";
import { getDefaultSchoolRegionIdForNewSchool } from "../services/school-region-reconciliation.service.js";

/** Empty array or null clears class-level fee breakdown in DB. */
function coerceDefaultFeeComponents(v) {
  if (v == null) return null;
  if (Array.isArray(v) && v.length === 0) return null;
  return v;
}

function emptyToNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

/**
 * Build Prisma where for GET /schools/classes (filters combine with AND; search ORs grade/division/teacher).
 * Grade and division filters use exact match (case-insensitive): the admin UI sends discrete values from meta,
 * and substring matching (contains) incorrectly matches e.g. grade "1" to "10", "11", "12".
 */
async function buildClassesListWhere(schoolId, query) {
  const and = [];

  const grade = typeof query.grade === "string" ? query.grade.trim() : "";
  if (grade) {
    and.push({ grade: { equals: grade, mode: "insensitive" } });
  }

  const division = typeof query.division === "string" ? query.division.trim() : "";
  if (division === "__NULL__") {
    and.push({ division: null });
  } else if (division) {
    and.push({ division: { equals: division, mode: "insensitive" } });
  }

  if (query.classTeacherId) {
    and.push({ classTeacherId: query.classTeacherId });
  }

  if (query.hasClassTeacher === "assigned") {
    and.push({ classTeacherId: { not: null } });
  }
  if (query.hasClassTeacher === "unassigned") {
    and.push({ classTeacherId: null });
  }

  const search = typeof query.search === "string" ? query.search.trim() : "";
  if (search) {
    const teachers = await prisma.user.findMany({
      where: {
        schoolId,
        deletedAt: null,
        deletedBy: null,
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ],
      },
      select: { id: true },
      take: 400,
    });
    const teacherIds = teachers.map((u) => u.id);
    const or = [
      { grade: { contains: search, mode: "insensitive" } },
      { division: { contains: search, mode: "insensitive" } },
    ];
    if (teacherIds.length > 0) {
      or.push({ classTeacherId: { in: teacherIds } });
    }
    and.push({ OR: or });
  }

  const base = { schoolId, deletedAt: null, deletedBy: null };
  if (and.length === 0) return base;
  return { AND: [base, ...and] };
}

const router = Router();

router.post(
  "/",
  withPermission(Permission.CREATE_SCHOOL),
  validateRequest(createSchoolSchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      let resolvedRegionId = request.regionId || null;
      if (resolvedRegionId) {
        const regionEntity = await prisma.region.findFirst({
          where: {
            id: resolvedRegionId,
            deletedAt: null,
            deletedBy: null,
          },
        });
        if (!regionEntity) {
          return res
            .status(400)
            .json({ message: "Region not found or deleted!" });
        }
      } else {
        resolvedRegionId = await getDefaultSchoolRegionIdForNewSchool(prisma);
      }

      const newSchool = await prisma.school.create({
        data: {
          name: request.name,
          email: request.email,
          phone: request.phone,
          address: request.address,
          code: request.code,
          gstNumber: request.gstNumber ?? undefined,
          principalName: request.principalName ?? undefined,
          principalEmail: request.principalEmail ?? undefined,
          principalPhone: request.principalPhone ?? undefined,
          establishedYear: request.establishedYear ?? undefined,
          boardAffiliation: request.boardAffiliation ?? undefined,
          studentStrength: request.studentStrength ?? undefined,
          certificateLink: emptyToNull(request.certificateLink),
          bankName: request.bankName ?? undefined,
          bankAccountNumber: request.bankAccountNumber ?? undefined,
          bankIfscCode: request.bankIfscCode ?? undefined,
          bankBranchName: request.bankBranchName ?? undefined,
          regionId: resolvedRegionId,
          createdBy: currentUser.id,
        },
      });

      await prisma.settings.create({
        data: {
          schoolId: newSchool.id,
          studentFeeInstallments: 12,
          studentFeeAmount: 0,
          currentInstallmentNumber: 1,
          createdBy: currentUser.id,
        },
      });

      const schoolAdmin = await userService.createSchoolAdmin(
        newSchool,
        currentUser,
      );

      return res.status(201).json({
        message: "School created!",
        data: { ...newSchool, admin: schoolAdmin },
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(400).json({
          message:
            "A school with this code, email, phone, or address already exists.",
        });
      }
      logger.error({ err: error }, "Failed to create school");
      return res.status(500).json({
        message: "Failed to create school. Please check your input and try again.",
      });
    }
  },
);

router.post(
  "/:id/send-admin-welcome",
  withPermission(Permission.CREATE_SCHOOL),
  validateRequest(sendSchoolAdminWelcomeSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body.request;
      const currentUser = req.context.user;

      if (currentUser.role?.name !== RoleName.SUPER_ADMIN) {
        return res
          .status(403)
          .json({ message: "Only Super Admin can send welcome emails." });
      }

      const school = await prisma.school.findFirst({
        where: { id, deletedAt: null, deletedBy: null },
      });
      if (!school) {
        return res.status(404).json({ message: "School not found!" });
      }

      const schoolAdminRole = await roleService.getRoleByName(
        RoleName.SCHOOL_ADMIN,
      );
      const admin = await prisma.user.findFirst({
        where: {
          schoolId: id,
          roleId: schoolAdminRole.id,
          deletedAt: null,
          deletedBy: null,
        },
        orderBy: { createdAt: "asc" },
      });
      if (!admin) {
        return res
          .status(404)
          .json({ message: "School administrator account not found." });
      }

      await emailService.sendAccountWelcomeEmail({
        to: admin.email,
        name: `${admin.firstName} ${admin.lastName || ""}`.trim(),
        schoolName: school.name,
        loginId: admin.publicUserId,
        loginEmail: admin.email,
        password,
      });

      return res.json({ message: "Welcome email sent successfully." });
    } catch (error) {
      logger.error({ err: error }, "send-admin-welcome failed");
      return res.status(502).json({
        message:
          error.message ||
          "Failed to send welcome email. Check SMTP configuration.",
      });
    }
  },
);

router.get(
  "/",
  withPermission(Permission.GET_SCHOOLS),
  validateRequest(getSchoolsSchema),
  async (req, res) => {
    const { search, regionId } = req.query;

    const baseWhere = {
      deletedAt: null,
      deletedBy: null,
    };

    let regionClause = null;
    if (regionId) {
      const defaultRegionId = await getDefaultSchoolRegionIdForNewSchool(prisma);
      if (defaultRegionId && regionId === defaultRegionId) {
        regionClause = {
          OR: [{ regionId }, { regionId: null }],
        };
      } else {
        regionClause = { regionId };
      }
    }

    const where = { ...baseWhere };

    if (search) {
      const searchOr = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
      if (regionClause) {
        where.AND = [{ OR: searchOr }, regionClause];
      } else {
        where.OR = searchOr;
      }
    } else if (regionClause) {
      Object.assign(where, regionClause);
    }

    const schools = await prisma.school.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        email: true,
        phone: true,
        address: true,
        regionId: true,
        region: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    const schoolIds = schools.map((school) => school.id);
    const schoolWithUserCounts = await prisma.user.groupBy({
      by: [Prisma.UserScalarFieldEnum.schoolId],
      where: {
        schoolId: {
          in: schoolIds,
        },
        deletedAt: null,
        deletedBy: null,
      },
      _count: {
        _all: true,
      },
    });

    const schoolCountMap = schoolWithUserCounts.reduce((acc, item) => {
      acc[item.schoolId] = item._count._all;
      return acc;
    }, {});

    schools.forEach((school) => {
      school.userCount = schoolCountMap[school.id];
    });

    return res.json({ message: "Schools fetched!", data: schools });
  },
);

router.get(
  "/my-school",
  withPermission(Permission.GET_MY_SCHOOL),
  validateRequest(getMySchoolSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const school = await prisma.school.findFirst({
      where: {
        id: currentUser.schoolId,
        deletedAt: null,
        deletedBy: null,
      },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        email: true,
        phone: true,
        certificateLink: true,
        logoId: true,
        gstNumber: true,
        principalName: true,
        principalEmail: true,
        principalPhone: true,
        establishedYear: true,
        boardAffiliation: true,
        studentStrength: true,
        bankName: true,
        bankAccountNumber: true,
        bankIfscCode: true,
        bankBranchName: true,
        upiId: true,
      },
    });

    return res.json({
      message: "School fetched!",
      data: school ? { ...school } : null,
    });
  },
);

// GET /schools/classes - must be before /:id so "classes" is not matched as school id
router.get(
  "/classes",
  withPermission(Permission.GET_CLASSES),
  validateRequest(getClassesSchema),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const schoolId = currentUser.schoolId;
      const q = req.query;

    const pageNumber = Math.max(1, parseInt(q.pageNumber, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(q.pageSize, 10) || 15));
    const skip = (pageNumber - 1) * pageSize;

    const where = await buildClassesListWhere(schoolId, q);

    const sortable = new Set([
      "createdAt",
      "grade",
      "division",
      "defaultAnnualFee",
      "defaultMonthlyFee",
    ]);
    const sortBy = sortable.has(q.sortBy) ? q.sortBy : "createdAt";
    const sortOrder =
      q.sortOrder === "asc" || q.sortOrder === "desc"
        ? q.sortOrder
        : sortBy === "createdAt"
          ? "desc"
          : "asc";
    const orderBy = { [sortBy]: sortOrder };

    const baseSchoolWhere = { schoolId, deletedAt: null, deletedBy: null };

    let classes = [];
    let totalCount = 0;
    let gradeRows = [];
    let divisionRows = [];
    try {
      [classes, totalCount, gradeRows, divisionRows] = await Promise.all([
        prisma.class.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
        }),
        prisma.class.count({ where }),
        prisma.class.findMany({
          where: baseSchoolWhere,
          distinct: ["grade"],
          select: { grade: true },
          orderBy: { grade: "asc" },
        }),
        prisma.class.findMany({
          where: baseSchoolWhere,
          distinct: ["division"],
          select: { division: true },
        }),
      ]);
    } catch (error) {
      const maybeMissingNewColumn =
        error?.code === "P2022" ||
        String(error?.message || "").includes("default_fee_components");
      if (!maybeMissingNewColumn) {
        throw error;
      }
      logger.warn(
        { err: error, schoolId },
        "Class list query failed on new fee-components column. Falling back to legacy projection.",
      );
      [classes, totalCount, gradeRows, divisionRows] = await Promise.all([
        prisma.class.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          select: {
            id: true,
            grade: true,
            division: true,
            defaultAnnualFee: true,
            defaultMonthlyFee: true,
            schoolId: true,
            classTeacherId: true,
            createdBy: true,
            updatedBy: true,
            deletedBy: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
        }),
        prisma.class.count({ where }),
        prisma.class.findMany({
          where: baseSchoolWhere,
          distinct: ["grade"],
          select: { grade: true },
          orderBy: { grade: "asc" },
        }),
        prisma.class.findMany({
          where: baseSchoolWhere,
          distinct: ["division"],
          select: { division: true },
        }),
      ]);
      classes = classes.map((c) => ({ ...c, defaultFeeComponents: null }));
    }

    const classTeacherIds = classes
      .map((cls) => cls.classTeacherId)
      .filter((id) => id != null);

    let classTeacherMap = {};
    if (classTeacherIds.length > 0) {
      const classTeachers = await prisma.user.findMany({
        where: {
          id: { in: classTeacherIds },
          deletedAt: null,
          deletedBy: null,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          contact: true,
        },
      });

      classTeacherMap = classTeachers.reduce((acc, teacher) => {
        acc[teacher.id] = teacher;
        return acc;
      }, {});
    }

    const classesWithTeachers = classes.map((cls) => ({
      ...cls,
      classTeacher: cls.classTeacherId
        ? classTeacherMap[cls.classTeacherId] || null
        : null,
    }));

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const hasNext = pageNumber < totalPages;

    const divisions = divisionRows
      .map((r) => r.division)
      .sort((a, b) => {
        if (a == null && b == null) return 0;
        if (a == null) return 1;
        if (b == null) return -1;
        return String(a).localeCompare(String(b), undefined, { numeric: true });
      });

      return res.json({
        message: "Classes fetched!",
        data: classesWithTeachers,
        totalPages,
        hasNext,
        meta: {
          grades: gradeRows.map((r) => r.grade),
          divisions,
        },
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to fetch classes");
      return res.status(500).json({
        message:
          "Failed to load classes. If this started after a deployment, complete pending database migrations and retry.",
      });
    }
  },
);

// GET /schools/classes/:id/students — paginated roster (school admin)
router.get(
  "/classes/:id/students",
  withPermission(Permission.GET_CLASSES),
  validateRequest(getClassStudentsSchema),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const schoolId = currentUser.schoolId;
      if (!schoolId) {
        return res.status(403).json({ message: "School context required." });
      }
      const { id } = req.params;
      const q = req.query;
      const pageNumber = Math.max(1, parseInt(q.pageNumber, 10) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(q.pageSize, 10) || 20));
      const result = await listStudentsInClass({
        classId: id,
        schoolId,
        pageNumber,
        pageSize,
        sortBy: q.sortBy,
        sortOrder: q.sortOrder,
        search: q.search,
      });
      if (!result) {
        return res.status(404).json({ message: "Class not found" });
      }
      return res.json({
        message: "Class students fetched!",
        data: result.students,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        page: result.page,
        pageSize: result.pageSize,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to list class students",
      });
    }
  },
);

// GET /schools/classes/:id — class detail (school admin)
router.get(
  "/classes/:id",
  withPermission(Permission.GET_CLASSES),
  validateRequest(getClassByIdSchema),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const schoolId = currentUser.schoolId;
      if (!schoolId) {
        return res.status(403).json({ message: "School context required." });
      }
      const detail = await getClassDetailForSchool(
        req.params.id,
        schoolId,
      );
      if (!detail) {
        return res.status(404).json({ message: "Class not found" });
      }
      return res.json({
        message: "Class fetched!",
        data: detail,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch class",
      });
    }
  },
);

// GET /schools/:id/overview — Super Admin: school + role/staffing stats (master data profile)
router.get(
  "/:id/overview",
  withPermission(Permission.GET_SCHOOLS),
  async (req, res) => {
    const currentUser = req.context.user;
    const { id } = req.params;
    if (currentUser.role?.name !== RoleName.SUPER_ADMIN) {
      return res.status(403).json({
        message: "Only Super Admin can fetch school overview.",
      });
    }
    const overview = await getSchoolMasterOverview(id);
    if (!overview) {
      return res.status(404).json({ message: "School not found!" });
    }
    return res.json({
      message: "School overview fetched!",
      data: overview,
    });
  },
);

// GET /schools/:id - Super Admin: full school details including bank (by id)
router.get(
  "/:id",
  withPermission(Permission.GET_SCHOOLS),
  async (req, res) => {
    const currentUser = req.context.user;
    const { id } = req.params;
    if (currentUser.role?.name !== RoleName.SUPER_ADMIN) {
      return res.status(403).json({ message: "Only Super Admin can fetch a school by ID." });
    }
    const school = await prisma.school.findFirst({
      where: {
        id,
        deletedAt: null,
        deletedBy: null,
      },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        email: true,
        phone: true,
        certificateLink: true,
        logoId: true,
        gstNumber: true,
        principalName: true,
        principalEmail: true,
        principalPhone: true,
        establishedYear: true,
        boardAffiliation: true,
        studentStrength: true,
        bankName: true,
        bankAccountNumber: true,
        bankIfscCode: true,
        bankBranchName: true,
        upiId: true,
        regionId: true,
        region: { select: { id: true, name: true } },
        createdAt: true,
      },
    });
    if (!school) {
      return res.status(404).json({ message: "School not found!" });
    }
    return res.json({
      message: "School fetched!",
      data: school,
    });
  },
);

// PATCH my-school: school admin updates their own school (requires EDIT_SETTINGS)
router.patch(
  "/my-school",
  withPermission(Permission.EDIT_SETTINGS),
  validateRequest(updateMySchoolSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const updateData = req.body.request || {};

    if (!currentUser.schoolId) {
      return res.status(403).json({
        message: "School context required to update school profile.",
      });
    }

    const existingSchool = await prisma.school.findFirst({
      where: {
        id: currentUser.schoolId,
        deletedAt: null,
        deletedBy: null,
      },
    });

    if (!existingSchool) {
      return res.status(404).json({ message: "School not found!" });
    }

    const schoolUpdateData = {};
    if (updateData.name !== undefined) schoolUpdateData.name = updateData.name;
    if (updateData.code !== undefined) schoolUpdateData.code = updateData.code;
    if (updateData.email !== undefined) schoolUpdateData.email = updateData.email;
    if (updateData.phone !== undefined) schoolUpdateData.phone = updateData.phone;
    if (updateData.address !== undefined) schoolUpdateData.address = updateData.address;
    if (updateData.certificateLink !== undefined)
      schoolUpdateData.certificateLink = emptyToNull(
        updateData.certificateLink,
      );
    if (updateData.gstNumber !== undefined) schoolUpdateData.gstNumber = updateData.gstNumber;
    if (updateData.principalName !== undefined) schoolUpdateData.principalName = updateData.principalName;
    if (updateData.principalEmail !== undefined) schoolUpdateData.principalEmail = updateData.principalEmail;
    if (updateData.principalPhone !== undefined) schoolUpdateData.principalPhone = updateData.principalPhone;
    if (updateData.establishedYear !== undefined) schoolUpdateData.establishedYear = updateData.establishedYear;
    if (updateData.boardAffiliation !== undefined) schoolUpdateData.boardAffiliation = updateData.boardAffiliation;
    if (updateData.studentStrength !== undefined) schoolUpdateData.studentStrength = updateData.studentStrength;
    if (updateData.bankName !== undefined) schoolUpdateData.bankName = updateData.bankName;
    if (updateData.bankAccountNumber !== undefined) schoolUpdateData.bankAccountNumber = updateData.bankAccountNumber;
    if (updateData.bankIfscCode !== undefined) schoolUpdateData.bankIfscCode = updateData.bankIfscCode;
    if (updateData.bankBranchName !== undefined) schoolUpdateData.bankBranchName = updateData.bankBranchName;
    if (updateData.upiId !== undefined) schoolUpdateData.upiId = updateData.upiId;

    schoolUpdateData.updatedBy = currentUser.id;

    const updatedSchool = await prisma.school.update({
      where: { id: currentUser.schoolId },
      data: schoolUpdateData,
    });

    return res.json({ message: "School profile updated!", data: updatedSchool });
  },
);

router.post(
  "/classes",
  withPermission(Permission.CREATE_CLASSES),
  validateRequest(createClassesSchema),
  async (req, res) => {
    const request = req.body.request || [];
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    // Validate unique grade+division combination within request
    const gradeDivisionMap = new Map();
    for (const cls of request) {
      const key = `${cls.grade}-${cls.division || ""}`;
      if (gradeDivisionMap.has(key)) {
        return res.status(400).json({
          message:
            "Invalid classes configuration. At least 1 combination of grade and division is repeated.",
        });
      }
      gradeDivisionMap.set(key, cls);
    }

    // Get all existing classes for this school (single query)
    const existingClassIds = request
      .map((cls) => cls.id)
      .filter((id) => id != null);

    const allExistingClasses = await prisma.class.findMany({
      where: {
        schoolId,
        deletedAt: null,
        deletedBy: null,
      },
      select: { id: true, grade: true, division: true },
    });

    // Check for duplicates with existing classes (excluding classes being updated)
    const existingIdsSet = new Set(existingClassIds);
    for (const existingClass of allExistingClasses) {
      if (existingIdsSet.has(existingClass.id)) continue; // Skip classes being updated
      const existingKey = `${existingClass.grade}-${existingClass.division || ""}`;
      if (gradeDivisionMap.has(existingKey)) {
        return res.status(400).json({
          message:
            "Invalid classes configuration. At least 1 combination of grade and division is repeated.",
        });
      }
    }

    // Separate classes into create and update
    const classesToCreate = request.filter((cls) => !cls.id);
    const classesToUpdate = request.filter((cls) => cls.id);

    // Find classes to delete (existing but not in request)
    const requestedIdsSet = new Set(classesToUpdate.map((cls) => cls.id));
    const classesToDeleteIds = allExistingClasses
      .map((cls) => cls.id)
      .filter((id) => !requestedIdsSet.has(id));

    // Validate class teachers exist if provided (single query)
    const classTeacherIds = request
      .map((cls) => cls.classTeacherId)
      .filter((id) => id != null);

    if (classTeacherIds.length > 0) {
      const teachers = await prisma.user.findMany({
        where: {
          id: { in: classTeacherIds },
          deletedAt: null,
          deletedBy: null,
        },
      });

      if (teachers.length !== classTeacherIds.length) {
        return res
          .status(404)
          .json({ message: "One or more teachers not found or deleted!" });
      }
    }

    // Use transaction to perform all operations (single transaction, no Promise.all)
    const result = await prisma.$transaction(async (tx) => {
      const allResults = [];

      // Delete classes not in request
      if (classesToDeleteIds.length > 0) {
        await tx.class.updateMany({
          where: {
            id: { in: classesToDeleteIds },
            schoolId,
          },
          data: {
            deletedAt: new Date(),
            deletedBy: currentUser.id,
          },
        });
      }

      // Create new classes
      let createdClassIds = [];
      if (classesToCreate.length > 0) {
        const createdClasses = await tx.class.createManyAndReturn({
          data: classesToCreate.map((cls) => ({
            grade: cls.grade,
            division: cls.division || null,
            classTeacherId: cls.classTeacherId || null,
            defaultAnnualFee: cls.defaultAnnualFee ?? null,
            defaultMonthlyFee: cls.defaultMonthlyFee ?? null,
            defaultFeeComponents: coerceDefaultFeeComponents(
              cls.defaultFeeComponents,
            ),
            schoolId,
            createdBy: currentUser.id,
          })),
        });
        createdClassIds = createdClasses.map((c) => c.id);
        allResults.push(...createdClasses);
      }

      // Update existing classes sequentially (no Promise.all)
      for (const cls of classesToUpdate) {
        const updatePayload = {
          grade: cls.grade,
          division: cls.division || null,
          classTeacherId: cls.classTeacherId || null,
          updatedBy: currentUser.id,
        };
        if (cls.defaultAnnualFee !== undefined) {
          updatePayload.defaultAnnualFee = cls.defaultAnnualFee ?? null;
        }
        if (cls.defaultMonthlyFee !== undefined) {
          updatePayload.defaultMonthlyFee = cls.defaultMonthlyFee ?? null;
        }
        if (cls.defaultFeeComponents !== undefined) {
          updatePayload.defaultFeeComponents = coerceDefaultFeeComponents(
            cls.defaultFeeComponents,
          );
        }
        const updatedClass = await tx.class.update({
          where: { id: cls.id },
          data: updatePayload,
        });
        allResults.push(updatedClass);
      }

      // Initialize ID card collections for newly created classes
      if (createdClassIds.length > 0) {
        await idCardService.initializeIdCardCollectionsForNewClasses(
          tx,
          createdClassIds,
          schoolId,
          currentUser.id,
        );
      }

      return allResults;
    });

    return res.status(201).json({
      message: "Classes processed successfully!",
      data: result,
    });
  },
);

// PATCH endpoint for editing school
router.patch(
  "/:id",
  withPermission(Permission.EDIT_SCHOOL),
  validateRequest(updateSchoolSchema),
  async (req, res) => {
    const { id } = req.params;
    const updateData = req.body.request || {};
    const currentUser = req.context.user;

    // Check if school exists and is not deleted
    const existingSchool = await prisma.school.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingSchool) {
      return res.status(404).json({ message: "School not found!" });
    }

    // Validate region exists when assigning a concrete region (null clears assignment)
    if (updateData.regionId !== undefined && updateData.regionId !== null) {
      const regionEntity = await prisma.region.findFirst({
        where: {
          id: updateData.regionId,
          deletedAt: null,
          deletedBy: null,
        },
      });
      if (!regionEntity) {
        return res
          .status(404)
          .json({ message: "Region not found or deleted!" });
      }
    }

    // Build update data object with only provided fields (aligned with update-school schema + Prisma School)
    const schoolUpdateData = {};

    if (updateData.name !== undefined) schoolUpdateData.name = updateData.name;
    if (updateData.code !== undefined) schoolUpdateData.code = updateData.code;
    if (updateData.email !== undefined)
      schoolUpdateData.email = updateData.email;
    if (updateData.phone !== undefined)
      schoolUpdateData.phone = updateData.phone;
    if (updateData.address !== undefined)
      schoolUpdateData.address = updateData.address;
    if (updateData.regionId !== undefined)
      schoolUpdateData.regionId = updateData.regionId;
    if (updateData.certificateLink !== undefined)
      schoolUpdateData.certificateLink = emptyToNull(
        updateData.certificateLink,
      );
    if (updateData.gstNumber !== undefined)
      schoolUpdateData.gstNumber = updateData.gstNumber;
    if (updateData.principalName !== undefined)
      schoolUpdateData.principalName = updateData.principalName;
    if (updateData.principalEmail !== undefined)
      schoolUpdateData.principalEmail = updateData.principalEmail;
    if (updateData.principalPhone !== undefined)
      schoolUpdateData.principalPhone = updateData.principalPhone;
    if (updateData.establishedYear !== undefined)
      schoolUpdateData.establishedYear = updateData.establishedYear;
    if (updateData.boardAffiliation !== undefined)
      schoolUpdateData.boardAffiliation = updateData.boardAffiliation;
    if (updateData.studentStrength !== undefined)
      schoolUpdateData.studentStrength = updateData.studentStrength;
    if (updateData.bankName !== undefined)
      schoolUpdateData.bankName = updateData.bankName;
    if (updateData.bankAccountNumber !== undefined)
      schoolUpdateData.bankAccountNumber = updateData.bankAccountNumber;
    if (updateData.bankIfscCode !== undefined)
      schoolUpdateData.bankIfscCode = updateData.bankIfscCode;
    if (updateData.bankBranchName !== undefined)
      schoolUpdateData.bankBranchName = updateData.bankBranchName;
    if (updateData.upiId !== undefined)
      schoolUpdateData.upiId = updateData.upiId;

    schoolUpdateData.updatedBy = currentUser.id;

    const updatedSchool = await prisma.school.update({
      where: { id },
      data: schoolUpdateData,
    });

    return res.json({ message: "School updated!", data: updatedSchool });
  },
);

// PATCH endpoint for editing class
router.patch(
  "/classes/:id",
  withPermission(Permission.EDIT_CLASSES),
  validateRequest(updateClassSchema),
  async (req, res) => {
    const { id } = req.params;
    const updateData = req.body.request || {};
    const currentUser = req.context.user;

    // Check if class exists and is not deleted
    const existingClass = await prisma.class.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingClass) {
      return res.status(404).json({ message: "Class not found!" });
    }

    // Validate class teacher exists and is not deleted if provided
    if (updateData.classTeacherId != null) {
      const teacherEntity = await prisma.user.findFirst({
        where: {
          id: updateData.classTeacherId,
          deletedAt: null,
          deletedBy: null,
        },
      });
      if (!teacherEntity) {
        return res
          .status(404)
          .json({ message: "Teacher not found or deleted!" });
      }
    }

    // Build update data object with only provided fields
    const classUpdateData = {};

    if (updateData.grade !== undefined)
      classUpdateData.grade = updateData.grade;
    if (updateData.division !== undefined)
      classUpdateData.division = updateData.division;
    if (updateData.classTeacherId !== undefined)
      classUpdateData.classTeacherId = updateData.classTeacherId;
    if (updateData.defaultAnnualFee !== undefined)
      classUpdateData.defaultAnnualFee = updateData.defaultAnnualFee ?? null;
    if (updateData.defaultMonthlyFee !== undefined)
      classUpdateData.defaultMonthlyFee = updateData.defaultMonthlyFee ?? null;
    if (updateData.defaultFeeComponents !== undefined)
      classUpdateData.defaultFeeComponents = coerceDefaultFeeComponents(
        updateData.defaultFeeComponents,
      );

    classUpdateData.updatedBy = currentUser.id;

    const updatedClass = await prisma.class.update({
      where: { id },
      data: classUpdateData,
    });

    return res.json({ message: "Class updated!", data: updatedClass });
  },
);

// DELETE endpoint for soft deletion of school
router.delete(
  "/:id",
  withPermission(Permission.DELETE_SCHOOL),
  validateRequest(deleteSchoolSchema),
  requireDeletionOTP({ entityType: "School" }),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;

    const existingSchool = await prisma.school.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingSchool) {
      return res.status(404).json({ message: "School not found!" });
    }

    await prisma.school.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });

    return res.json({ message: "School deleted!" });
  },
);

// DELETE endpoint for soft deletion of class
router.delete(
  "/classes/:id",
  withPermission(Permission.DELETE_CLASSES),
  validateRequest(deleteClassSchema),
  requireDeletionOTP({ entityType: "Class" }),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;

    const existingClass = await prisma.class.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingClass) {
      return res.status(404).json({ message: "Class not found!" });
    }

    await prisma.class.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });

    return res.json({ message: "Class deleted!" });
  },
);

// Export students of a class
router.get(
  "/classes/:id/students/export",
  withPermission(Permission.GET_CLASSES),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const classEntity = await prisma.class.findUnique({
        where: { id, schoolId: currentUser.schoolId, deletedAt: null },
      });

      if (!classEntity) {
        return res.status(404).json({ message: "Class not found" });
      }

      const students = await prisma.user.findMany({
        where: {
          schoolId: currentUser.schoolId,
          studentProfile: { classId: id },
          deletedAt: null,
        },
        select: {
          publicUserId: true,
          firstName: true,
          lastName: true,
          contact: true,
          email: true,
          studentProfile: {
            select: {
              rollNumber: true,
            },
          },
        },
        orderBy: { studentProfile: { rollNumber: "asc" } },
      });

      // Simple CSV generation
      const headers = ["Roll No", "ID", "First Name", "Last Name", "Contact", "Email"];
      const rows = students.map((s) => [
        s.studentProfile?.rollNumber || "",
        s.publicUserId || "",
        s.firstName,
        s.lastName || "",
        s.contact || "",
        s.email,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=class_${classEntity.grade}${classEntity.division ? "_" + classEntity.division : ""}_students.csv`
      );
      return res.send(csvContent);
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to export class data",
      });
    }
  }
);

export default router;
