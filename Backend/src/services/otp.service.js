import prisma from "../prisma/client.js";
import crypto from "crypto";
import emailService from "./email.service.js";
import logger from "../config/logger.js";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/**
 * Generate a random OTP
 * @param {number} length - OTP length (default: 6)
 * @returns {string} - Generated OTP
 */
const generateOTP = (length = OTP_LENGTH) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

/**
 * Create and send OTP
 * @param {string} email - User email
 * @param {string} purpose - Purpose of OTP (verification, password-reset, login, deletion)
 * @param {number} expiryMinutes - OTP expiry time in minutes (default: 10)
 * @returns {Promise<Object>} - OTP record
 */
const createAndSendOTP = async (email, purpose = "verification", expiryMinutes = OTP_EXPIRY_MINUTES) => {
  // Invalidate any existing unused OTPs for this email and purpose
  await prisma.oTP.updateMany({
    where: {
      email,
      purpose,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      isUsed: true,
      usedAt: new Date(),
    },
  });

  // Generate new OTP
  const otp = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

  // Create OTP record
  const otpRecord = await prisma.oTP.create({
    data: {
      email,
      otp,
      purpose,
      expiresAt,
    },
  });

  // Send OTP via email
  try {
    await emailService.sendOTPEmail(email, otp, purpose, expiryMinutes);
    logger.info({ email, purpose }, "OTP sent successfully");
  } catch (error) {
    logger.error({ error, email, purpose }, "Failed to send OTP email");
    // Don't throw error - OTP is still created, user can request resend
  }

  return otpRecord;
};

/**
 * Verify OTP
 * @param {string} email - User email
 * @param {string} otp - OTP code to verify
 * @param {string} purpose - Purpose of OTP
 * @returns {Promise<Object>} - Verification result
 */
const verifyOTP = async (email, otp, purpose = "verification") => {
  // Find valid OTP
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      email,
      purpose,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    return {
      valid: false,
      error: "OTP_NOT_FOUND",
      message: "OTP not found or expired. Please request a new OTP.",
    };
  }

  // Check attempts
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    // Mark as used to prevent further attempts
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true, usedAt: new Date() },
    });
    return {
      valid: false,
      error: "MAX_ATTEMPTS_EXCEEDED",
      message: "Maximum verification attempts exceeded. Please request a new OTP.",
    };
  }

  // Verify OTP
  if (otpRecord.otp !== otp) {
    // Increment attempts
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    const remainingAttempts = MAX_ATTEMPTS - otpRecord.attempts - 1;
    return {
      valid: false,
      error: "INVALID_OTP",
      message: `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : "Please request a new OTP."}`,
      remainingAttempts,
    };
  }

  // Mark OTP as used
  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: {
      isUsed: true,
      usedAt: new Date(),
    },
  });

  logger.info({ email, purpose }, "OTP verified successfully");
  return {
    valid: true,
    otpRecord,
  };
};

/**
 * Clean up expired OTPs (should be run periodically)
 * @param {number} olderThanDays - Delete OTPs older than this many days (default: 7)
 * @returns {Promise<number>} - Number of deleted records
 */
const cleanupExpiredOTPs = async (olderThanDays = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await prisma.oTP.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isUsed: true, createdAt: { lt: cutoffDate } },
      ],
    },
  });

  logger.info({ deletedCount: result.count }, "Cleaned up expired OTPs");
  return result.count;
};

const otpService = {
  generateOTP,
  createAndSendOTP,
  verifyOTP,
  cleanupExpiredOTPs,
  OTP_EXPIRY_MINUTES,
  MAX_ATTEMPTS,
};

export default otpService;

