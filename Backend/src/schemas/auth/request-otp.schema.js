import { z } from "zod";

const requestOTPSchema = z
  .object({
    request: z
      .object({
        email: z.string().trim().email("Invalid email format"),
        purpose: z.enum(["verification", "password-reset", "login", "deletion"]).optional().default("verification"),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default requestOTPSchema;

