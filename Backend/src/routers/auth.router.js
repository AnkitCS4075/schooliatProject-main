import { Router } from "express";
import prisma from "../prisma/client.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config.js";
import { ApiErrors } from "../errors.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import authenticateSchema from "../schemas/auth/authenticate.schema.js";
import requestOTPSchema from "../schemas/auth/request-otp.schema.js";
import verifyOTPSchema from "../schemas/auth/verify-otp.schema.js";
import forgotPasswordSchema from "../schemas/auth/forgot-password.schema.js";
import resetPasswordSchema from "../schemas/auth/reset-password.schema.js";
import changePasswordSchema from "../schemas/auth/change-password.schema.js";
import getMeSchema from "../schemas/auth/get-me.schema.js";
import updateMeSchema from "../schemas/auth/update-me.schema.js";
import { RoleName } from "../prisma/generated/index.js";
import { Platform } from "../enums/platform.js";
import otpService from "../services/otp.service.js";
import emailService from "../services/email.service.js";
import passwordUtil from "../utils/password.util.js";
import authorize from "../middlewares/authorize.middleware.js";
import userService from "../services/user.service.js";

const router = Router();

function toSafeUser(user, role, school) {
  const u = {
    id: user.id,
    email: user.email,
    userType: user.userType,
    firstName: user.firstName,
    lastName: user.lastName ?? null,
    contact: user.contact,
    roleId: user.roleId,
    schoolId: user.schoolId ?? null,
    role: role ? { id: role.id, name: role.name, permissions: role.permissions ?? [] } : null,
  };
  if (school) {
    u.school = { id: school.id, name: school.name, code: school.code };
  }
  return u;
}

const availablePlatformsForRoles = {
  [RoleName.SUPER_ADMIN]: [Platform.WEB],
  [RoleName.EMPLOYEE]: [Platform.ANDROID, Platform.IOS],

  [RoleName.SCHOOL_ADMIN]: [Platform.WEB],
  [RoleName.TEACHER]: [Platform.ANDROID, Platform.IOS],
  [RoleName.STUDENT]: [Platform.ANDROID, Platform.IOS],
  [RoleName.STAFF]: [Platform.ANDROID, Platform.IOS],
};

router.post(
  "/authenticate",
  validateRequest(authenticateSchema),
  async (req, res) => {
    const { email: identifier, password } = req.body.request;
    const raw =
      typeof identifier === "string" ? identifier.trim() : identifier;
    if (!raw) {
      throw ApiErrors.USER_NOT_FOUND;
    }

    // Email match is case-insensitive (stored emails are normalized on create/update).
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: raw, mode: "insensitive" } },
          { publicUserId: raw },
        ],
      },
    });

    if (user === null || user.deletedAt !== null) {
      throw ApiErrors.USER_NOT_FOUND;
    }
    if (!user.password) {
      throw ApiErrors.USER_NOT_FOUND;
    }

    const passwordMatched = await bcryptjs.compare(
      password,
      user.password,
    );
    if (!passwordMatched) {
      throw ApiErrors.USER_NOT_FOUND;
    }

    let role = (await prisma.role.findUnique({
      where: { id: user.roleId },
    })) || {
      name: "DEFAULT",
      permissions: [],
    };

    // Normalize platform header to lowercase for case-insensitive matching
    const platform = req.headers["x-platform"]?.toLowerCase() || null;
    if (
      !platform ||
      !availablePlatformsForRoles[role.name].includes(platform)
    ) {
      throw ApiErrors.UNAUTHORIZED;
    }

    let school = null;
    if (user.schoolId) {
      school = await prisma.school.findUnique({
        where: { id: user.schoolId },
        select: { id: true, name: true, code: true },
      });
    }
    const safeUser = {
      id: user.id,
      email: user.email,
      publicUserId: user.publicUserId,
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName ?? null,
      contact: user.contact,
      roleId: user.roleId,
      schoolId: user.schoolId ?? null,
      role,
      school: school ?? undefined,
    };
    const jwtToken = jwt.sign(
      { data: { user: safeUser } },
      config.JWT_SECRET,
      { expiresIn: `${config.JWT_EXPIRATION_TIME}h`, issuer: "SchooliAT" },
    );

    res.json({ message: "User authenticated!", token: jwtToken, user: safeUser });
  },
);

// Request OTP
router.post(
  "/request-otp",
  validateRequest(requestOTPSchema),
  async (req, res) => {
    const { email, purpose } = req.body.request;

    // For password-reset and deletion, verify user exists
    if (purpose === "password-reset" || purpose === "deletion") {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || user.deletedAt !== null) {
        // Don't reveal if user exists for security
        return res.json({
          message: "If an account exists with this email, an OTP has been sent.",
        });
      }
    }

    await otpService.createAndSendOTP(email, purpose);

    res.json({
      message: "OTP sent successfully. Please check your email.",
    });
  },
);

