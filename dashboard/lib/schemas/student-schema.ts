import { z } from "zod";

// Base schema for student form
const baseStudentSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required" }),
  dob: z.string().min(1, "Date of birth is required"),
  phone: z
    .string()
    .min(10, "Student mobile must be 10 digits")
    .max(10, "Student mobile must be 10 digits")
    .regex(/^[6-9]\d{9}$/, "Student mobile must be a valid 10-digit Indian number"),
  /** Optional: backend assigns a unique placeholder when empty (avoids duplicate empty email). */
  email: z
    .string()
    .default("")
    .refine(
      (s) => {
        const t = s.trim();
        return t === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
      },
      { message: "Invalid email address" },
    ),
  areaStreet: z.string().default(""),
  location: z.string().default(""),
  district: z.string().default(""),
  pincode: z.string().default(""),
  state: z.string().default(""),
  fatherName: z.string().min(1, "Father Name is required"),
  fatherContact: z.string().min(1, "Father Contact is required"),
  motherName: z.string().default(""),
  motherContact: z.string().default(""),
  fatherIncome: z.string().default(""),
  fatherOccupation: z.string().default(""),
  classId: z.string().min(1, "Class is required"),
  accommodationType: z.enum(["DAY_SCHOLAR", "HOSTELLER"]),
  transportMode: z.enum(["Transport", "Non Transport"]),
  transportId: z.string().default(""),
  registrationPhotoId: z.string().nullable().default(null),
  aadhaarNumber: z.string().default(""),
  apaarId: z.string().default(""),
  bloodGroup: z.string().default(""),
  rollNumber: z.string().default(""),
});

export interface StudentFormData {
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dob: string;
  phone: string;
  email: string;
  areaStreet: string;
  location: string;
  district: string;
  pincode: string;
  state: string;
  fatherName: string;
  fatherContact: string;
  motherName: string;
  motherContact: string;
  fatherIncome: string;
  fatherOccupation: string;
  classId: string;
  accommodationType: "DAY_SCHOLAR" | "HOSTELLER";
  transportMode: "Transport" | "Non Transport";
  transportId: string;
  registrationPhotoId: string | null;
  aadhaarNumber: string;
  apaarId: string;
  bloodGroup: string;
  rollNumber: string;
}

// Ensure the schema matches the interface exactly
export const addStudentSchema: z.ZodType<StudentFormData, any, any> = baseStudentSchema.refine(
  (data) => {
    if (data.transportMode === "Transport") {
      return !!data.transportId;
    }
    return true;
  },
  {
    message: "Transport selection is required when Transport mode is selected",
    path: ["transportId"],
  }
);

// Schema for editing student (photo optional)
export const editStudentSchema: z.ZodType<StudentFormData, any, any> = baseStudentSchema.refine(
  (data) => {
    if (data.transportMode === "Transport") {
      return !!data.transportId;
    }
    return true;
  },
  {
    message: "Transport selection is required when Transport mode is selected",
    path: ["transportId"],
  }
);

export const studentSchema = addStudentSchema;

