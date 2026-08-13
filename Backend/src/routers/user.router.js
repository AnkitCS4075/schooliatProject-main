import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission, RoleName, UserType } from "../prisma/generated/index.js";
import userService from "../services/user.service.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import paginateUtil from "../utils/paginate.util.js";
import bcryptjs from "bcryptjs";
import stringUtil from "../utils/string.util.js";
import emailService from "../services/email.service.js";
import logger from "../config/logger.js";
import fileService from "../services/file.service.js";
import roleService from "../services/role.service.js";
import csvUtil from "../utils/csv.util.js";
import experienceCertificateService from "../services/experience-certificate.service.js";
import feeService from "../services/fee.service.js";
import rollNumberService from "../services/roll-number.service.js";
import admissionFormService from "../services/admission-form.service.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import { deleteByIdWithOtpSchema } from "../schemas/common/delete-with-otp.schema.js";
import {
  bulkDeleteTeachersSchema,
  bulkDeleteStaffSchema,
  bulkDeleteStudentsSchema,
} from "../schemas/user/bulk-delete-users.schema.js";
import otpDeletionService from "../services/otp-deletion.service.js";
import { resolveDeletionOtpRecipientEmail } from "../services/deletion-otp-recipient.service.js";
import createStudentSchema from "../schemas/user/create-student.schema.js";
import updateStudentSchema from "../schemas/user/update-student.schema.js";
import {
  allocateTeacherPublicUserId,
  allocateStaffPublicUserId,
  allocateStudentPublicUserId,
} from "../utils/teacher-public-user-id.util.js";
import {
  bulkPlaceholderEmail,
  formatBulkImportError,
  normalizeBulkContact,
  normalizeBulkPersonName,
  parseBulkAadhaarId,
  parseBulkDateOfBirth,
  parseBulkRollNumber,
  parseRollNumberFromValue,
  resolveStudentClassForBulk,
} from "../utils/bulk-user-import.util.js";

const router = Router();

/** List/detail UIs expect `teacher.subjects`; data lives on `teacherProfile.subjects`. */
function withTeacherSubjects(user) {
  if (!user) return user;
  const subj = user.teacherProfile?.subjects ?? null;
  return { ...user, subjects: subj };
}

function mapTeachersWithSubjects(users) {
  return users.map(withTeacherSubjects);
}

function parseUniqueConstraintField(error) {
  const target = error?.meta?.target;
  if (Array.isArray(target) && target.length > 0) {
    const raw = String(target[0]);
    if (raw === "public_user_id") return "publicUserId";
    if (raw === "aadhaar_id") return "aadhaarId";
    if (raw === "email") return "email";
    if (raw === "apaar_id") return "apaarId";
    return raw;
  }
  const message = String(error?.message || "");
  if (message.includes("users_unique_email") || message.includes("email")) return "email";
  if (message.includes("users_unique_public_user_id") || message.includes("public_user_id"))
    return "publicUserId";
  if (message.includes("aadhaar")) return "aadhaarId";
  if (message.includes("apaar")) return "apaarId";
  return null;
}

function normalizeNullableTrim(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function normalizeAddressLines(address) {
  if (!Array.isArray(address)) return [];
  return address
    .map((line) => String(line ?? "").trim())
    .filter((line) => line.length > 0 && line !== "," && line !== "-");
}

async function generateStudentPublicUserId({ schoolId, roleId, schoolCode, attempt = 0 }) {
  const existingStudents = await prisma.user.count({
    where: {
      schoolId,
      roleId,
    },
  });
  return `${schoolCode}S${String(existingStudents + 1 + attempt).padStart(4, "0")}`;
}

// Create teacher
router.post(
  "/teachers",
  withPermission(Permission.CREATE_TEACHER),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      // Validate school exists
      const school = await prisma.school.findUnique({
        where: { id: currentUser.schoolId },
      });

      if (!school) {
        return res.status(404).json({ message: "School not found!" });
      }

      // Get teacher role
      const teacherRole = await roleService.getOrCreateRoleByName(RoleName.TEACHER);

      // Generate password
      const generatedPassword = stringUtil.generateRandomString(15);

      // Profile Photo
      let registrationPhotoId = null;
      if (req.body.request.registrationPhotoId) {
        registrationPhotoId = req.body.request.registrationPhotoId;
      }

      // Login ID: optional manual value; otherwise allocate from max existing + free scan
      // (avoids collisions with soft-deleted teachers who still hold their public_user_id).
      const manualLoginIdRequested = Boolean(
        String(req.body.request.publicUserId ?? "").trim(),
      );
      let publicUserId = String(req.body.request.publicUserId ?? "").trim() || null;
      if (!publicUserId) {
        publicUserId = await allocateTeacherPublicUserId(
          school.code,
          school.id,
          teacherRole.id,
        );
      }

      const emailNormalized = request.email.trim().toLowerCase();
      const aadhaarNormalized = request.aadhaarId?.trim() || null;
      const panCardNormalized = request.panCardNumber?.trim() || null;

      const [existingByEmail, existingByPublicUserId, existingByAadhaar] = await Promise.all([
        prisma.user.findUnique({ where: { email: emailNormalized } }),
        prisma.user.findUnique({ where: { publicUserId } }),
        aadhaarNormalized
          ? prisma.user.findUnique({ where: { aadhaarId: aadhaarNormalized } })
          : Promise.resolve(null),
      ]);

      const activeEmailConflict = existingByEmail && existingByEmail.deletedAt == null;
      if (activeEmailConflict) {
        return res.status(400).json({
          message:
            "Email already exists for an active account. Use a different email or reactivate that user.",
        });
      }
      const activePublicIdConflict =
        existingByPublicUserId && existingByPublicUserId.deletedAt == null;
      if (activePublicIdConflict) {
        return res.status(400).json({
          errorCode: "TEACHER_LOGIN_ID_IN_USE",
          message: manualLoginIdRequested
            ? `Login ID "${publicUserId}" is already in use by another account. Enter a different Login ID.`
            : "Could not assign a unique Login ID automatically (this can happen under heavy load). Please try again in a moment, or set a custom Login ID in the form.",
        });
      }
      const activeAadhaarConflict = existingByAadhaar && existingByAadhaar.deletedAt == null;
      if (activeAadhaarConflict) {
        return res.status(400).json({
          message:
            "Aadhaar ID already exists for an active account. Use a different Aadhaar ID.",
        });
      }

      // Optional inline custom role assignment: grants the role's permissions
      // additively and records the role on the user for the permission preview.
      const customRoleId = request.customRoleId || null;
      let customRole = null;
      let additivePermissions = [];
      if (customRoleId) {
        customRole = await prisma.customRole.findFirst({
          where: {
            id: customRoleId,
            deletedAt: null,
            OR: [{ schoolId: currentUser.schoolId }, { schoolId: null }],
          },
          select: { id: true, name: true, displayName: true, permissions: true },
        });
        if (!customRole) {
          return res.status(400).json({ message: "Selected custom role was not found" });
        }
        additivePermissions = customRole.permissions || [];
      }

      const reviveCandidate = [existingByEmail, existingByPublicUserId, existingByAadhaar]
        .filter(Boolean)
        .find(
          (u) =>
            u.deletedAt != null &&
            u.schoolId === currentUser.schoolId &&
            u.roleId === teacherRole.id,
        );
      const canReviveDeletedTeacher = Boolean(reviveCandidate);

      let user;
      if (canReviveDeletedTeacher) {
        user = await prisma.$transaction(async (tx) => {
          const revived = await tx.user.update({
            where: { id: reviveCandidate.id },
            data: {
              publicUserId,
              email: emailNormalized,
              password: await bcryptjs.hash(generatedPassword, 10),
              firstName: request.firstName.trim(),
              lastName: request.lastName?.trim() || "",
              contact: request.contact.trim(),
              gender: request.gender,
              dateOfBirth: new Date(request.dateOfBirth),
              address: request.address || [],
              aadhaarId: aadhaarNormalized,
              userType: UserType.SCHOOL,
              roleId: teacherRole.id,
              schoolId: currentUser.schoolId,
              registrationPhotoId: registrationPhotoId || null,
              idPhotoId: request.idPhotoId || null,
              deletedAt: null,
              deletedBy: null,
              updatedBy: currentUser.id,
              permissions: [
                ...new Set([
                  ...(reviveCandidate.permissions || []),
                  ...additivePermissions,
                ]),
              ],
              ...(customRoleId ? { customRoleId } : {}),
            },
            select: userService.getTeacherSelect(),
          });

          await tx.teacherProfile.upsert({
            where: { userId: revived.id },
            update: {
              designation: request.designation?.trim() || null,
              highestQualification: request.highestQualification?.trim() || "",
              university: request.university?.trim() || "",
              yearOfPassing: request.yearOfPassing ? parseInt(request.yearOfPassing) : 0,
              grade: request.grade?.trim() || "",
              subjects: request.subjects?.trim() || null,
              transportId: request.transportId || null,
              panCardNumber: panCardNormalized,
              bloodGroup: request.bloodGroup || null,
              basicSalary:
                request.basicSalary !== undefined && request.basicSalary !== ""
                  ? Number(request.basicSalary)
                  : null,
              updatedBy: currentUser.id,
              deletedAt: null,
              deletedBy: null,
            },
            create: {
              userId: revived.id,
              designation: request.designation?.trim() || null,
              highestQualification: request.highestQualification?.trim() || "",
              university: request.university?.trim() || "",
              yearOfPassing: request.yearOfPassing ? parseInt(request.yearOfPassing) : 0,
              grade: request.grade?.trim() || "",
              subjects: request.subjects?.trim() || null,
              transportId: request.transportId || null,
              panCardNumber: panCardNormalized,
              bloodGroup: request.bloodGroup || null,
              basicSalary:
                request.basicSalary !== undefined && request.basicSalary !== ""
                  ? Number(request.basicSalary)
                  : null,
              createdBy: currentUser.id,
            },
          });

          const full = await tx.user.findFirst({
            where: { id: revived.id },
            select: userService.getTeacherSelect(),
          });
          return full;
        });
      } else {
        // Create user (hashed password enables mobile TEACHER login)
        user = await prisma.user.create({
          data: {
            publicUserId,
            email: emailNormalized,
            password: await bcryptjs.hash(generatedPassword, 10),
            firstName: request.firstName.trim(),
            lastName: request.lastName?.trim() || "",
            contact: request.contact.trim(),
            gender: request.gender,
            dateOfBirth: new Date(request.dateOfBirth),
            address: request.address || [],
            aadhaarId: aadhaarNormalized,
            userType: UserType.SCHOOL,
            roleId: teacherRole.id,
            schoolId: currentUser.schoolId,
            registrationPhotoId: registrationPhotoId || null,
            idPhotoId: request.idPhotoId || null,
            permissions: additivePermissions,
            ...(customRoleId ? { customRoleId } : {}),
            createdBy: currentUser.id,
          },
          select: userService.getTeacherSelect(),
        });

        // Create teacher profile
        await prisma.teacherProfile.create({
          data: {
            userId: user.id,
            designation: request.designation?.trim() || null,
            highestQualification: request.highestQualification?.trim() || "",
            university: request.university?.trim() || "",
            yearOfPassing: request.yearOfPassing ? parseInt(request.yearOfPassing) : 0,
            grade: request.grade?.trim() || "",
            subjects: request.subjects?.trim() || null,
            transportId: request.transportId || null,
            panCardNumber: panCardNormalized,
            bloodGroup: request.bloodGroup || null,
            basicSalary:
              request.basicSalary !== undefined && request.basicSalary !== ""
                ? Number(request.basicSalary)
                : null,
            createdBy: currentUser.id,
          },
        });

        user = await prisma.user.findFirst({
          where: { id: user.id },
          select: userService.getTeacherSelect(),
        });
      }

      // Attach file URLs + class-teacher assignments (usually empty right after create)
      const usersWithUrls = await userService.attachFileURLs([user]);
      await userService.attachClassTeacherAssignments(
        usersWithUrls,
        currentUser.schoolId,
      );
      await userService.attachTeacherListMetrics(usersWithUrls, currentUser.schoolId);

      // Consolidated SMTP welcome email with login credentials on every creation
      try {
        if (user.email && !user.email.includes("@placeholder.schooliat.local")) {
          await emailService.sendAccountWelcomeEmail({
            to: user.email,
            name: `${user.firstName} ${user.lastName || ""}`.trim(),
            schoolName: school.name,
            loginId: user.publicUserId,
            loginEmail: user.email,
            password: generatedPassword,
          });
        }
      } catch (emailErr) {
        logger.warn({ err: emailErr, userId: user.id }, "Teacher created but welcome email failed");
      }

      return res.status(201).json({
        message: "Teacher created!",
        data: {
          ...withTeacherSubjects(usersWithUrls[0]),
          password: generatedPassword,
          customRole: customRole
            ? { id: customRole.id, name: customRole.name, displayName: customRole.displayName }
            : null,
          permissions: additivePermissions,
        },
      });
    } catch (error) {
      if (error.code === "P2002") {
        const field = parseUniqueConstraintField(error);
        if (field === "publicUserId") {
          return res.status(400).json({
            errorCode: "TEACHER_LOGIN_ID_UNIQUE",
            message: manualLoginIdRequested
              ? `Login ID "${String(req.body.request?.publicUserId ?? "").trim()}" is already in use. Choose a different Login ID.`
              : "Login ID conflict while saving. Please try again, or set a custom Login ID in the form.",
          });
        }
        if (field === "aadhaarId") {
          return res.status(400).json({
            errorCode: "TEACHER_AADHAAR_UNIQUE",
            message: "Aadhaar ID already exists for another account.",
          });
        }
        return res.status(400).json({
          errorCode: "TEACHER_EMAIL_UNIQUE",
          message: "Email already exists for another account.",
        });
      }
      return res.status(400).json({
        message: error.message || "Failed to create teacher",
      });
    }
  },
);

