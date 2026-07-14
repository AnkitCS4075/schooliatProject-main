import { z } from "zod";

const publishResultsSchema = z
  .object({
    request: z
      .object({
        examId: z.string().uuid("Invalid exam ID"),
        classId: z.string().uuid("Invalid class ID").optional().nullable(),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default publishResultsSchema;

