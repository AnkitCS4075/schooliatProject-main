import { z } from "zod";

const resetPasswordSchema = z
  .object({
    request: z
      .object({
        token: z.string().min(1, "Reset token is required"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        otp: z.string().length(6, "OTP must be 6 digits").optional(),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default resetPasswordSchema;

