import { z } from "zod";
import { optionalNullableHttpUrl } from "./optional-http-url.schema.js";

const updateMySchoolSchema = z.object({
  request: z
    .object({
      name: z.string().trim().min(1, "School name cannot be empty").optional(),
      code: z.string().trim().min(1, "School code cannot be empty").optional(),
      email: z.string().trim().email("Invalid email format").optional(),
      phone: z.string().trim().min(1, "Phone cannot be empty").optional(),
      address: z
        .array(z.string().trim().min(1, "Address line cannot be empty"))
        .min(1, "At least one address line is required")
        .optional(),
      certificateLink: optionalNullableHttpUrl("Invalid URL"),
      gstNumber: z.string().trim().optional().nullable(),
      principalName: z.string().trim().optional().nullable(),
      principalEmail: z.string().trim().email("Invalid email").optional().nullable(),
      principalPhone: z.string().trim().optional().nullable(),
      establishedYear: z.number().int().min(1800).max(2100).optional().nullable(),
      boardAffiliation: z.string().trim().optional().nullable(),
      studentStrength: z.number().int().min(0).optional().nullable(),
      bankName: z.string().trim().optional().nullable(),
      bankAccountNumber: z.string().trim().optional().nullable(),
      bankIfscCode: z.string().trim().optional().nullable(),
      bankBranchName: z.string().trim().optional().nullable(),
      upiId: z.string().trim().optional().nullable(),
    })
    .strict(),
  query: z.object({}),
  params: z.object({}),
});

export default updateMySchoolSchema;
