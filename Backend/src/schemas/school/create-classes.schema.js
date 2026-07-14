import { z } from "zod";

const feeComponentRowSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(120),
  amount: z.coerce.number().int().min(0),
});

const createClassesSchema = z.object({
  request: z
    .array(
      z.object({
        id: z
          .string()
          .uuid("ID must be a valid UUID")
          .optional()
          .nullable(),
        grade: z.string().trim().min(1, "Grade is required"),
        division: z.string().trim().optional().nullable(),
        classTeacherId: z
          .string()
          .uuid("Class teacher ID must be a valid UUID")
          .optional()
          .nullable(),
        defaultAnnualFee: z.coerce.number().int().min(0).optional().nullable(),
        defaultMonthlyFee: z.coerce.number().int().min(0).optional().nullable(),
        defaultFeeComponents: z
          .array(feeComponentRowSchema)
          .max(50)
          .optional()
          .nullable(),
      }),
    )
    .min(1, "At least one class is required"),
  query: z.object({}),
  params: z.object({}),
});

export default createClassesSchema;
