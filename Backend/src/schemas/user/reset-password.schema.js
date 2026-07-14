import { z } from "zod";

const resetPasswordSchema = z
  .object({
    request: z
      .object({
        userId: z.string().uuid("User ID must be a valid UUID"),
        newPassword: z.string().trim().min(1, "New password is required"),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default resetPasswordSchema;
