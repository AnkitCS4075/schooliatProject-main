import { z } from "zod";

const createTeacherSchema = z
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
        address: z
          .array(z.string().trim().min(1, "Address line cannot be empty"))
          .min(1, "At least one address line is required"),
        aadhaarId: z.string().trim().min(1, "Aadhaar ID is required"),
        designation: z.string().trim().optional(),
        highestQualification: z
          .string()
          .trim()
          .min(1, "Highest qualification is required"),
        university: z.string().trim().min(1, "University is required"),
        yearOfPassing: z
          .number()
          .min(
            new Date().getFullYear() - 100,
            "Year of passing cannot be from this long",
          )
          .max(
            new Date().getFullYear(),
            "Year of passing cannot be from future",
          ),
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
          .optional(),
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
    params: z.object({}),
  })
  ;

export default createTeacherSchema;