// Get all teachers
router.get(
  "/teachers",
  withPermission(Permission.GET_TEACHERS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const pageNumber = parseInt(req.query.pageNumber ?? req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize ?? req.query.limit) || 15;

      const { academicYear } = req.query;
      const teacherRole = await roleService.getOrCreateRoleByName(RoleName.TEACHER);

      const where = {
        schoolId: currentUser.schoolId,
        roleId: teacherRole.id,
        deletedAt: null,
        deletedBy: null,
      };

      // Apply academic year filter if provided
      if (academicYear && typeof academicYear === "string") {
        const parts = academicYear.split("-");
        if (parts.length === 2) {
          const startYear = parseInt(parts[0], 10);
          const endYearShort = parseInt(parts[1], 10);
          const endYear = endYearShort < 100 ? 2000 + endYearShort : endYearShort;
          if (!isNaN(startYear) && !isNaN(endYear)) {
            where.createdAt = {
              gte: new Date(`${startYear}-04-01T00:00:00.000Z`),
              lte: new Date(`${endYear}-03-31T23:59:59.999Z`),
            };
          }
        }
      }

      const teachers = await prisma.user.findMany({
        where,
        select: userService.getTeacherSelect(),
        ...paginateUtil.getPaginationParams(req),
        orderBy: { createdAt: "desc" },
      });

      const totalCount = await prisma.user.count({ where });

      // Attach file URLs + classes where this user is assigned as class teacher (classes.class_teacher_id)
      const teachersWithUrls = await userService.attachFileURLs(teachers);
      await userService.attachClassTeacherAssignments(
        teachersWithUrls,
        currentUser.schoolId,
      );
      await userService.attachTeacherListMetrics(teachersWithUrls, currentUser.schoolId);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNext = pageNumber < totalPages;

      return res.json({
        message: "Teachers fetched!",
        data: mapTeachersWithSubjects(teachersWithUrls),
        totalPages,
        hasNext,
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to fetch teachers");
      return res.status(500).json({
        message:
          "Failed to fetch teachers. Please verify role setup and school context, then retry.",
      });
    }
  },
);

// Export all teachers as CSV — MUST be registered before GET /teachers/:id or "export" is matched as :id
router.get(
  "/teachers/export",
  withPermission(Permission.GET_TEACHERS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;

      const teacherRole = await roleService.getOrCreateRoleByName(RoleName.TEACHER);
      if (!teacherRole) {
        return res.status(404).json({ message: "Teacher role not found!" });
      }

      const teachers = await prisma.user.findMany({
        where: {
          schoolId: currentUser.schoolId,
          roleId: teacherRole.id,
          deletedAt: null,
        },
        select: {
          publicUserId: true,
          firstName: true,
          lastName: true,
          email: true,
          contact: true,
          gender: true,
          dateOfBirth: true,
          aadhaarId: true,
          teacherProfile: {
            select: {
              designation: true,
              highestQualification: true,
              university: true,
              panCardNumber: true,
              bloodGroup: true,
              basicSalary: true,
              subjects: true,
            },
          },
        },
        orderBy: { firstName: "asc" },
      });

      const headers = [
        "Teacher ID", "First Name", "Last Name", "Email", "Contact",
        "Gender", "Date of Birth", "Designation", "Qualification",
        "University", "Subjects", "Aadhaar", "PAN", "Blood Group", "Basic Salary"
      ];

      const rows = teachers.map((t) => [
        t.publicUserId || "",
        t.firstName,
        t.lastName || "",
        t.email,
        t.contact || "",
        t.gender || "",
        t.dateOfBirth ? new Date(t.dateOfBirth).toLocaleDateString("en-IN") : "",
        t.teacherProfile?.designation || "",
        t.teacherProfile?.highestQualification || "",
        t.teacherProfile?.university || "",
        t.teacherProfile?.subjects || "",
        t.aadhaarId || "",
        t.teacherProfile?.panCardNumber || "",
        t.teacherProfile?.bloodGroup || "",
        t.teacherProfile?.basicSalary != null ? String(t.teacherProfile.basicSalary) : "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=all_teachers.csv");
      return res.send(csvContent);
    } catch (error) {
      logger.error({ err: error }, "Failed to export teachers");
      return res.status(400).json({
        message: error.message || "Failed to export teachers",
      });
    }
  },
);

// Get teacher by ID
router.get(
  "/teachers/:id",
  withPermission(Permission.GET_TEACHERS),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const teacherRole = await roleService.getOrCreateRoleByName(RoleName.TEACHER);

      const teacher = await prisma.user.findFirst({
        where: {
          id,
          schoolId: currentUser.schoolId,
          roleId: teacherRole.id,
          deletedAt: null,
          deletedBy: null,
        },
        select: userService.getTeacherSelect(),
      });

      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found!" });
      }

      // Attach file URLs + class-teacher assignments from Class rows
      const teachersWithUrls = await userService.attachFileURLs([teacher]);
      await userService.attachClassTeacherAssignments(
        teachersWithUrls,
        currentUser.schoolId,
      );
      await userService.attachTeacherListMetrics(teachersWithUrls, currentUser.schoolId);

      return res.json({
        message: "Teacher fetched!",
        data: withTeacherSubjects(teachersWithUrls[0]),
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch teacher",
      });
    }
  },
);

// Update teacher
router.patch(
  "/teachers/:id",
  withPermission(Permission.EDIT_TEACHER),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request || {};
      const currentUser = req.context.user;

      const teacherRole = await roleService.getOrCreateRoleByName(RoleName.TEACHER);

      // Check if teacher exists
      const existingTeacher = await prisma.user.findFirst({
        where: {
          id,
          schoolId: currentUser.schoolId,
          roleId: teacherRole.id,
          deletedAt: null,
          deletedBy: null,
        },
      });

      if (!existingTeacher) {
        return res.status(404).json({ message: "Teacher not found!" });
      }

      // Build update data
      const userUpdateData = {
        updatedBy: currentUser.id,
      };

      if (request.firstName !== undefined)
        userUpdateData.firstName = request.firstName.trim();
      if (request.lastName !== undefined)
        userUpdateData.lastName = request.lastName.trim();
      if (request.email !== undefined)
        userUpdateData.email = request.email.trim().toLowerCase();
      if (request.contact !== undefined)
        userUpdateData.contact = request.contact.trim();
      if (request.gender !== undefined) userUpdateData.gender = request.gender;
      if (request.dateOfBirth !== undefined)
        userUpdateData.dateOfBirth = new Date(request.dateOfBirth);
      if (request.address !== undefined) userUpdateData.address = request.address;
      if (request.aadhaarId !== undefined)
        userUpdateData.aadhaarId = request.aadhaarId?.trim() || null;
      if (request.registrationPhotoId !== undefined)
        userUpdateData.registrationPhotoId = request.registrationPhotoId || null;
      if (request.idPhotoId !== undefined)
        userUpdateData.idPhotoId = request.idPhotoId || null;

      // Update user row
      await prisma.user.update({
        where: { id },
        data: userUpdateData,
      });

      // Update teacher profile
      const profileUpdateData = {};
      if (request.designation !== undefined)
        profileUpdateData.designation = request.designation?.trim() || null;
      if (request.highestQualification !== undefined)
        profileUpdateData.highestQualification =
          request.highestQualification?.trim() || null;
      if (request.university !== undefined)
        profileUpdateData.university = request.university?.trim() || null;
      if (request.yearOfPassing !== undefined) {
        const raw = request.yearOfPassing;
        if (raw === null || raw === "") {
          profileUpdateData.yearOfPassing = null;
        } else {
          const n =
            typeof raw === "number" ? raw : parseInt(String(raw).trim(), 10);
          profileUpdateData.yearOfPassing = Number.isFinite(n) ? n : null;
        }
      }
      if (request.grade !== undefined)
        profileUpdateData.grade = request.grade?.trim() || null;
      if (request.transportId !== undefined)
        profileUpdateData.transportId = request.transportId || null;
      if (request.panCardNumber !== undefined)
        profileUpdateData.panCardNumber = request.panCardNumber?.trim() || null;
      if (request.bloodGroup !== undefined)
        profileUpdateData.bloodGroup = request.bloodGroup || null;
      if (request.basicSalary !== undefined)
        profileUpdateData.basicSalary = request.basicSalary !== "" && request.basicSalary !== null ? Number(request.basicSalary) : null;
      if (request.subjects !== undefined)
        profileUpdateData.subjects = request.subjects?.trim() || null;

      if (Object.keys(profileUpdateData).length > 0) {
        await prisma.teacherProfile.update({
          where: { userId: id },
          data: profileUpdateData,
        });
      }

      const refreshed = await prisma.user.findFirst({
        where: { id },
        select: userService.getTeacherSelect(),
      });

      // Attach file URLs + class-teacher assignments
      const usersWithUrls = await userService.attachFileURLs([refreshed]);
      await userService.attachClassTeacherAssignments(
        usersWithUrls,
        currentUser.schoolId,
      );
      await userService.attachTeacherListMetrics(usersWithUrls, currentUser.schoolId);

      return res.json({
        message: "Teacher updated!",
        data: withTeacherSubjects(usersWithUrls[0]),
      });
    } catch (error) {
      if (error.code === "P2002") {
        const field = parseUniqueConstraintField(error);
        if (field === "aadhaarId") {
          return res.status(400).json({
            errorCode: "TEACHER_AADHAAR_UNIQUE",
            message: "This Aadhaar number is already registered to another account.",
          });
        }
        if (field === "publicUserId") {
          return res.status(400).json({
            errorCode: "TEACHER_LOGIN_ID_UNIQUE",
            message: "Login ID conflict while saving. Please try again in a moment.",
          });
        }
        if (field === "email") {
          return res.status(400).json({
            errorCode: "TEACHER_EMAIL_UNIQUE",
            message:
              "Email is already in use by another account. Choose a different email address.",
          });
        }
        return res.status(400).json({
          errorCode: "TEACHER_UNIQUE_CONSTRAINT",
          message: "This value conflicts with another account. Check email, login ID, or Aadhaar.",
        });
      }
      return res.status(400).json({
        message: error.message || "Failed to update teacher",
      });
    }
  },
);

