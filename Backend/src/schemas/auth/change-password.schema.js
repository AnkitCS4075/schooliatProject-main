import { z } from "zod";

const changePasswordSchema = z
  .object({
    request: z
      .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default changePasswordSchema;

