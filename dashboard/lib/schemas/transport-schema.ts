import { z } from "zod";

const validateLicenseNumber = (vehicleNumber: string) => {
  const vehicleNumberRegexes = [
    /^[A-Z]{2}[0-9]{2}\s*[A-Z]{2}\s*[0-9]{4}$/,
    /^(2[1-9]|[3-9]\d)\s*BH\s*\d{4}\s*[A-Z][A-Z]?$/,
  ];
  return vehicleNumberRegexes.some((regex) => regex.test(vehicleNumber));
};

export const addTransportSchema = z.object({
  ownerfirstName: z.string().min(1, "Owner first name is required").trim(),
  ownerlastName: z.string().min(1, "Owner last name is required").trim(),
  vehicleNumber: z.string().min(1, "DL no. is required").trim(),
  busSerialNumber: z.string().optional(),
  driverfirstName: z.string().min(1, "Driver first name is required").trim(),
  driverlastName: z.string().min(1, "Driver last name is required").trim(),
  driverDateOfBirth: z.string().min(1, "Driver date of birth is required"),
  driverContact: z
    .string()
    .min(10, "Driver contact must be 10 digits")
    .max(10, "Driver contact must be 10 digits")
    .regex(/^\d{10}$/, "Driver contact must be exactly 10 digits"),
  driverGender: z.enum(["MALE", "FEMALE"], { message: "Driver gender is required" }),
  driverPhotoId: z.string().nullable().optional(),
  conductorfirstName: z.string().nullable().optional(),
  conductorlastName: z.string().nullable().optional(),
  conductorDateOfBirth: z.string().optional(),
  conductorGender: z.enum(["MALE", "FEMALE"]).nullable().optional(),
  conductorContact: z
    .string()
    .regex(/^\d{10}$/, "Conductor contact must be exactly 10 digits")
    .nullable()
    .optional()
    .or(z.literal("")),
  conductorPhotoId: z.string().nullable().optional(),
  licenseNumber: z
    .string()
    .min(1, "Vehicle no. is required")
    .refine(validateLicenseNumber, {
      message: "Invalid vehicle no. format",
    }),
});

export const editTransportSchema = addTransportSchema;

export type AddTransportFormData = z.infer<typeof addTransportSchema>;
export type EditTransportFormData = z.infer<typeof editTransportSchema>;

