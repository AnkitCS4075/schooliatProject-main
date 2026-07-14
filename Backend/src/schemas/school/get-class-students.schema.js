import { z } from "zod";

const getClassStudentsSchema = z.object({
  request: z.object({}),
  query: z
    .object({
      pageNumber: z
        .string()
        .trim()
        .optional()
        .refine(
          (val) => !val || (!Number.isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0),
          "Page number must be a positive integer",
        ),
      pageSize: z
        .string()
        .trim()
        .optional()
        .refine(
          (val) => !val || (!Number.isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0),
          "Page size must be a positive integer",
        )
        .refine(
          (val) => !val || parseInt(val, 10) <= 100,
          "Page size must be at most 100",
        ),
      sortBy: z.enum(["rollNumber", "name", "createdAt"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      search: z.string().trim().max(200).optional(),
    }),
  params: z.object({
    id: z.string().uuid("Invalid class id"),
  }),
});

export default getClassStudentsSchema;