// Bulk delete teachers (single OTP for entire batch)
router.post(
  "/teachers/bulk-delete",
  withPermission(Permission.DELETE_TEACHER),
  validateRequest(bulkDeleteTeachersSchema),
  async (req, res) => {
    try {
      const { otp, teacherIds } = req.body.request;
      const currentUser = req.context.user;
      const recipient = await resolveDeletionOtpRecipientEmail(currentUser);
      if (!recipient) {
        return res.status(400).json({ message: "No email available for deletion verification" });
      }
      const ok = await otpDeletionService.verifyDeletionOTP({
        otpRecipientEmail: recipient,
        otpCode: String(otp).trim(),
        entityType: "Teacher",
        entityId: `bulk:${teacherIds.length}`,
      });
      if (!ok) {
        return res.status(403).json({
          message:
            "Invalid or expired OTP. Request a new verification code and try again.",
          errorCode: "DELETION_OTP_INVALID",
        });
      }

      const teacherRole = await roleService.getOrCreateRoleByName(RoleName.TEACHER);
      const result = await prisma.user.updateMany({
        where: {
          id: { in: teacherIds },
          schoolId: currentUser.schoolId,
          roleId: teacherRole.id,
          deletedAt: null,
          deletedBy: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.json({
        message: `${result.count} teacher(s) deleted`,
        data: { count: result.count },
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to bulk delete teachers",
      });
    }
  },
);

// Delete teacher
router.delete(
  "/teachers/:id",
  withPermission(Permission.DELETE_TEACHER),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "Teacher" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const teacherRole = await roleService.getOrCreateRoleByName(RoleName.TEACHER);

      const existingTeacher = await prisma.user.findFirst({
        where: {
          id,
          schoolId: currentUser.schoolId,
          roleId: teacherRole.id,
          deletedAt: null,
          deletedBy: null,
        },
      });

      if (!existingTeacher) {
        return res.status(404).json({ message: "Teacher not found!" });
      }

      await prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.json({ message: "Teacher deleted!" });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete teacher",
      });
    }
  },
);

// ============================================
// STAFF ENDPOINTS
// ============================================

// Create staff
router.post(
  "/staff",
  withPermission(Permission.CREATE_STAFF),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      // Validate school exists
      const school = await prisma.school.findUnique({
        where: { id: currentUser.schoolId },
      });

      if (!school) {
        return res.status(404).json({ message: "School not found!" });
      }

      // Get staff role
      const staffRole = await roleService.getRoleByName(RoleName.STAFF);

      const emailNormalized = String(request.email || "").trim().toLowerCase();
      if (!emailNormalized) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Generate password
      const generatedPassword = stringUtil.generateRandomString(15);

      // Profile Photo
      let registrationPhotoId = null;
      if (req.body.request.registrationPhotoId) {
        registrationPhotoId = req.body.request.registrationPhotoId;
      }

      // Generate or use provided Login ID (same allocation strategy as teachers: max suffix + retry)
      const manualPublicUserId = String(req.body.request?.publicUserId ?? "").trim();
      let publicUserId;
      if (manualPublicUserId) {
        const existingIdUser = await prisma.user.findFirst({
          where: { publicUserId: manualPublicUserId },
        });
        if (existingIdUser) {
          return res.status(400).json({
            message: `Login ID "${manualPublicUserId}" is already in use. Choose a different Login ID.`,
          });
        }
        publicUserId = manualPublicUserId;
      } else {
        publicUserId = await allocateStaffPublicUserId(school.code, school.id, staffRole.id);
      }

      // Optional inline custom role assignment (same semantics as teachers)
      const customRoleId = request.customRoleId || null;
      let customRole = null;
      let additivePermissions = [];
      if (customRoleId) {
        customRole = await prisma.customRole.findFirst({
          where: {
            id: customRoleId,
            deletedAt: null,
            OR: [{ schoolId: currentUser.schoolId }, { schoolId: null }],
          },
          select: { id: true, name: true, displayName: true, permissions: true },
        });
        if (!customRole) {
          return res.status(400).json({ message: "Selected custom role was not found" });
        }
        additivePermissions = customRole.permissions || [];
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          publicUserId,
          email: emailNormalized,
          password: await bcryptjs.hash(generatedPassword, 10),
          firstName: request.firstName.trim(),
          lastName: request.lastName?.trim() || "",
          contact: request.contact.trim(),
          gender: request.gender,
          dateOfBirth: new Date(request.dateOfBirth),
          address: request.address || [],
          aadhaarId: request.aadhaarId?.trim() || null,
          userType: UserType.SCHOOL,
          roleId: staffRole.id,
          schoolId: currentUser.schoolId,
          registrationPhotoId: registrationPhotoId || null,
          idPhotoId: request.idPhotoId || null,
          permissions: additivePermissions,
          ...(customRoleId ? { customRoleId } : {}),
          createdBy: currentUser.id,
        },
        select: userService.getStaffSelect(),
      });

      // Create staff profile
      await prisma.staffProfile.create({
        data: {
          userId: user.id,
          designation: request.designation?.trim() || null,
          basicSalary: request.basicSalary !== undefined && request.basicSalary !== "" ? Number(request.basicSalary) : null,
          createdBy: currentUser.id,
        },
      });

      // Attach file URLs
      const usersWithUrls = await userService.attachFileURLs([user]);

      // Consolidated SMTP welcome email with login credentials on every creation
      try {
        if (user.email && !user.email.includes("@placeholder.schooliat.local")) {
          await emailService.sendAccountWelcomeEmail({
            to: user.email,
            name: `${user.firstName} ${user.lastName || ""}`.trim(),
            schoolName: school.name,
            loginId: user.publicUserId,
            loginEmail: user.email,
            password: generatedPassword,
          });
        }
      } catch (emailErr) {
        logger.warn({ err: emailErr, userId: user.id }, "Staff created but welcome email failed");
      }

      return res.status(201).json({
        message: "Staff member created!",
        data: {
          ...usersWithUrls[0],
          password: generatedPassword,
          customRole: customRole
            ? { id: customRole.id, name: customRole.name, displayName: customRole.displayName }
            : null,
          permissions: additivePermissions,
        },
      });
    } catch (error) {
      if (error.code === "P2002") {
        const field = parseUniqueConstraintField(error);
        if (field === "publicUserId") {
          return res.status(400).json({
            errorCode: "STAFF_LOGIN_ID_UNIQUE",
            message: String(req.body.request?.publicUserId ?? "").trim()
              ? `Login ID "${String(req.body.request.publicUserId).trim()}" is already in use. Choose a different Login ID.`
              : "Login ID conflict while saving. Please try again, or set a custom Login ID in the form.",
          });
        }
        if (field === "aadhaarId") {
          return res.status(400).json({
            errorCode: "STAFF_AADHAAR_UNIQUE",
            message: "Aadhaar ID already exists for another account.",
          });
        }
        return res.status(400).json({
          errorCode: "STAFF_EMAIL_UNIQUE",
          message: "Email already exists for another account.",
        });
      }
      return res.status(400).json({
        message: error.message || "Failed to create staff member",
      });
    }
  },
);

// Get all staff
router.get(
  "/staff",
  withPermission(Permission.GET_STAFF),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const pageNumber = parseInt(req.query.pageNumber) || 1;
      const pageSize = parseInt(req.query.pageSize) || 15;

      const { academicYear } = req.query;
      const staffRole = await roleService.getRoleByName(RoleName.STAFF);

      const where = {
        schoolId: currentUser.schoolId,
        roleId: staffRole.id,
        deletedAt: null,
        deletedBy: null,
      };

      // Apply academic year filter if provided
      if (academicYear && typeof academicYear === "string") {
        const parts = academicYear.split("-");
        if (parts.length === 2) {
          const startYear = parseInt(parts[0], 10);
          const endYearShort = parseInt(parts[1], 10);
          const endYear = endYearShort < 100 ? 2000 + endYearShort : endYearShort;
          if (!isNaN(startYear) && !isNaN(endYear)) {
            where.createdAt = {
              gte: new Date(`${startYear}-04-01T00:00:00.000Z`),
              lte: new Date(`${endYear}-03-31T23:59:59.999Z`),
            };
          }
        }
      }

      const staff = await prisma.user.findMany({
        where,
        select: userService.getStaffSelect(),
        ...paginateUtil.getPaginationParams(req),
        orderBy: { createdAt: "desc" },
      });

      const totalCount = await prisma.user.count({ where });

      // Attach file URLs + list metrics (attendance %, salary — same model as teachers)
      const staffWithUrls = await userService.attachFileURLs(staff);
      await userService.attachStaffListMetrics(staffWithUrls, currentUser.schoolId);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNext = pageNumber < totalPages;

      return res.json({
        message: "Staff members fetched!",
        data: staffWithUrls,
        totalPages,
        hasNext,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch staff members",
      });
    }
  },
);

