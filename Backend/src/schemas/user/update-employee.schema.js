import { z } from "zod";

const updateEmployeeSchema = z
  .object({
    request: z
      .object({
        firstName: z
          .string()
          .trim()
          .min(1, "First name cannot be empty")
          .optional(),
        lastName: z
          .string()
          .trim()
          .min(1, "Last name cannot be empty")
          .optional(),
        email: z.string().trim().email("Invalid email format").optional(),
        contact: z.string().trim().min(1, "Contact cannot be empty").optional(),
        gender: z
          .enum(["MALE", "FEMALE"], {
            errorMap: () => ({ message: "Gender must be MALE or FEMALE" }),
          })
          .optional(),
        dateOfBirth: z
          .string()
          .trim()
          .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Date of birth must be a valid date",
          )
          .optional(),
        address: z
          .array(z.string().trim().min(1, "Address line cannot be empty"))
          .min(1, "At least one address line is required")
          .optional(),
        aadhaarId: z.string().trim().optional(),
        assignedRegionId: z
          .string()
          .uuid("Assigned region ID must be a valid UUID")
          .optional(),
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
    params: z
      .object({
        id: z.string().uuid("ID must be a valid UUID"),
      })
      ,
  })
  ;

export default updateEmployeeSchema;
