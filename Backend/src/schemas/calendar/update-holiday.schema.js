import { z } from "zod";

const updateHolidaySchema = z
  .object({
    request: z
      .object({
        title: z.string().trim().min(1, "Title cannot be empty").optional(),
        from: z
          .string()
          .trim()
          .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "From date must be a valid date",
          )
          .optional(),
        till: z
          .string()
          .trim()
          .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Till date must be a valid date",
          )
          .optional(),
        visibleFrom: z
          .string()
          .trim()
          .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Visible from date must be a valid date",
          )
          .optional(),
        visibleTill: z
          .string()
          .trim()
          .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Visible till date must be a valid date",
          )
          .optional(),
      })
      ,
    query: z.object({}),
    params: z
      .object({
        id: z.string().uuid("ID must be a valid UUID"),
      })
      ,
  })
  ;

export default updateHolidaySchema;