// Get staff by ID
router.get(
  "/staff/:id",
  withPermission(Permission.GET_STAFF),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const staffRole = await roleService.getRoleByName(RoleName.STAFF);

      const staffMember = await prisma.user.findFirst({
        where: {
          id,
          schoolId: currentUser.schoolId,
          roleId: staffRole.id,
          deletedAt: null,
          deletedBy: null,
        },
        select: userService.getStaffSelect(),
      });

      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found!" });
      }

      // Attach file URLs + metrics (attendance, salary)
      const usersWithUrls = await userService.attachFileURLs([staffMember]);
      await userService.attachStaffListMetrics(usersWithUrls, currentUser.schoolId);

      return res.json({
        message: "Staff member fetched!",
        data: usersWithUrls[0],
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch staff member",
      });
    }
  },
);

// Update staff
router.patch(
  "/staff/:id",
  withPermission(Permission.EDIT_STAFF),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request || {};
      const currentUser = req.context.user;

      const staffRole = await roleService.getRoleByName(RoleName.STAFF);

      // Check if staff member exists
      const existingStaff = await prisma.user.findFirst({
        where: {
          id,
          schoolId: currentUser.schoolId,
          roleId: staffRole.id,
          deletedAt: null,
          deletedBy: null,
        },
      });

      if (!existingStaff) {
        return res.status(404).json({ message: "Staff member not found!" });
      }

      // Build update data
      const userUpdateData = {
        updatedBy: currentUser.id,
      };

      if (request.firstName !== undefined)
        userUpdateData.firstName = request.firstName.trim();
      if (request.lastName !== undefined)
        userUpdateData.lastName = request.lastName.trim();
      if (request.email !== undefined)
        userUpdateData.email = String(request.email).trim().toLowerCase();
      if (request.contact !== undefined)
        userUpdateData.contact = request.contact.trim();
      if (request.gender !== undefined) userUpdateData.gender = request.gender;
      if (request.dateOfBirth !== undefined)
        userUpdateData.dateOfBirth = new Date(request.dateOfBirth);
      if (request.address !== undefined) userUpdateData.address = request.address;
      if (request.aadhaarId !== undefined)
        userUpdateData.aadhaarId = request.aadhaarId?.trim() || null;
      if (request.registrationPhotoId !== undefined)
        userUpdateData.registrationPhotoId = request.registrationPhotoId || null;
      if (request.idPhotoId !== undefined)
        userUpdateData.idPhotoId = request.idPhotoId || null;

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: userUpdateData,
        select: userService.getStaffSelect(),
      });

      // Update staff profile
      const profileUpdateData = {};
      if (request.designation !== undefined)
        profileUpdateData.designation = request.designation?.trim() || null;
      if (request.basicSalary !== undefined)
        profileUpdateData.basicSalary = request.basicSalary !== "" && request.basicSalary !== null ? Number(request.basicSalary) : null;

      if (Object.keys(profileUpdateData).length > 0) {
        await prisma.staffProfile.upsert({
          where: { userId: id },
          update: profileUpdateData,
          create: {
            userId: id,
            ...profileUpdateData,
            createdBy: currentUser.id
          }
        });
      }

      // Attach file URLs
      const usersWithUrls = await userService.attachFileURLs([updatedUser]);

      return res.json({
        message: "Staff member updated!",
        data: usersWithUrls[0],
      });
    } catch (error) {
      if (error.code === "P2002") {
        const field = parseUniqueConstraintField(error);
        if (field === "publicUserId") {
          return res.status(400).json({
            errorCode: "STAFF_LOGIN_ID_UNIQUE",
            message: "Login ID already exists for another account.",
          });
        }
        if (field === "aadhaarId") {
          return res.status(400).json({
            errorCode: "STAFF_AADHAAR_UNIQUE",
            message: "Aadhaar ID already exists for another account.",
          });
        }
        return res.status(400).json({
          errorCode: "STAFF_EMAIL_UNIQUE",
          message: "Email already exists for another account.",
        });
      }
      return res.status(400).json({
        message: error.message || "Failed to update staff member",
      });
    }
  },
);

// Lightweight user list for the role-assignment picker (school-scoped; all users for super admin)
router.get(
  "/picker",
  withPermission(Permission.GET_USERS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const search = String(req.query.search || "").trim();
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);

      const where = { deletedAt: null, deletedBy: null };
      if (currentUser.schoolId) where.schoolId = currentUser.schoolId;

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { publicUserId: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          publicUserId: true,
          email: true,
          userType: true,
          roleId: true,
          role: { select: { id: true, name: true } },
          school: { select: { id: true, name: true } },
        },
      });

      return res.status(200).json({ message: "Users retrieved", data: users });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch users" });
    }
  },
);

// Bulk delete staff (single OTP)
router.post(
  "/staff/bulk-delete",
  withPermission(Permission.DELETE_STAFF),
  validateRequest(bulkDeleteStaffSchema),
  async (req, res) => {
    try {
      const { otp, staffIds } = req.body.request;
      const currentUser = req.context.user;
      const recipient = await resolveDeletionOtpRecipientEmail(currentUser);
      if (!recipient) {
        return res.status(400).json({ message: "No email available for deletion verification" });
      }
      const ok = await otpDeletionService.verifyDeletionOTP({
        otpRecipientEmail: recipient,
        otpCode: String(otp).trim(),
        entityType: "Staff",
        entityId: `bulk:${staffIds.length}`,
      });
      if (!ok) {
        return res.status(403).json({
          message:
            "Invalid or expired OTP. Request a new verification code and try again.",
          errorCode: "DELETION_OTP_INVALID",
        });
      }

      const staffRole = await roleService.getRoleByName(RoleName.STAFF);
      const result = await prisma.user.updateMany({
        where: {
          id: { in: staffIds },
          schoolId: currentUser.schoolId,
          roleId: staffRole.id,
          deletedAt: null,
          deletedBy: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.json({
        message: `${result.count} staff member(s) deleted`,
        data: { count: result.count },
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to bulk delete staff",
      });
    }
  },
);

// Delete staff
router.delete(
  "/staff/:id",
  withPermission(Permission.DELETE_STAFF),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "Staff" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const staffRole = await roleService.getRoleByName(RoleName.STAFF);

      const existingStaff = await prisma.user.findFirst({
        where: {
          id,
          schoolId: currentUser.schoolId,
          roleId: staffRole.id,
          deletedAt: null,
          deletedBy: null,
        },
      });

      if (!existingStaff) {
        return res.status(404).json({ message: "Staff member not found!" });
      }

      await prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.json({ message: "Staff member deleted!" });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete staff member",
      });
    }
  },
);

// ============================================
// STUDENT ENDPOINTS
// ============================================

// Create student
router.post(
  "/students",
  withPermission(Permission.CREATE_STUDENT),
  validateRequest(createStudentSchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      // Validate school exists
      const school = await prisma.school.findUnique({
        where: { id: currentUser.schoolId },
      });

      if (!school) {
        return res.status(404).json({ message: "School not found!" });
      }

      // Validate class exists
      if (request.classId) {
        const classEntity = await prisma.class.findFirst({
          where: {
            id: request.classId,
            schoolId: currentUser.schoolId,
            deletedAt: null,
            deletedBy: null,
          },
        });

        if (!classEntity) {
          return res.status(404).json({ message: "Class not found!" });
        }
      }

      // Validate transport exists if provided
      if (request.transportId) {
        const transport = await prisma.transport.findFirst({
          where: {
            id: request.transportId,
            schoolId: currentUser.schoolId,
            deletedAt: null,
            deletedBy: null,
          },
        });

        if (!transport) {
          return res.status(404).json({ message: "Transport not found!" });
        }
      }

      // Get student role
      const studentRole = await roleService.getOrCreateRoleByName(RoleName.STUDENT);

      // Generate password
      const generatedPassword = stringUtil.generateRandomString(15);

      const emailTrimmed = String(request.email ?? "")
        .trim()
        .toLowerCase();
      // Email is mandatory for admission (post-admission communication + login)
      if (!emailTrimmed) {
        return res.status(400).json({
          message: "Email is required for admission. It is used for login and post-admission communication.",
        });
      }
      const emailForUser = emailTrimmed;

      const normalizedRequest = {
        ...request,
        email: emailForUser,
        firstName: String(request.firstName || "").trim(),
        lastName: String(request.lastName || "").trim(),
        contact: String(request.contact || "").trim(),
        address: normalizeAddressLines(request.address),
        aadhaarId: normalizeNullableTrim(request.aadhaarId),
        apaarId: normalizeNullableTrim(request.apaarId),
        fatherName: String(request.fatherName || "").trim(),
        motherName: String(request.motherName || "").trim(),
        fatherContact: String(request.fatherContact || "").trim(),
        motherContact: String(request.motherContact || "").trim(),
        fatherOccupation: normalizeNullableTrim(request.fatherOccupation),
        annualIncome: normalizeNullableTrim(request.annualIncome),
      };

      let user = null;
      let lastCreateError = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const publicUserId = await generateStudentPublicUserId({
          schoolId: currentUser.schoolId,
          roleId: studentRole.id,
          schoolCode: school.code,
          attempt,
        });
        try {
          user = await prisma.user.create({
            data: {
              email: emailForUser,
              password: await bcryptjs.hash(generatedPassword, 10),
              firstName: normalizedRequest.firstName,
              lastName: normalizedRequest.lastName,
              contact: normalizedRequest.contact,
              gender: normalizedRequest.gender,
              dateOfBirth: new Date(normalizedRequest.dateOfBirth),
              address: normalizedRequest.address,
              aadhaarId: normalizedRequest.aadhaarId,
              userType: UserType.SCHOOL,
              roleId: studentRole.id,
              schoolId: currentUser.schoolId,
              publicUserId,
              registrationPhotoId: normalizedRequest.registrationPhotoId || null,
              idPhotoId: normalizedRequest.idPhotoId || null,
              createdBy: currentUser.id,
            },
            select: userService.getStudentSelect(),
          });
          break;
        } catch (createErr) {
          lastCreateError = createErr;
          if (
            createErr?.code === "P2002" &&
            parseUniqueConstraintField(createErr) === "publicUserId"
          ) {
            continue;
          }
          throw createErr;
        }
      }
      if (!user) throw lastCreateError || new Error("Failed to create student user");

      // Create student profile
      const requestedRoll = parseRollNumberFromValue(normalizedRequest.rollNumber);
      const rollNumber =
        requestedRoll > 0
          ? requestedRoll
          : await rollNumberService.getNextRollNumberForClass(normalizedRequest.classId);

      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          rollNumber,
          apaarId: normalizedRequest.apaarId,
          classId: normalizedRequest.classId,
          transportId: normalizedRequest.transportId || null,
          fatherName: normalizedRequest.fatherName,
          motherName: normalizedRequest.motherName,
          fatherContact: normalizedRequest.fatherContact,
          motherContact: normalizedRequest.motherContact,
          fatherOccupation: normalizedRequest.fatherOccupation,
          annualIncome: normalizedRequest.annualIncome
            ? Number.parseFloat(normalizedRequest.annualIncome)
            : null,
          accommodationType: normalizedRequest.accommodationType || "DAY_SCHOLAR",
          bloodGroup: normalizedRequest.bloodGroup || null,
          previousSchoolName: normalizedRequest.previousSchoolName || null,
          previousSchoolBoard: normalizedRequest.previousSchoolBoard || null,
          previousClassAttended: normalizedRequest.previousClassAttended || null,
          previousYearOfLeaving: normalizedRequest.previousYearOfLeaving || null,
          previousSchoolTcNumber: normalizedRequest.previousSchoolTcNumber || null,
          createdBy: currentUser.id,
        },
      });

      await rollNumberService.logRollNumberChange({
        studentUserId: user.id,
        classId: normalizedRequest.classId,
        oldRollNumber: null,
        newRollNumber: rollNumber,
        action: requestedRoll > 0 ? "MANUAL_OVERRIDE" : "AUTO_ASSIGNED",
        changedBy: currentUser.id,
      });

      try {
        await feeService.createFeeInstallementsForStudent(
          user.id,
          currentUser.schoolId,
          currentUser.id,
        );
      } catch (feeErr) {
        logger.warn(
          { err: feeErr, studentId: user.id },
          "Fee installments not created after student create",
        );
      }

      // Auto-send admission confirmation email to parent (with credentials + admission form PDF)
      try {
        if (user.email && !user.email.includes("@placeholder.schooliat.local")) {
          const school = await prisma.school.findUnique({ where: { id: currentUser.schoolId }, select: { name: true } });
          const classLabel = request.classId
            ? (await prisma.class.findUnique({ where: { id: request.classId }, select: { grade: true, division: true } }))
            : null;

          let admissionFormBuffer = null;
          try {
            const fullForPdf = await prisma.user.findFirst({
              where: { id: user.id },
              select: userService.getStudentSelect(),
            });
            const withSchool = { ...fullForPdf, school: school ?? null };
            admissionFormBuffer = await admissionFormService.renderAdmissionFormPdf({ student: withSchool });
          } catch (pdfErr) {
            logger.warn({ err: pdfErr, studentId: user.id }, "Admission form PDF generation failed for welcome email");
          }

          await emailService.sendAccountWelcomeEmail({
            to: user.email,
            name: `${user.firstName} ${user.lastName || ""}`.trim(),
            schoolName: school?.name || "",
            loginId: user.publicUserId,
            loginEmail: user.email,
            password: generatedPassword,
            attachments: admissionFormBuffer
              ? [
                  {
                    filename: admissionFormName || `Admission-Form-${user.publicUserId || ""}.pdf`,
                    content: admissionFormBuffer,
                    contentType: "application/pdf",
                  },
                ]
              : [],
          });
        }
      } catch (emailErr) {
        logger.warn({ err: emailErr, studentId: user.id }, "Student created but welcome email failed");
      }

      const fullUser = await prisma.user.findFirst({
        where: { id: user.id },
        select: userService.getStudentSelect(),
      });
      if (!fullUser) {
        return res.status(500).json({ message: "Student was created but could not be loaded." });
      }
      // Attach file URLs + list metrics (profile + fee exist only after steps above)
      const usersWithUrls = await userService.attachFileURLs([fullUser]);
      await userService.attachStudentListMetrics(usersWithUrls, currentUser.schoolId);

      return res.status(201).json({
        message: "Student created!",
        data: { ...usersWithUrls[0], password: generatedPassword },
      });
    } catch (error) {
      if (error.code === "P2002") {
        const field = parseUniqueConstraintField(error);
        return res.status(400).json({
          message:
            field === "email"
              ? "This email is already registered to another user. Use a different email or leave email blank to auto-generate a school login ID."
              : field === "aadhaarId"
                ? "Aadhaar ID already exists!"
                : field === "apaarId"
                  ? "APAAR ID already exists for another student."
                  : field === "publicUserId"
                    ? "Student ID generation conflict, please retry."
                    : "A unique field already exists (email, Aadhaar, or APAAR).",
        });
      }
      return res.status(400).json({
        message: error.message || "Failed to create student",
      });
    }
  },
);

