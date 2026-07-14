import { z } from "zod";

const updateVendorSchema = z
  .object({
    request: z
      .object({
        name: z
          .string()
          .trim()
          .min(1, "Vendor name cannot be empty")
          .optional(),
        email: z
          .string()
          .trim()
          .email("Invalid email format")
          .optional()
          .nullable(),
        contact: z.string().trim().min(1, "Contact cannot be empty").optional(),
        address: z
          .array(z.string().trim().min(1, "Address line cannot be empty"))
          .min(1, "At least one address line is required")
          .optional(),
        status: z
          .enum(["NEW", "HOT", "COLD", "FOLLOW_UP", "CONVERTED"], {
            errorMap: () => ({
              message: "Status must be NEW, HOT, COLD, FOLLOW_UP, or CONVERTED",
            }),
          })
          .optional(),
        comments: z.string().trim().optional().nullable(),
        regionId: z.string().uuid("Region ID must be a valid UUID").optional(),
        employeeId: z
          .string()
          .uuid("Employee ID must be a valid UUID")
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

export default updateVendorSchema;
