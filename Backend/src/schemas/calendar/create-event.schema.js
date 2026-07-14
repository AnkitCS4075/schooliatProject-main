import { z } from "zod";

const createEventSchema = z
  .object({
    request: z
      .object({
        title: z.string().trim().min(1, "Title cannot be empty"),
        description: z.string().trim().min(1, "Description cannot be empty"),
        from: z
          .string()
          .trim()
          .refine(
            (val) => !isNaN(Date.parse(val)),
            "From date must be a valid date",
          ),
        till: z
          .string()
          .trim()
          .refine(
            (val) => !isNaN(Date.parse(val)),
            "Till date must be a valid date",
          ),
        visibleFrom: z
          .string()
          .trim()
          .refine(
            (val) => !isNaN(Date.parse(val)),
            "Visible from date must be a valid date",
          ),
        visibleTill: z
          .string()
          .trim()
          .refine(
            (val) => !isNaN(Date.parse(val)),
            "Visible till date must be a valid date",
          ),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default createEventSchema;
