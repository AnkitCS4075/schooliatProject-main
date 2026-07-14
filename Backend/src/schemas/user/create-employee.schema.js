import { z } from "zod";

const createEmployeeSchema = z
  .object({
    request: z
      .object({
        firstName: z.string().trim().min(1, "First name is required"),
        lastName: z.string().trim().min(1, "Last name is required"),
        email: z.string().trim().email("Invalid email format"),
        contact: z.string().trim().min(1, "Contact is required"),
        gender: z.enum(["MALE", "FEMALE"], {
          errorMap: () => ({ message: "Gender must be MALE or FEMALE" }),
        }),
        dateOfBirth: z
          .string()
          .trim()
          .min(1, "Date of birth is required")
          .refine(
            (val) => !isNaN(Date.parse(val)),
            "Date of birth must be a valid date",
          ),
        address: z.array(z.string().trim()).optional().nullable(),
        aadhaarId: z.string().trim().optional(),
        assignedRegionId: z
          .string()
          .uuid("Assigned region ID must be a valid UUID")
          .optional()
          .nullable(),
        registrationPhotoId: z
          .string()
          .uuid("Registration photo ID must be a valid UUID")
          .optional()
          .nullable(),
        idPhotoId: z
          .string()
          .uuid("ID photo ID must be a valid UUID")
          .optional()
          .nullable(),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default createEmployeeSchema;
