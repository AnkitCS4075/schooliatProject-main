import { z } from "zod";

const updateSettingsSchema = z
  .object({
    request: z
      .object({
        studentFeeInstallments: z
          .number()
          .int()
          .optional(),
        studentFeeAmount: z
          .number()
          .int()
          .optional(),
        currentInstallmentNumber: z
          .number()
          .int()
          .optional(),
        logoId: z
          .string()
          .uuid("Logo ID must be a valid UUID")
          .optional()
          .nullable(),
        platformConfig: z
          .record(z.any())
          .optional(),
        /** School admin only: inbox for deletion OTPs. Empty string or null clears to default (admin email). */
        deletionOtpEmail: z
          .union([z.string().email("Invalid email"), z.literal(""), z.null()])
          .optional(),
        feeReceiptNumberPrefix: z
          .string()
          .min(1, "Prefix required")
          .max(32, "Prefix too long")
          .optional(),
        feeReceiptNextSequence: z.number().int().min(1).optional(),
        feeReceiptUseGst: z.boolean().optional(),
        feeReceiptCgstPercent: z
          .number()
          .min(0)
          .max(100)
          .optional()
          .nullable(),
        feeReceiptSgstPercent: z
          .number()
          .min(0)
          .max(100)
          .optional()
          .nullable(),
        feeReceiptPanCardNumber: z
          .string()
          .max(20)
          .optional()
          .nullable(),
        /** Super Admin only: new SMTP password (encrypted at rest). Empty string clears stored password. Omit to leave unchanged. */
        platformSmtpPassword: z
          .union([z.string().max(2048), z.literal(""), z.null()])
          .optional(),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default updateSettingsSchema;
