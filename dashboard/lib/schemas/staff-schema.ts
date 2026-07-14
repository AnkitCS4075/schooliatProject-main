import { z } from "zod";

export const staffSchema = z.object({
    firstName: z.string().min(1, "First name is required").trim(),
    lastName: z.string().min(1, "Last name is required").trim(),
    gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required" }),
    dob: z.string().min(1, "Date of birth is required"),
    contact: z
        .string()
        .min(10, "Contact must be 10 digits")
        .max(10, "Contact must be 10 digits")
        .regex(/^\d{10}$/, "Contact must be exactly 10 digits"),
    email: z.string().email("Invalid email address").trim(),
    areaStreet: z.string().min(1, "Area and street is required").trim(),
    location: z.string().min(1, "Location is required").trim(),
    district: z.string().min(1, "District is required").trim(),
    pincode: z
        .string()
        .min(6, "Pincode must be 6 digits")
        .max(6, "Pincode must be 6 digits")
        .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
    state: z.string().min(1, "State is required").trim(),
    registrationPhotoId: z.string().nullable().optional(),
    aadhaarId: z
        .string()
        .min(12, "Aadhaar ID must be 12 digits")
        .max(12, "Aadhaar ID must be 12 digits")
        .regex(/^\d{12}$/, "Aadhaar ID must be exactly 12 digits"),
    designation: z.string().trim().optional(),
    basicSalary: z.number().min(0, "Salary cannot be negative").optional(),
    publicUserId: z.string().trim().optional(),
});

export const editStaffSchema = staffSchema.extend({
    dateOfBirth: z.string().min(1, "Date of birth is required"),
});

export type StaffFormData = z.infer<typeof staffSchema>;
export type EditStaffFormData = z.infer<typeof editStaffSchema>;