// Get all students
router.get(
  "/students",
  withPermission(Permission.GET_STUDENTS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 15;

      const { academicYear } = req.query;
      const studentRole = await roleService.getRoleByName(RoleName.STUDENT);

      const where = {
        schoolId: currentUser.schoolId,
        roleId: studentRole.id,
        deletedAt: null,
        deletedBy: null,
      };

      const { classId, gender } = req.query;

      if (classId && typeof classId === "string") {
        where.studentProfile = { classId };
      }

      if (gender && typeof gender === "string" && ["MALE", "FEMALE"].includes(gender.toUpperCase())) {
        where.gender = gender.toUpperCase();
      }

      // Apply academic year filter if provided
      if (academicYear && typeof academicYear === "string") {
        const parts = academicYear.split("-");
        if (parts.length === 2) {
          const startYear = parseInt(parts[0], 10);
          const endYearShort = parseInt(parts[1], 10);
          const endYear = endYearShort < 100 ? 2000 + endYearShort : endYearShort;
          if (!isNaN(startYear) && !isNaN(endYear)) {
            where.createdAt = {
              gte: new Date(`${startYear}-04-01T00:00:00.000Z`),
              lte: new Date(`${endYear}-03-31T23:59:59.999Z`),
            };
          }
        }
      }

      const students = await prisma.user.findMany({
        where,
        select: userService.getStudentSelect(),
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { studentProfile: { class: { grade: "asc" } } },
          { studentProfile: { class: { division: "asc" } } },
          { studentProfile: { rollNumber: "asc" } },
          { firstName: "asc" },
        ],
      });

      const totalCount = await prisma.user.count({ where });

      // Attach file URLs + list metrics (attendance %, transport label, fee status)
      const studentsWithUrls = await userService.attachFileURLs(students);
      await userService.attachStudentListMetrics(studentsWithUrls, currentUser.schoolId);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = page < totalPages;

      return res.json({
        message: "Students fetched!",
        data: studentsWithUrls,
        totalPages,
        hasNext,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch students",
      });
    }
  },
);

// Rearrange roll numbers of a class alphabetically (by first name). Reassigns sequential numbers.
router.post(
  "/students/roll-numbers/rearrange",
  withPermission(Permission.EDIT_STUDENT),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { classId, order } = req.body.request || req.body;
      if (!classId) {
        return res.status(400).json({ message: "classId is required" });
      }
      const classEntity = await prisma.class.findFirst({
        where: { id: classId, schoolId: currentUser.schoolId, deletedAt: null },
      });
      if (!classEntity) {
        return res.status(404).json({ message: "Class not found!" });
      }
      const result = await rollNumberService.rearrangeClassRollNumbers({
        classId,
        changedBy: currentUser.id,
        order,
      });
      return res.status(200).json({
        message: `Roll numbers rearranged for ${result.changes.length} student(s).`,
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to rearrange roll numbers",
      });
    }
  },
);

// Get roll number change history (filter by class or student)
router.get(
  "/students/roll-numbers/history",
  withPermission(Permission.GET_STUDENTS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { classId, studentUserId, page, limit } = req.query;
      if (classId) {
        const classEntity = await prisma.class.findFirst({
          where: { id: classId, schoolId: currentUser.schoolId, deletedAt: null },
        });
        if (!classEntity) return res.status(404).json({ message: "Class not found!" });
      }
      const result = await rollNumberService.getRollNumberHistory({
        classId,
        studentUserId,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      });
      return res.status(200).json({ message: "Roll number history fetched!", data: result });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch roll number history",
      });
    }
  },
);

router.get(
  "/students/export",
  withPermission(Permission.GET_STUDENTS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;

      const studentRole = await roleService.getOrCreateRoleByName(RoleName.STUDENT);
      if (!studentRole) {
        return res.status(404).json({ message: "Student role not found!" });
      }

      const students = await prisma.user.findMany({
        where: {
          schoolId: currentUser.schoolId,
          roleId: studentRole.id,
          deletedAt: null,
        },
        select: {
          publicUserId: true,
          firstName: true,
          lastName: true,
          email: true,
          contact: true,
          gender: true,
          dateOfBirth: true,
          aadhaarId: true,
          studentProfile: {
            select: {
              rollNumber: true,
              apaarId: true,
              fatherName: true,
              motherName: true,
              fatherContact: true,
              motherContact: true,
              bloodGroup: true,
              accommodationType: true,
              class: {
                select: { grade: true, division: true },
              },
            },
          },
        },
        orderBy: [
          { studentProfile: { class: { grade: "asc" } } },
          { studentProfile: { rollNumber: "asc" } },
        ],
      });

      const headers = [
        "Student ID", "Roll No", "First Name", "Last Name", "Email", "Contact",
        "Gender", "Date of Birth", "Class", "Division",
        "Father Name", "Father Contact", "Mother Name", "Mother Contact",
        "Aadhaar", "Apaar ID", "Blood Group", "Accommodation"
      ];

      const rows = students.map((s) => [
        s.publicUserId || "",
        s.studentProfile?.rollNumber || "",
        s.firstName,
        s.lastName || "",
        s.email,
        s.contact || "",
        s.gender || "",
        s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString("en-IN") : "",
        s.studentProfile?.class?.grade || "",
        s.studentProfile?.class?.division || "",
        s.studentProfile?.fatherName || "",
        s.studentProfile?.fatherContact || "",
        s.studentProfile?.motherName || "",
        s.studentProfile?.motherContact || "",
        s.aadhaarId || "",
        s.studentProfile?.apaarId || "",
        s.studentProfile?.bloodGroup || "",
        s.studentProfile?.accommodationType || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=all_students.csv");
      return res.send(csvContent);
    } catch (error) {
      logger.error({ err: error }, "Failed to export students");
      return res.status(400).json({
        message: error.message || "Failed to export students",
      });
    }
  },
);

// Get student by ID
router.get(
  "/students/:id",
  withPermission(Permission.GET_STUDENTS),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const studentRole = await roleService.getRoleByName(RoleName.STUDENT);

      const student = await prisma.user.findFirst({
        where: {
          id,
          schoolId: currentUser.schoolId,
          roleId: studentRole.id,
          deletedAt: null,
          deletedBy: null,
        },
        select: userService.getStudentSelect(),
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found!" });
      }

      // Attach file URLs + list metrics
      const studentsWithUrls = await userService.attachFileURLs([student]);
      await userService.attachStudentListMetrics(studentsWithUrls, currentUser.schoolId);

      return res.json({
        message: "Student fetched!",
        data: studentsWithUrls[0],
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch student",
      });
    }
  },
);

