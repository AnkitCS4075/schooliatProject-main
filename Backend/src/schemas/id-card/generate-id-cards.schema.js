import { z } from "zod";

const generateIdCardsSchema = z
  .object({
    request: z.object({}),
    query: z.object({}),
    params: z
      .object({
        classId: z.string().uuid("Class ID must be a valid UUID"),
      })
      ,
  })
  ;

export default generateIdCardsSchema;
