import { z } from "zod";

const getGrievancesSchema = z
  .object({
    request: z.object({}),
    query: z
      .object({
        status: z
          .enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
          .optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        schoolId: z.string().uuid().optional(),
        platformOnly: z.enum(["true", "false"]).optional(),
        page: z.coerce.number().positive().optional().default(1),
        limit: z.coerce.number().positive().max(100).optional().default(20),
      })
      ,
    params: z.object({}),
  })
  ;

export default getGrievancesSchema;
