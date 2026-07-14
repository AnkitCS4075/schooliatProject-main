import { z } from "zod";

const forgotPasswordSchema = z
  .object({
    request: z
      .object({
        email: z.string().trim().email("Invalid email format"),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default forgotPasswordSchema;

