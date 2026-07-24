import { z } from "zod";

export const quotationItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional().default(""),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be positive"),
  taxPercent: z.coerce.number().min(0).max(100).optional().default(0),
  discountPercent: z.coerce.number().min(0).max(100).optional().default(0),
});

export const quotationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerPhone: z.string().optional().default(""),
  customerAddress: z.string().optional().default(""),
  customerGstin: z.string().optional().default(""),
  customerState: z.string().optional().default(""),
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
  discountPercent: z.coerce.number().min(0).max(100).optional().default(0),
  taxPercent: z.coerce.number().min(0).max(100).optional().default(18),
  paymentTerms: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  terms: z.string().optional().default(""),
  validityDays: z.coerce.number().min(1).optional().default(30),
});

export type QuotationFormData = z.infer<typeof quotationSchema>;
export type QuotationItemFormData = z.infer<typeof quotationItemSchema>;
