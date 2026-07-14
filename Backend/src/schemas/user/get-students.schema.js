import { z } from "zod";

const getStudentsSchema = z
  .object({
    request: z.object({}),
    query: z
      .object({
        pageNumber: z
          .string()
          .trim()
          .optional()
          .refine(
            (val) => !val || (!isNaN(parseInt(val)) && parseInt(val) > 0),
            "Page number must be a positive integer",
          ),
        pageSize: z
          .string()
          .trim()
          .optional()
          .refine(
            (val) => !val || (!isNaN(parseInt(val)) && parseInt(val) > 0),
            "Page size must be a positive integer",
          ),
      })
      ,
    params: z.object({}),
  })
  ;

export default getStudentsSchema;
