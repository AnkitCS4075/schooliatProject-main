import { z } from "zod";

export const feesConfigSchema = z.object({
  studentFeeInstallments: z
    .string()
    .min(1, "Number of installments is required")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1;
    }, "Installments must be at least 1"),
  studentFeeAmount: z
    .string()
    .min(1, "Fee amount is required")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, "Fee amount must be 0 or greater"),
  feeReceiptNumberPrefix: z
    .string()
    .min(1, "Receipt prefix is required")
    .max(32, "Max 32 characters"),
  feeReceiptNextSequence: z
    .string()
    .min(1, "Next sequence is required")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1;
    }, "Sequence must be at least 1"),
  feeReceiptUseGst: z.boolean(),
  feeReceiptCgstPercent: z
    .string()
    .optional()
    .refine((v) => {
      if (v === undefined || v === "") return true;
      const n = Number(v);
      return !isNaN(n) && n >= 0 && n <= 100;
    }, "CGST must be 0–100"),
  feeReceiptSgstPercent: z
    .string()
    .optional()
    .refine((v) => {
      if (v === undefined || v === "") return true;
      const n = Number(v);
      return !isNaN(n) && n >= 0 && n <= 100;
    }, "SGST must be 0–100"),
  feeReceiptPanCardNumber: z.union([z.string().max(20), z.literal("")]).optional(),
});

export const schoolProfileSchema = z.object({
  name: z.string().min(1, "School name is required"),
  code: z.string().min(1, "School code is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  address: z.array(z.string().min(1, "Address line required")).min(1, "At least one address line"),
  certificateLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  gstNumber: z.string().optional(),
  principalName: z.string().optional(),
  principalEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  principalPhone: z.string().optional(),
  establishedYear: z
    .string()
    .optional()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 1800 && Number(v) <= 2100), "Invalid year"),
  boardAffiliation: z.string().optional(),
  studentStrength: z
    .string()
    .optional()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), "Must be 0 or greater"),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfscCode: z.string().optional(),
  bankBranchName: z.string().optional(),
  upiId: z.string().optional(),
  emergencyContacts: z.array(z.string()).optional(),
});

export type SchoolProfileFormData = z.infer<typeof schoolProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().max(100).optional(),
  contact: z.string().min(1, "Contact is required").max(50),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export type FeesConfigFormData = z.infer<typeof feesConfigSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