// Update student
router.patch(
  "/students/:id",
  withPermission(Permission.EDIT_STUDENT),
  validateRequest(updateStudentSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request || {};
      const currentUser = req.context.user;

      const studentRole = await roleService.getOrCreateRoleByName(RoleName.STUDENT);

      // Check if student exists
      const existingStudent = await prisma.user.findFirst({
        where: {
          id,
          schoolId: currentUser.schoolId,
          roleId: studentRole.id,
          deletedAt: null,
          deletedBy: null,
        },
        include: {
          studentProfile: true,
        },
      });

      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found!" });
      }

      // Validate class exists if provided
      if (request.classId && request.classId !== existingStudent.studentProfile?.classId) {
        const classEntity = await prisma.class.findFirst({
          where: {
            id: request.classId,
            schoolId: currentUser.schoolId,
            deletedAt: null,
            deletedBy: null,
          },
        });

        if (!classEntity) {
          return res.status(404).json({ message: "Class not found!" });
        }
      }

      // Validate transport exists if provided
      if (request.transportId && request.transportId !== existingStudent.studentProfile?.transportId) {
        const transport = await prisma.transport.findFirst({
          where: {
            id: request.transportId,
            schoolId: currentUser.schoolId,
            deletedAt: null,
            deletedBy: null,
          },
        });

        if (!transport) {
          return res.status(404).json({ message: "Transport not found!" });
        }
      }

      // Build update data
      const userUpdateData = {
        updatedBy: currentUser.id,
      };

      if (request.firstName !== undefined)
        userUpdateData.firstName = String(request.firstName).trim();
      if (request.lastName !== undefined)
        userUpdateData.lastName = String(request.lastName ?? "").trim();
      if (request.email !== undefined) {
        const nextEmail = String(request.email).trim().toLowerCase();
        if (nextEmail.length > 0) {
          userUpdateData.email = nextEmail;
        }
      }
      if (request.contact !== undefined)
        userUpdateData.contact = String(request.contact).trim();
      if (request.gender !== undefined) userUpdateData.gender = request.gender;
      if (request.dateOfBirth !== undefined)
        userUpdateData.dateOfBirth = new Date(request.dateOfBirth);
      if (request.address !== undefined)
        userUpdateData.address = normalizeAddressLines(request.address);
      if (request.aadhaarId !== undefined)
        userUpdateData.aadhaarId = normalizeNullableTrim(request.aadhaarId);
      if (request.registrationPhotoId !== undefined)
        userUpdateData.registrationPhotoId = request.registrationPhotoId || null;
      if (request.idPhotoId !== undefined)
        userUpdateData.idPhotoId = request.idPhotoId || null;

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: userUpdateData,
        select: userService.getStudentSelect(),
      });

      // Update student profile
      const profileUpdateData = {};
      const prevRoll = existingStudent.studentProfile?.rollNumber;
      const prevClassIdForRoll = existingStudent.studentProfile?.classId;
      if (request.rollNumber !== undefined) {
        profileUpdateData.rollNumber = parseRollNumberFromValue(request.rollNumber);
      }
      if (request.apaarId !== undefined)
        profileUpdateData.apaarId = normalizeNullableTrim(request.apaarId);
      if (request.classId !== undefined)
        profileUpdateData.classId = request.classId;
      if (request.transportId !== undefined)
        profileUpdateData.transportId = request.transportId || null;
      if (request.fatherName !== undefined)
        profileUpdateData.fatherName = String(request.fatherName ?? "").trim();
      if (request.motherName !== undefined)
        profileUpdateData.motherName = String(request.motherName ?? "").trim();
      if (request.fatherContact !== undefined)
        profileUpdateData.fatherContact = String(request.fatherContact ?? "").trim();
      if (request.motherContact !== undefined)
        profileUpdateData.motherContact = String(request.motherContact ?? "").trim();
      if (request.fatherOccupation !== undefined)
        profileUpdateData.fatherOccupation = normalizeNullableTrim(
          request.fatherOccupation,
        );
      if (request.annualIncome !== undefined)
        profileUpdateData.annualIncome = normalizeNullableTrim(request.annualIncome)
          ? Number.parseFloat(String(request.annualIncome).trim())
          : null;
      if (request.accommodationType !== undefined)
        profileUpdateData.accommodationType = request.accommodationType;
      if (request.bloodGroup !== undefined)
        profileUpdateData.bloodGroup = request.bloodGroup || null;
      if (request.previousSchoolName !== undefined)
        profileUpdateData.previousSchoolName = normalizeNullableTrim(request.previousSchoolName);
      if (request.previousSchoolBoard !== undefined)
        profileUpdateData.previousSchoolBoard = normalizeNullableTrim(request.previousSchoolBoard);
      if (request.previousClassAttended !== undefined)
        profileUpdateData.previousClassAttended = normalizeNullableTrim(request.previousClassAttended);
      if (request.previousYearOfLeaving !== undefined)
        profileUpdateData.previousYearOfLeaving = normalizeNullableTrim(request.previousYearOfLeaving);
      if (request.previousSchoolTcNumber !== undefined)
        profileUpdateData.previousSchoolTcNumber = normalizeNullableTrim(request.previousSchoolTcNumber);

      if (Object.keys(profileUpdateData).length > 0) {
        await prisma.studentProfile.update({
          where: { userId: id },
          data: profileUpdateData,
        });
      }

      // Log manual roll number override (or auto-assign when cleared to 0/empty)
      if (request.rollNumber !== undefined) {
        const nextRoll = profileUpdateData.rollNumber;
        const finalRoll =
          nextRoll > 0 ? nextRoll : await rollNumberService.getNextRollNumberForClass(
            request.classId ?? prevClassIdForRoll,
          );
        if (finalRoll !== prevRoll) {
          await prisma.studentProfile.update({
            where: { userId: id },
            data: { rollNumber: finalRoll, updatedBy: currentUser.id },
          });
          await rollNumberService.logRollNumberChange({
            studentUserId: id,
            classId: request.classId ?? prevClassIdForRoll,
            oldRollNumber: prevRoll,
            newRollNumber: finalRoll,
            action: nextRoll > 0 ? "MANUAL_OVERRIDE" : "AUTO_ASSIGNED",
            changedBy: currentUser.id,
          });
        }
      }

      const prevClassId = existingStudent.studentProfile?.classId;
      const classChanged =
        request.classId !== undefined && request.classId !== prevClassId;
      if (classChanged) {
        try {
          await feeService.rebuildUnpaidFeePlanForStudent(
            id,
            currentUser.schoolId,
            currentUser.id,
          );
        } catch (feeErr) {
          logger.warn(
            { err: feeErr, studentId: id },
            "Fee plan not rebuilt after class change",
          );
        }
      }

      // Re-fetch so studentProfile (transport, class, etc.) matches DB after profile update
      const refreshedStudent = await prisma.user.findFirst({
        where: { id },
        select: userService.getStudentSelect(),
      });
      if (!refreshedStudent) {
        return res.status(404).json({ message: "Student not found!" });
      }
      const usersWithUrls = await userService.attachFileURLs([refreshedStudent]);
      await userService.attachStudentListMetrics(usersWithUrls, currentUser.schoolId);

      // Notify parent that the admission form was updated (with the latest copy attached)
      const profileFieldsChanged = Object.keys(profileUpdateData).length > 0;
      const basicFieldsChanged = Object.keys(userUpdateData).some((k) => k !== "updatedBy");
      if (profileFieldsChanged || basicFieldsChanged) {
        try {
          if (refreshedStudent.email && !refreshedStudent.email.includes("@placeholder.schooliat.local")) {
            const schoolInfo = await prisma.school.findUnique({ where: { id: currentUser.schoolId }, select: { name: true } });
            let admissionFormBuffer = null;
            try {
              admissionFormBuffer = await admissionFormService.renderAdmissionFormPdf({
                student: { ...refreshedStudent, school: schoolInfo ?? null },
              });
            } catch (pdfErr) {
              logger.warn({ err: pdfErr, studentId: id }, "Admission form PDF generation failed for update email");
            }
            await emailService.sendAdmissionFormUpdatedEmail({
              to: refreshedStudent.email,
              studentName: `${refreshedStudent.firstName} ${refreshedStudent.lastName || ""}`.trim(),
              schoolName: schoolInfo?.name || "",
              loginEmail: refreshedStudent.email,
              publicUserId: refreshedStudent.publicUserId,
              updatedAt: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
              admissionFormBuffer,
              admissionFormName: `Admission-Form-${refreshedStudent.publicUserId || ""}-Updated.pdf`,
            });
          }
        } catch (emailErr) {
          logger.warn({ err: emailErr, studentId: id }, "Admission form updated email failed");
        }
      }

      return res.json({
        message: "Student updated!",
        data: usersWithUrls[0],
      });
    } catch (error) {
      if (error.code === "P2002") {
        const field = parseUniqueConstraintField(error);
        return res.status(400).json({
          message:
            field === "email"
              ? "Email already exists!"
              : field === "aadhaarId"
                ? "Aadhaar ID already exists!"
                : field === "apaarId"
                  ? "APAAR ID already exists!"
                  : "Email or Aadhaar ID already exists!",
        });
      }
      return res.status(400).json({
        message: error.message || "Failed to update student",
      });
    }
  },
);

// Bulk delete students (single OTP)
router.post(
  "/students/bulk-delete",
  withPermission(Permission.DELETE_STUDENT),
  validateRequest(bulkDeleteStudentsSchema),
  async (req, res) => {
    try {
      const { otp, studentIds } = req.body.request;
      const currentUser = req.context.user;
      const recipient = await resolveDeletionOtpRecipientEmail(currentUser);
      if (!recipient) {
        return res.status(400).json({ message: "No email available for deletion verification" });
      }
      const ok = await otpDeletionService.verifyDeletionOTP({
        otpRecipientEmail: recipient,
        otpCode: String(otp).trim(),
        entityType: "Student",
        entityId: `bulk:${studentIds.length}`,
      });
      if (!ok) {
        return res.status(403).json({
          message:
            "Invalid or expired OTP. Request a new verification code and try again.",
          errorCode: "DELETION_OTP_INVALID",
        });
      }

      const studentRole = await roleService.getRoleByName(RoleName.STUDENT);
      const result = await prisma.user.updateMany({
        where: {
          id: { in: studentIds },
          schoolId: currentUser.schoolId,
          roleId: studentRole.id,
          deletedAt: null,
          deletedBy: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.json({
        message: `${result.count} student(s) deleted`,
        data: { count: result.count },
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to bulk delete students",
      });
    }
  },
);

// Delete student
router.delete(
  "/students/:id",
  withPermission(Permission.DELETE_STUDENT),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "Student" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const studentRole = await roleService.getRoleByName(RoleName.STUDENT);

      const existingStudent = await prisma.user.findFirst({
        where: {
          id,
          schoolId: currentUser.schoolId,
          roleId: studentRole.id,
          deletedAt: null,
          deletedBy: null,
        },
      });

      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found!" });
      }

      await prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.json({ message: "Student deleted!" });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete student",
      });
    }
  },
);

