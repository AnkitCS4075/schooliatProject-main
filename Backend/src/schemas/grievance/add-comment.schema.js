import { z } from "zod";

const addCommentSchema = z
  .object({
    request: z
      .object({
        content: z
          .string()
          .trim()
          .min(1, "Comment content is required")
          .max(2000, "Comment must be at most 2000 characters"),
      })
      ,
    query: z.object({}),
    params: z
      .object({
        id: z.string().uuid("Grievance ID must be a valid UUID"),
      })
      ,
  })
  ;

export default addCommentSchema;
