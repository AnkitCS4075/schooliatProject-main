import { z } from "zod";

const getEventsSchema = z
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
        month: z
          .string()
          .trim()
          .optional()
          .refine((val) => {
            if (!val) return true;
            // Validate YYYY-MM format
            const regex = /^\d{4}-\d{2}$/;
            if (!regex.test(val)) return false;
            const [year, month] = val.split("-").map(Number);
            return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
          }, "Month must be in YYYY-MM format (e.g., 2025-09)"),
        date: z
          .string()
          .trim()
          .optional()
          .refine((val) => {
            if (!val) return true;
            // Validate YYYY-MM-DD format
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            if (!regex.test(val)) return false;
            const date = new Date(val);
            return !isNaN(date.getTime());
          }, "Date must be in YYYY-MM-DD format"),
      })
      .strip()
      .refine(
        (data) => !(data.month && data.date),
        "Cannot provide both 'month' and 'date' parameters. Use only one.",
      ),
    params: z.object({}),
  })
  ;

export default getEventsSchema;
