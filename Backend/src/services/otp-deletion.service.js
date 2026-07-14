import otpService from "./otp.service.js";
import emailService from "./email.service.js";
import logger from "../config/logger.js";

/**
 * OTP service for critical deletion operations
 * Sends email OTP before allowing deletion
 */
class OTPDeletionService {
  /**
   * Request deletion OTP
   * @param {Object} data - Request data
   * @returns {Promise<Object>} - OTP request result
   */
  async requestDeletionOTP(data) {
    const {
      userId,
      requestedByEmail,
      otpRecipientEmail,
      entityType,
      entityId,
      ipAddress,
    } = data;

    const to = (otpRecipientEmail || requestedByEmail || "").trim().toLowerCase();
    if (!to) {
      throw new Error("No email available to send deletion OTP");
    }

    // Create and send OTP using existing service (keys OTP by recipient email)
    const otpRecord = await otpService.createAndSendOTP(to, "deletion", 10);

    const actorLine = requestedByEmail
      ? `<p>Requested by account: <strong>${requestedByEmail}</strong></p>`
      : "";

    // Send additional email with deletion context
    await emailService.sendEmail({
      to,
      subject: "Deletion Confirmation Required",
      html: `
        <h2>Deletion Confirmation Required</h2>
        ${actorLine}
        <p>A deletion was requested for <strong>${entityType}</strong> (ID: ${entityId}).</p>
        <p>Use this OTP to confirm the deletion in the admin panel:</p>
        <h3 style="color: #dc2626; font-size: 24px; letter-spacing: 4px;">${otpRecord.otp}</h3>
        <p>This OTP will expire in 10 minutes.</p>
        <p><strong>If you did not request this deletion, ignore this email and contact support immediately.</strong></p>
        <p>Request IP: ${ipAddress}</p>
        <p>Request Time: ${new Date().toLocaleString()}</p>
      `,
    });

    logger.info(
      { userId, entityType, entityId, otpRecipient: to },
      "Deletion OTP requested and sent via email",
    );

    return {
      otpId: otpRecord.id,
      expiresAt: otpRecord.expiresAt,
      message: "OTP sent to the configured deletion email address",
    };
  }

  /**
   * Verify deletion OTP
   * @param {Object} data - Verification data
   * @returns {Promise<boolean>} - True if OTP is valid
   */
  async verifyDeletionOTP(data) {
    const { otpRecipientEmail, otpCode, entityType, entityId } = data;

    const email = (otpRecipientEmail || "").trim().toLowerCase();
    if (!email) return false;

    const result = await otpService.verifyOTP(email, otpCode, "deletion");

    if (!result.valid) {
      logger.warn(
        { otpRecipientEmail: email, entityType, entityId, error: result.error },
        "Deletion OTP verification failed",
      );
      return false;
    }

    logger.info(
      { otpRecipientEmail: email, entityType, entityId },
      "Deletion OTP verified successfully",
    );

    return true;
  }
}

const otpDeletionService = new OTPDeletionService();

export default otpDeletionService;

