import { z } from "zod";

const changePasswordSchema = z
  .object({
    request: z
      .object({
        currentPassword: z
          .string()
          .trim()
          .min(1, "Current password is required"),
        newPassword: z.string().trim().min(1, "New password is required"),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default changePasswordSchema;
