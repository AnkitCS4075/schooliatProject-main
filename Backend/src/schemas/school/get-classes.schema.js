import { z } from "zod";

const getClassesSchema = z
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
          )
          .refine(
            (val) => !val || parseInt(val, 10) <= 100,
            "Page size must be at most 100",
          ),
        search: z.string().trim().max(200).optional(),
        grade: z.string().trim().max(100).optional(),
        division: z.string().trim().max(100).optional(),
        classTeacherId: z.string().uuid().optional(),
        hasClassTeacher: z.enum(["all", "assigned", "unassigned"]).optional(),
        sortBy: z
          .enum([
            "createdAt",
            "grade",
            "division",
            "defaultAnnualFee",
            "defaultMonthlyFee",
          ])
          .optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }),
    params: z.object({}),
  });

export default getClassesSchema;
