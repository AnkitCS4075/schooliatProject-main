import { z } from "zod";

const updateTeacherSchema = z
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
        designation: z.string().trim().optional(),
        highestQualification: z
          .string()
          .trim()
          .min(1, "Highest qualification cannot be empty")
          .optional(),
        university: z
          .string()
          .trim()
          .min(1, "University cannot be empty")
          .optional(),
        yearOfPassing: z
          .string()
          .trim()
          .refine(
            (val) => !val || (!isNaN(parseInt(val)) && parseInt(val) > 0),
            "Year of passing must be a valid positive number",
          )
          .optional(),
        grade: z.string().trim().optional(),
        transportId: z
          .string()
          .uuid("Transport ID must be a valid UUID")
          .optional()
          .nullable(),
        panCardNumber: z.string().trim().optional().nullable(),
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
          .optional()
          .nullable(),
        registrationPhotoId: z
          .string()
          .uuid("Registration photo ID must be a valid UUID")
          .optional(),
        idPhotoId: z
          .string()
          .uuid("ID photo ID must be a valid UUID")
          .optional(),
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

export default updateTeacherSchema;