// Bulk assign students to class
router.patch(
  "/students/bulk-assign-class",
  withPermission(Permission.EDIT_STUDENT),
  async (req, res) => {
    try {
      const { studentIds, classId } = req.body;
      const currentUser = req.context.user;

      if (!Array.isArray(studentIds) || !studentIds.length) {
        return res.status(400).json({ message: "Student IDs are required" });
      }

      if (!classId) {
        return res.status(400).json({ message: "Class ID is required" });
      }

      // Validate class exists
      const classEntity = await prisma.class.findFirst({
        where: {
          id: classId,
          schoolId: currentUser.schoolId,
          deletedAt: null,
        },
      });

      if (!classEntity) {
        return res.status(404).json({ message: "Class not found" });
      }

      // Update all students in a transaction
      await prisma.$transaction(
        studentIds.map((sid) =>
          prisma.studentProfile.update({
            where: { userId: sid },
            data: { classId },
          })
        )
      );

      await Promise.allSettled(
        studentIds.map((sid) =>
          feeService.rebuildUnpaidFeePlanForStudent(
            sid,
            currentUser.schoolId,
            currentUser.id,
          )
        )
      );

      return res.json({ message: "Students assigned to class successfully" });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to bulk assign students",
      });
    }
  }
);

// Bulk create teachers
router.post(
  "/teachers/bulk",
  withPermission(Permission.CREATE_TEACHER),
  async (req, res) => {
    try {
      const { csvData } = req.body;
      const currentUser = req.context.user;

      if (!csvData) {
        return res.status(400).json({ message: "CSV data is required" });
      }

      const school = await prisma.school.findUnique({
        where: { id: currentUser.schoolId },
      });

      const teacherRole = await roleService.getOrCreateRoleByName(RoleName.TEACHER);
      const rows = csvUtil.parseCSV(csvData);

      if (rows.length === 0) {
        return res.status(400).json({ message: "No valid data found in CSV" });
      }

      const aadhaarCandidates = [];
      for (const row of rows) {
        const parsed = parseBulkAadhaarId(row);
        if ("value" in parsed && parsed.value) aadhaarCandidates.push(parsed.value);
      }
      const uniqueAadhaarIds = [...new Set(aadhaarCandidates)];
      const existingByAadhaar =
        uniqueAadhaarIds.length > 0
          ? new Map(
              (
                await prisma.user.findMany({
                  where: { aadhaarId: { in: uniqueAadhaarIds } },
                  select: {
                    aadhaarId: true,
                    deletedAt: true,
                    firstName: true,
                    lastName: true,
                  },
                })
              ).map((u) => [u.aadhaarId, u]),
            )
          : new Map();

      const batchAadhaarReserved = new Set();

      const results = {
        success: 0,
        failed: 0,
        errors: [],
        /** One-time mobile login details per successful row (same contract as single POST /teachers). */
        credentials: [],
      };

      for (const row of rows) {
        try {
          const { firstName, lastName } = normalizeBulkPersonName(row);
          const contact = normalizeBulkContact(row);
          if (!firstName || !contact) {
            results.failed++;
            results.errors.push({
              row: firstName || String(row.name ?? "").trim() || "(row)",
              error:
                "First name (or Name) and a valid 10-digit contact (Contact/Phone/Mobile) are required",
            });
            continue;
          }

          const aadhaarParsed = parseBulkAadhaarId(row);
          if ("error" in aadhaarParsed) {
            results.failed++;
            results.errors.push({
              row: firstName,
              error: aadhaarParsed.error,
            });
            continue;
          }
          const aadhaarNormalized = aadhaarParsed.value;

          if (aadhaarNormalized) {
            if (batchAadhaarReserved.has(aadhaarNormalized)) {
              results.failed++;
              results.errors.push({
                row: firstName,
                error:
                  "Duplicate Aadhaar in this file (the same 12-digit number appears on more than one row). Remove duplicates or leave Aadhaar empty where not needed.",
              });
              continue;
            }
            const existingUser = existingByAadhaar.get(aadhaarNormalized);
            if (existingUser) {
              results.failed++;
              const label = existingUser.deletedAt
                ? "a deleted account"
                : "an active account";
              const name = [existingUser.firstName, existingUser.lastName]
                .filter(Boolean)
                .join(" ")
                .trim();
              results.errors.push({
                row: firstName,
                error: `This Aadhaar is already linked to ${label}${name ? ` (${name})` : ""}. Use a different number or leave Aadhaar empty.`,
              });
              continue;
            }
          }

          const publicUserId = await allocateTeacherPublicUserId(
            school.code,
            currentUser.schoolId,
            teacherRole.id,
          );
          const generatedPassword = stringUtil.generateRandomString(15);
          const emailRaw = String(row.email ?? "").trim().toLowerCase();
          const emailNorm = emailRaw || bulkPlaceholderEmail(currentUser.schoolId, "t");
          const dateOfBirth = parseBulkDateOfBirth(row.dateofbirth);

          await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
              data: {
                email: emailNorm,
                password: await bcryptjs.hash(generatedPassword, 10),
                firstName,
                lastName: lastName || "",
                contact,
                gender: row.gender?.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE",
                dateOfBirth,
                address: [],
                userType: UserType.SCHOOL,
                roleId: teacherRole.id,
                schoolId: currentUser.schoolId,
                publicUserId,
                createdBy: currentUser.id,
                aadhaarId: aadhaarNormalized,
              },
            });

            await tx.teacherProfile.create({
              data: {
                userId: user.id,
                designation: row.designation?.trim() || null,
                highestQualification: row.highestqualification?.trim() || "",
                university: row.university?.trim() || "",
                yearOfPassing: row.yearofpassing ? parseInt(row.yearofpassing, 10) : 0,
                grade: row.grade?.trim() || "",
                subjects:
                  (row.subjects && String(row.subjects).trim()) ||
                  (row.subject && String(row.subject).trim()) ||
                  null,
                panCardNumber: row.pancardnumber?.trim() || null,
                createdBy: currentUser.id,
              },
            });
          });

          results.credentials.push({
            email: emailNorm,
            publicUserId,
            password: generatedPassword,
          });
          results.success++;
          if (aadhaarNormalized) {
            batchAadhaarReserved.add(aadhaarNormalized);
          }
        } catch (error) {
          results.failed++;
          let message = error.message;
          if (error.code === "P2002") {
            const field = parseUniqueConstraintField(error);
            if (field === "aadhaarId") {
              message =
                "This Aadhaar number is already registered. Use a unique value or leave Aadhaar empty.";
            } else if (field === "email") {
              message =
                "Email conflict while saving this row. Use a different email or leave it empty for a generated address.";
            } else if (field === "publicUserId") {
              message =
                "Login ID conflict while saving. Please try the upload again in a moment.";
            }
          }
          results.errors.push({
            row: row.email || row.firstname || row.name || "(row)",
            error: message,
          });
        }
      }

      return res.json({
        message: `Bulk upload completed: ${results.success} succeeded, ${results.failed} failed.`,
        data: results,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to bulk upload teachers",
      });
    }
  }
);

// Bulk create students
router.post(
  "/students/bulk",
  withPermission(Permission.CREATE_STUDENT),
  async (req, res) => {
    try {
      const { csvData } = req.body;
      const currentUser = req.context.user;

      if (!csvData) {
        return res.status(400).json({ message: "CSV data is required" });
      }

      const school = await prisma.school.findUnique({
        where: { id: currentUser.schoolId },
      });

      const studentRole = await roleService.getRoleByName(RoleName.STUDENT);
      const rows = csvUtil.parseCSV(csvData);

      if (rows.length === 0) {
        return res.status(400).json({ message: "No valid data found in CSV" });
      }

      // Pre-fetch classes for this school
      const classes = await prisma.class.findMany({
        where: { schoolId: currentUser.schoolId, deletedAt: null },
      });

      const results = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (const row of rows) {
        let rowLabel =
          String(row.name ?? "").trim() ||
          String(row.firstname ?? "").trim() ||
          String(row.email ?? "").trim() ||
          "(row)";
        try {
          const { firstName, lastName } = normalizeBulkPersonName(row);
          rowLabel = firstName || rowLabel;
          const contact = normalizeBulkContact(row);
          if (!firstName || !contact) {
            results.failed++;
            results.errors.push({
              row: rowLabel,
              error:
                "First name (or Name) and a valid 10-digit contact (Contact/Phone/Mobile) are required",
            });
            continue;
          }

          const classResolution = resolveStudentClassForBulk(row, classes);
          if (!classResolution.ok) {
            results.failed++;
            results.errors.push({
              row: rowLabel,
              error: classResolution.error,
            });
            continue;
          }
          const classEntity = classResolution.classEntity;

          const publicUserId = await allocateStudentPublicUserId(
            school.code,
            currentUser.schoolId,
            studentRole.id,
          );
          const generatedPassword = stringUtil.generateRandomString(15);
          const emailRaw = String(row.email ?? "").trim().toLowerCase();
          // Email is mandatory for admission rows (used for login + post-admission communication)
          if (!emailRaw) {
            results.failed++;
            results.errors.push({
              row: rowLabel,
              error:
                "Email is required for admission. It is used for login and post-admission communication.",
            });
            continue;
          }
          const emailNorm = emailRaw;
          const dateOfBirth = parseBulkDateOfBirth(row.dateofbirth);

          let newStudentId;
          const rollRequested = parseBulkRollNumber(row);
          let newRollNumber;
          await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
              data: {
                email: emailNorm,
                password: await bcryptjs.hash(generatedPassword, 10),
                firstName,
                lastName: lastName || "",
                contact,
                gender: row.gender?.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE",
                dateOfBirth,
                userType: UserType.SCHOOL,
                roleId: studentRole.id,
                schoolId: currentUser.schoolId,
                publicUserId,
                createdBy: currentUser.id,
              },
            });
            newStudentId = user.id;

            newRollNumber =
              rollRequested > 0
                ? rollRequested
                : await rollNumberService.getNextRollNumberForClass(classEntity.id);

            await tx.studentProfile.create({
              data: {
                userId: user.id,
                rollNumber: newRollNumber,
                apaarId: row.apaarid?.trim() || null,
                classId: classEntity.id,
                fatherName: row.fathername?.trim() || "",
                motherName: row.mothername?.trim() || "",
                fatherContact: row.fathercontact?.trim() || "",
                motherContact: row.mothercontact?.trim() || "",
                accommodationType: "DAY_SCHOLAR",
                previousSchoolName: row.previousschoolname?.trim() || null,
                previousSchoolBoard: row.previousschoolboard?.trim() || null,
                previousClassAttended: row.previousclassattended?.trim() || null,
                previousYearOfLeaving: row.previousyearofleaving?.trim() || null,
                previousSchoolTcNumber: row.previousschooltcnumber?.trim() || null,
                createdBy: currentUser.id,
              },
            });

            await tx.rollNumberHistory.create({
              data: {
                studentUserId: user.id,
                classId: classEntity.id,
                oldRollNumber: null,
                newRollNumber,
                action: rollRequested > 0 ? "MANUAL_OVERRIDE" : "AUTO_ASSIGNED",
                changedBy: currentUser.id,
              },
            });
          });

          try {
            await feeService.createFeeInstallementsForStudent(
              newStudentId,
              currentUser.schoolId,
              currentUser.id,
            );
          } catch (feeErr) {
            logger.warn(
              { err: feeErr, studentId: newStudentId },
              "Fee installments not created after bulk student create",
            );
          }

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: rowLabel,
            error: formatBulkImportError(error),
          });
        }
      }

      return res.json({
        message: `Bulk upload completed: ${results.success} succeeded, ${results.failed} failed.`,
        data: results,
      });
    } catch (error) {
      return res.status(400).json({
        message: formatBulkImportError(error) || "Failed to bulk upload students",
      });
    }
  }
);

