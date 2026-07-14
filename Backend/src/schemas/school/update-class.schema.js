import { z } from "zod";

const feeComponentRowSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(120),
  amount: z.coerce.number().int().min(0),
});

const updateClassSchema = z
  .object({
    request: z
      .object({
        grade: z.string().trim().min(1, "Grade cannot be empty").optional(),
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

export default updateClassSchema;
