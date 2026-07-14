import { z } from "zod";

const createStudentSchema = z
  .object({
    request: z
      .object({
        firstName: z.string().trim().min(1, "First name is required"),
        lastName: z.string().trim().min(1, "Last name is required"),
        email: z.preprocess(
          (val) => {
            if (val === undefined || val === null) return undefined;
            const s = String(val).trim();
            return s === "" ? undefined : s;
          },
          z.string().email("Invalid email format").optional(),
        ),
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
        aadhaarId: z.string().trim().optional(),
        classId: z.string().uuid("Class ID must be a valid UUID"),
        transportId: z
          .string()
          .uuid("Transport ID must be a valid UUID")
          .optional()
          .nullable(),
        apaarId: z.string().trim().optional().nullable(),
        fatherName: z.string().trim().min(1, "Father name is required"),
        motherName: z.string().trim().optional(),
        fatherContact: z.string().trim().min(1, "Father contact is required"),
        motherContact: z.string().trim().optional(),
        fatherOccupation: z.string().trim().optional(),
        annualIncome: z
          .string()
          .trim()
          .optional()
          .nullable()
          .refine(
            (val) => !val || !isNaN(parseFloat(val)),
            "Annual income must be a valid number",
          ),
        accommodationType: z.enum(["DAY_SCHOLAR", "HOSTELLER"], {
          errorMap: () => ({
            message: "Accommodation type must be DAY_SCHOLAR or HOSTELLER",
          }),
        }),
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
        rollNumber: z.string().trim().optional().nullable(),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default createStudentSchema;
