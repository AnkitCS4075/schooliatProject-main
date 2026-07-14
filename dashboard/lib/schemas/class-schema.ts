import { z } from "zod";

const optionalNonNegInt = z.preprocess(
  (val) => (val === "" || val === undefined ? null : val),
  z.coerce.number().int().min(0).nullable().optional(),
);

export const feeComponentRowSchema = z.object({
  label: z.string().min(1, "Label is required").max(120),
  amount: z.coerce.number().int().min(0),
});

export const classItemSchema = z.object({
  id: z.string().nullable().optional(),
  grade: z.string().min(1, "Grade is required"),
  division: z.string().nullable().optional(),
  classTeacherId: z.string().nullable().optional(),
  defaultAnnualFee: optionalNonNegInt,
  defaultMonthlyFee: optionalNonNegInt,
  /** When non-empty, sums to annual total and overrides defaultAnnualFee on the server. */
  defaultFeeComponents: z.array(feeComponentRowSchema).optional().nullable(),
});

export const classesSchema = z.array(classItemSchema).min(1, "At least one class is required");

export type ClassItem = z.infer<typeof classItemSchema>;
export type ClassesFormData = z.infer<typeof classesSchema>;