// Create employee
router.post(
  "/employees",
  withPermission(Permission.CREATE_EMPLOYEE),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;
      const isSuperAdmin = currentUser.role?.name === RoleName.SUPER_ADMIN;

      const employeeRole = await roleService.getRoleByName(RoleName.EMPLOYEE);

      // Generate password
      const generatedPassword = stringUtil.generateRandomString(15);

      let publicUserId;
      let schoolIdToUse;
      let userTypeToUse;

      if (isSuperAdmin) {
        const existingEmployees = await prisma.user.count({
          where: {
            roleId: employeeRole.id,
            userType: UserType.APP,
            deletedAt: null,
          },
        });
        publicUserId = `EMP${String(existingEmployees + 1).padStart(4, "0")}`;
        schoolIdToUse = null;
        userTypeToUse = UserType.APP;
      } else {
        const school = await prisma.school.findUnique({
          where: { id: currentUser.schoolId },
        });
        if (!school) {
          return res.status(404).json({ message: "School not found!" });
        }
        const existingEmployees = await prisma.user.count({
          where: {
            schoolId: currentUser.schoolId,
            roleId: employeeRole.id,
          },
        });
        publicUserId = `${school.code}E${String(existingEmployees + 1).padStart(4, "0")}`;
        schoolIdToUse = currentUser.schoolId;
        userTypeToUse = UserType.SCHOOL;
      }

      const contactRaw =
        request.contact != null ? String(request.contact).trim() : "";

      // Create user
      const user = await prisma.user.create({
        data: {
          email: request.email.trim(),
          password: await bcryptjs.hash(generatedPassword, 10),
          firstName: request.firstName.trim(),
          lastName: request.lastName?.trim() || "",
          contact: contactRaw || "0000000000",
          gender: request.gender,
          dateOfBirth: request.dateOfBirth ? new Date(request.dateOfBirth) : null,
          address: request.address || [],
          aadhaarId: request.aadhaarId?.trim() || null,
          userType: userTypeToUse,
          roleId: employeeRole.id,
          schoolId: schoolIdToUse,
          publicUserId,
          assignedRegionId: request.assignedRegionId || null,
          createdBy: currentUser.id,
        },
        include: {
          assignedRegion: {
            select: { id: true, name: true }
          }
        }
      });

      // Attach file URLs
      const usersWithUrls = await userService.attachFileURLs([user]);
      const payload = { ...usersWithUrls[0], password: generatedPassword };

      try {
        await emailService.sendEmployeeWelcomeEmail({
          to: user.email,
          firstName: user.firstName,
          loginEmail: user.email,
          publicUserId: user.publicUserId,
          password: generatedPassword,
        });
      } catch (emailErr) {
        logger.warn(
          { err: emailErr, userId: user.id },
          "Employee created but welcome email failed",
        );
      }

      return res.status(201).json({
        message: "Employee created!",
        data: payload,
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(400).json({
          message: "Email or Aadhaar ID already exists!",
        });
      }
      return res.status(400).json({
        message: error.message || "Failed to create employee",
      });
    }
  },
);

// Get all employees
router.get(
  "/employees",
  withPermission(Permission.GET_EMPLOYEES),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { search } = req.query;
      const isSuperAdmin = currentUser.role?.name === RoleName.SUPER_ADMIN;

      const employeeRole = await roleService.getRoleByName(RoleName.EMPLOYEE);

      const where = {
        roleId: employeeRole.id,
        deletedAt: null,
        deletedBy: null,
      };

      if (isSuperAdmin) {
        where.userType = UserType.APP;
      } else {
        where.schoolId = currentUser.schoolId;
      }

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const employees = await prisma.user.findMany({
        where,
        include: {
          assignedRegion: {
            select: { id: true, name: true }
          },
          assignedLocations: {
            where: { deletedAt: null }
          },
          assignedVendors: {
            where: { deletedAt: null }
          }
        },
        orderBy: { firstName: "asc" },
      });

      const employeesWithCounts = employees.map(emp => {
        const { assignedLocations, assignedVendors, ...rest } = emp;
        return {
          ...rest,
          totalLocations: assignedLocations.length,
          totalVendors: assignedVendors.length,
          status: "Active"
        };
      });

      // Attach file URLs
      const employeesWithUrls = await userService.attachFileURLs(employeesWithCounts);

      return res.json({
        message: "Employees fetched!",
        data: employeesWithUrls,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Failed to fetch employees",
      });
    }
  },
);

// Get employee by ID
router.get(
  "/employees/:id",
  withPermission(Permission.GET_EMPLOYEES),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;
      const isSuperAdmin = currentUser.role?.name === RoleName.SUPER_ADMIN;

      const employeeRole = await roleService.getRoleByName(RoleName.EMPLOYEE);

      const employeeWhere = {
        id,
        roleId: employeeRole.id,
        deletedAt: null,
        deletedBy: null,
      };
      if (!isSuperAdmin) {
        employeeWhere.schoolId = currentUser.schoolId;
      } else {
        employeeWhere.userType = UserType.APP;
      }

      const employee = await prisma.user.findFirst({
        where: employeeWhere,
        include: {
          assignedRegion: {
            select: { id: true, name: true }
          },
          assignedLocations: {
            where: { deletedAt: null }
          },
          assignedVendors: {
            where: { deletedAt: null }
          }
        },
      });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found!" });
      }

      const { assignedLocations, assignedVendors, ...rest } = employee;
      const employeeWithCounts = {
        ...rest,
        totalLocations: assignedLocations.length,
        totalVendors: assignedVendors.length,
        status: "Active"
      };

      // Attach file URLs
      const employeesWithUrls = await userService.attachFileURLs([employeeWithCounts]);

      return res.json({
        message: "Employee fetched!",
        data: employeesWithUrls[0],
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch employee",
      });
    }
  },
);

// Update employee
router.patch(
  "/employees/:id",
  withPermission(Permission.EDIT_EMPLOYEE),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request || {};
      const currentUser = req.context.user;

      const employeeRole = await roleService.getRoleByName(RoleName.EMPLOYEE);

      const patchEmployeeWhere = {
        id,
        roleId: employeeRole.id,
        deletedAt: null,
        deletedBy: null,
      };
      if (currentUser.role?.name === RoleName.SUPER_ADMIN) {
        patchEmployeeWhere.userType = UserType.APP;
      } else {
        patchEmployeeWhere.schoolId = currentUser.schoolId;
      }

      const existingEmployee = await prisma.user.findFirst({
        where: patchEmployeeWhere,
      });

      if (!existingEmployee) {
        return res.status(404).json({ message: "Employee not found!" });
      }

      // Build update data
      const userUpdateData = {
        updatedBy: currentUser.id,
      };

      if (request.firstName !== undefined)
        userUpdateData.firstName = request.firstName.trim();
      if (request.lastName !== undefined)
        userUpdateData.lastName = request.lastName?.trim() || null;
      if (request.email !== undefined)
        userUpdateData.email = request.email.trim();
      if (request.contact !== undefined)
        userUpdateData.contact = request.contact.trim();
      if (request.gender !== undefined) userUpdateData.gender = request.gender;
      if (request.dateOfBirth !== undefined)
        userUpdateData.dateOfBirth = request.dateOfBirth ? new Date(request.dateOfBirth) : null;
      if (request.address !== undefined) userUpdateData.address = request.address;
      if (request.aadhaarId !== undefined)
        userUpdateData.aadhaarId = request.aadhaarId?.trim() || null;
      if (request.assignedRegionId !== undefined)
        userUpdateData.assignedRegionId = request.assignedRegionId || null;

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: userUpdateData,
        include: {
          assignedRegion: {
            select: { id: true, name: true }
          }
        },
      });

      // Attach file URLs
      const usersWithUrls = await userService.attachFileURLs([updatedUser]);

      return res.json({
        message: "Employee updated!",
        data: usersWithUrls[0],
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(400).json({
          message: "Email or Aadhaar ID already exists!",
        });
      }
      return res.status(400).json({
        message: error.message || "Failed to update employee",
      });
    }
  },
);

// Delete employee
router.delete(
  "/employees/:id",
  withPermission(Permission.DELETE_EMPLOYEE),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const employeeRole = await roleService.getRoleByName(RoleName.EMPLOYEE);

      const deleteEmployeeWhere = {
        id,
        roleId: employeeRole.id,
        deletedAt: null,
        deletedBy: null,
      };
      if (currentUser.role?.name === RoleName.SUPER_ADMIN) {
        deleteEmployeeWhere.userType = UserType.APP;
      } else {
        deleteEmployeeWhere.schoolId = currentUser.schoolId;
      }

      const existingEmployee = await prisma.user.findFirst({
        where: deleteEmployeeWhere,
      });

      if (!existingEmployee) {
        return res.status(404).json({ message: "Employee not found!" });
      }

      await prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.json({ message: "Employee deleted!" });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete employee",
      });
    }
  },
);

// Update employee permissions
router.patch(
  "/employees/:id/permissions",
  withPermission(Permission.EDIT_EMPLOYEE),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      const currentUser = req.context.user;

      if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: "Permissions must be an array" });
      }

      const employeeRole = await roleService.getRoleByName(RoleName.EMPLOYEE);

      const permEmployeeWhere = {
        id,
        roleId: employeeRole.id,
        deletedAt: null,
        deletedBy: null,
      };
      if (currentUser.role?.name === RoleName.SUPER_ADMIN) {
        permEmployeeWhere.userType = UserType.APP;
      } else {
        permEmployeeWhere.schoolId = currentUser.schoolId;
      }

      const existingEmployee = await prisma.user.findFirst({
        where: permEmployeeWhere,
      });

      if (!existingEmployee) {
        return res.status(404).json({ message: "Employee not found!" });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          permissions,
          updatedBy: currentUser.id,
        },
        select: {
          id: true,
          permissions: true
        }
      });

      return res.json({
        message: "Employee permissions updated!",
        data: updatedUser,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to update employee permissions",
      });
    }
  }
);

// Download experience certificate for a teacher or staff member
router.get(
  "/experience-certificate/:userId",
  withPermission(Permission.GET_TEACHERS),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUser = req.context.user;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true, schoolId: true },
      });

      if (!user || user.schoolId !== currentUser.schoolId) {
        return res.status(404).json({ message: "User not found" });
      }

      const pdfBuffer = await experienceCertificateService.generateExperienceCertificatePdf(
        userId,
        currentUser.schoolId,
      );

      const filename = `Experience_Certificate_${user.firstName}_${user.lastName}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(pdfBuffer);
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to generate experience certificate",
      });
    }
  },
);

export default router;

