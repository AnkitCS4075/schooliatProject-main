import { z } from "zod";

const getCalendarSchema = z
  .object({
    request: z.object({}),
    query: z.object({}),
    params: z
      .object({
        date: z
          .string()
          .trim()
          .min(1, "Date is required")
          .refine((val) => {
            // Validate YYYY-MM-DD format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(val)) return false;
            const date = new Date(val);
            return !isNaN(date.getTime());
          }, "Date must be in YYYY-MM-DD format (e.g., 2025-12-31)"),
      })
      ,
  })
  ;

export default getCalendarSchema;
