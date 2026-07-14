import { z } from "zod";

const getGrievanceSchema = z
  .object({
    request: z.object({}),
    query: z.object({}),
    params: z
      .object({
        id: z.string().uuid("Grievance ID must be a valid UUID"),
      })
      ,
  })
  ;

export default getGrievanceSchema;
