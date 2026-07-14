import { z } from "zod";

/** Required on super-admin DELETE bodies (purpose: "deletion" via /deletion-otp/request). */
export const deletionOtpRequestFields = {
  otp: z
    .string()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
};

export const deletionOtpRequestSchema = z.object(deletionOtpRequestFields);
