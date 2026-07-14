import { z } from "zod";

const verifyOTPSchema = z
  .object({
    request: z
      .object({
        email: z.string().trim().email("Invalid email format"),
        otp: z.string().length(6, "OTP must be 6 digits"),
        purpose: z.enum(["verification", "password-reset", "login", "deletion"]).optional().default("verification"),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default verifyOTPSchema;

