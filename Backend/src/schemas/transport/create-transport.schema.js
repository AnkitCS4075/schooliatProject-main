import { z } from "zod";

const createTransportSchema = z
  .object({
    request: z
      .object({
        type: z.enum(["BUS", "VAN", "CAR"], {
          errorMap: () => ({ message: "Type must be BUS, VAN, or CAR" }),
        }),
        // Vehicle Owner
        ownerFirstName: z
          .string()
          .trim()
          .min(1, "Owner first name is required"),
        ownerLastName: z.string().trim().min(1, "Owner last name is required"),
        // Driver
        driverFirstName: z
          .string()
          .trim()
          .min(1, "Driver first name is required"),
        driverLastName: z
          .string()
          .trim()
          .min(1, "Driver last name is required"),
        driverDateOfBirth: z
          .string()
          .trim()
          .min(1, "Driver date of birth is required")
          .refine(
            (val) => !isNaN(Date.parse(val)),
            "Driver date of birth must be a valid date",
          ),
        driverContact: z.string().trim().min(1, "Driver contact is required"),
        driverGender: z.enum(["MALE", "FEMALE"], {
          errorMap: () => ({ message: "Driver gender must be MALE or FEMALE" }),
        }),
        driverPhotoLink: z.string().trim().optional().nullable(),
        // Conductor
        conductorFirstName: z.string().trim().optional().nullable(),
        conductorLastName: z.string().trim().optional().nullable(),
        conductorDateOfBirth: z
          .string()
          .trim()
          .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Conductor date of birth must be a valid date",
          ),
        conductorContact: z.string().trim().optional().nullable(),
        conductorGender: z.enum(["MALE", "FEMALE"], {
          errorMap: () => ({
            message: "Conductor gender must be MALE or FEMALE",
          }),
        }),
        conductorPhotoLink: z.string().trim().optional().nullable(),
        // Vehicle
        licenseNumber: z.string().trim().min(1, "License number is required"),
        vehicleNumber: z.string().trim().optional().nullable(),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default createTransportSchema;
