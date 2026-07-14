import otpDeletionService from "../services/otp-deletion.service.js";
import { resolveDeletionOtpRecipientEmail } from "../services/deletion-otp-recipient.service.js";
import logger from "../config/logger.js";

/**
 * Verifies email OTP (purpose "deletion") after validateRequest has populated req.body.request.otp.
 * Use only on routes where the body schema includes the deletion OTP field.
 *
 * @param {{ entityType: string }} options - Human-readable type for audit logs (e.g. "School", "Invoice").
 */
export function requireDeletionOTP({ entityType }) {
  return async function requireDeletionOTPMiddleware(req, res, next) {
    try {
      const user = req.context?.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const otpRecipientEmail = await resolveDeletionOtpRecipientEmail(user);
      if (!otpRecipientEmail) {
        return res.status(401).json({
          message: "No email available for deletion verification",
        });
      }

      const otp =
        req.body?.request?.otp ??
        (typeof req.body?.otp === "string" ? req.body.otp : null);

      if (!otp || typeof otp !== "string") {
        return res.status(403).json({
          message: "Deletion requires email OTP verification",
          errorCode: "DELETION_OTP_REQUIRED",
          requiresOTP: true,
        });
      }

      const entityId = req.params.id || req.params[Object.keys(req.params || {})[0]];
      const ok = await otpDeletionService.verifyDeletionOTP({
        otpRecipientEmail,
        otpCode: otp.trim(),
        entityType,
        entityId,
      });

      if (!ok) {
        logger.warn(
          { userId: user.id, entityType, entityId },
          "Deletion OTP verification failed",
        );
        return res.status(403).json({
          message:
            "Invalid or expired OTP. Request a new verification code and try again.",
          errorCode: "DELETION_OTP_INVALID",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
