import { z } from "zod";

const updateStudentSchema = z
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
        classId: z.string().uuid("Class ID must be a valid UUID").optional(),
        transportId: z
          .string()
          .uuid("Transport ID must be a valid UUID")
          .optional()
          .nullable(),
        apaarId: z
          .string()
          .trim()
          .optional(),
        fatherName: z
          .string()
          .trim()
          .min(1, "Father name cannot be empty")
          .optional(),
        motherName: z
          .string()
          .trim()
          .min(1, "Mother name cannot be empty")
          .optional(),
        fatherContact: z
          .string()
          .trim()
          .min(1, "Father contact cannot be empty")
          .optional(),
        motherContact: z
          .string()
          .trim()
          .min(1, "Mother contact cannot be empty")
          .optional(),
        fatherOccupation: z.string().trim().optional(),
        annualIncome: z
          .string()
          .trim()
          .refine(
            (val) => !val || !isNaN(parseFloat(val)),
            "Annual income must be a valid number",
          )
          .optional()
          .nullable(),
        accommodationType: z
          .enum(["DAY_SCHOLAR", "HOSTELLER"], {
            errorMap: () => ({
              message: "Accommodation type must be DAY_SCHOLAR or HOSTELLER",
            }),
          })
          .optional(),
        bloodGroup: z
          .enum(
            [
              "A_POSITIVE",
              "A_NEGATIVE",
              "B_POSITIVE",
              "B_NEGATIVE",
              "AB_POSITIVE",
              "AB_NEGATIVE",
              "O_POSITIVE",
              "O_NEGATIVE",
            ],
            {
              errorMap: () => ({
                message: "Blood group must be a valid type",
              }),
            },
          )
          .optional(),
        registrationPhotoId: z
          .string()
          .uuid("Registration photo ID must be a valid UUID")
          .optional(),
        idPhotoId: z
          .string()
          .uuid("ID photo ID must be a valid UUID")
          .optional(),
        rollNumber: z.string().trim().optional().nullable(),
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

export default updateStudentSchema;
