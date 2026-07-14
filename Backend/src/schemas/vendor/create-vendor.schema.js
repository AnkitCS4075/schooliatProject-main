import { z } from "zod";

const createVendorSchema = z
  .object({
    request: z
      .object({
        name: z.string().trim().min(1, "Vendor name is required"),
        email: z
          .string()
          .trim()
          .email("Invalid email format")
          .optional()
          .nullable(),
        contact: z.string().trim().min(1, "Contact is required"),
        address: z
          .array(z.string().trim().min(1, "Address line cannot be empty"))
          .min(1, "At least one address line is required"),
        comments: z.string().trim().optional().nullable(),
        regionId: z.string().uuid("Region ID must be a valid UUID"),
        employeeId: z
          .string()
          .uuid("Employee ID must be a valid UUID")
          .optional()
          .nullable(),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default createVendorSchema;