// Verify OTP
router.post(
  "/verify-otp",
  validateRequest(verifyOTPSchema),
  async (req, res) => {
    const { email, otp, purpose } = req.body.request;

    const verification = await otpService.verifyOTP(email, otp, purpose);

    if (!verification.valid) {
      if (verification.error === "INVALID_OTP") {
        const error = new Error(verification.message);
        error.errorCode = "SA004";
        error.statusCode = 400;
        throw error;
      } else if (verification.error === "OTP_NOT_FOUND") {
        const error = new Error(verification.message);
        error.errorCode = "SA005";
        error.statusCode = 404;
        throw error;
      } else {
        throw ApiErrors.MAX_OTP_ATTEMPTS;
      }
    }

    res.json({
      message: "OTP verified successfully",
      verified: true,
    });
  },
);

// Forgot Password - Request password reset
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  async (req, res) => {
    const { email } = req.body.request;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.deletedAt !== null) {
      // Don't reveal if user exists for security
      return res.json({
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes expiry

    // Delete ALL existing reset tokens for this user (to avoid unique constraint violation)
    // The unique constraint is on userId, so we need to delete all tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, 30);
    } catch (error) {
      // Log error but don't fail the request
      console.error("Failed to send password reset email:", error);
    }

    res.json({
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  },
);

// Reset Password
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  async (req, res) => {
    const { token, password, otp } = req.body.request;

    // Validate password strength
    const passwordValidation = passwordUtil.validatePassword(password);
    if (!passwordValidation.isValid) {
      const error = new Error(passwordValidation.errors.join(". "));
      error.errorCode = "SA008";
      error.statusCode = 400;
      throw error;
    }

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      throw ApiErrors.INVALID_RESET_TOKEN;
    }

    // If OTP is provided, verify it (optional for extra security)
    if (otp) {
      const otpVerification = await otpService.verifyOTP(
        resetToken.user.email,
        otp,
        "password-reset",
      );
      if (!otpVerification.valid) {
        throw ApiErrors.INVALID_OTP;
      }
    }

    // Hash new password
    const hashedPassword = await passwordUtil.hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Mark reset token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    res.json({
      message: "Password reset successfully. You can now login with your new password.",
    });
  },
);

// Change Password (for authenticated users)
router.post(
  "/change-password",
  authorize,
  validateRequest(changePasswordSchema),
  async (req, res) => {
    const { currentPassword, newPassword } = req.body.request;
    const userId = req.context.user.id;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw ApiErrors.USER_NOT_FOUND;
    }

    // Verify current password
    const passwordMatched = await passwordUtil.comparePassword(
      currentPassword,
      user.password,
    );
    if (!passwordMatched) {
      throw ApiErrors.PASSWORD_MISMATCH;
    }

    // Validate new password strength
    const passwordValidation = passwordUtil.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      const error = new Error(passwordValidation.errors.join(". "));
      error.errorCode = "SA008";
      error.statusCode = 400;
      throw error;
    }

    // Hash new password
    const hashedPassword = await passwordUtil.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({
      message: "Password changed successfully",
    });
  },
);

// GET /auth/roles – list available roles for mobile login
router.get("/roles", async (req, res) => {
  const mobileRoles = [
    RoleName.TEACHER,
    RoleName.STUDENT,
    RoleName.STAFF,
    RoleName.EMPLOYEE,
  ];

  const roles = await prisma.role.findMany({
    where: {
      name: { in: mobileRoles },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
    },
  });

  res.json({ message: "Roles fetched", data: roles });
});

// GET /auth/me – current user profile (authenticated)
router.get(
  "/me",
  authorize,
  validateRequest(getMeSchema),
  async (req, res) => {
    const userId = req.context.user.id;
    const userRole = req.context.user.role?.name;

    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        ...userService.getUserSelect(
          userRole === RoleName.STUDENT,
          userRole === RoleName.TEACHER,
          userRole === RoleName.STAFF,
        ),
        role: { select: { id: true, name: true, permissions: true } },
        school: { select: { id: true, name: true, code: true } },
      },
    });

    if (!user) {
      throw ApiErrors.USER_NOT_FOUND;
    }

    // Attach photo URLs
    const [userWithPhotos] = await userService.attachFileURLs([user]);

    res.json({ message: "Profile fetched", data: userWithPhotos });
  },
);

// PATCH /auth/me – update current user profile (firstName, lastName, contact)
router.patch(
  "/me",
  authorize,
  validateRequest(updateMeSchema),
  async (req, res) => {
    const userId = req.context.user.id;
    const userRole = req.context.user.role?.name;
    const body = req.body.request || {};

    const updateData = {};
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.contact !== undefined) updateData.contact = body.contact;
    updateData.updatedBy = userId;

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Fetch fresh user with profiles
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...userService.getUserSelect(
          userRole === RoleName.STUDENT,
          userRole === RoleName.TEACHER,
          userRole === RoleName.STAFF,
        ),
        role: { select: { id: true, name: true, permissions: true } },
        school: { select: { id: true, name: true, code: true } },
      },
    });

    const [userWithPhotos] = await userService.attachFileURLs([user]);

    res.json({ message: "Profile updated", data: userWithPhotos });
  },
);

export default router;
