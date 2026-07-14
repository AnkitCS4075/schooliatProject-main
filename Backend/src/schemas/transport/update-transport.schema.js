import { z } from "zod";

const updateTransportSchema = z
  .object({
    request: z
      .object({
        type: z
          .enum(["BUS", "VAN", "CAR"], {
            errorMap: () => ({ message: "Type must be BUS, VAN, or CAR" }),
          })
          .optional(),
        // Vehicle Owner
        ownerFirstName: z
          .string()
          .trim()
          .min(1, "Owner first name cannot be empty")
          .optional(),
        ownerLastName: z
          .string()
          .trim()
          .min(1, "Owner last name cannot be empty")
          .optional(),
        // Driver
        driverFirstName: z
          .string()
          .trim()
          .min(1, "Driver first name cannot be empty")
          .optional(),
        driverLastName: z
          .string()
          .trim()
          .min(1, "Driver last name cannot be empty")
          .optional(),
        driverDateOfBirth: z
          .string()
          .trim()
          .optional()
          .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Driver date of birth must be a valid date",
          ),
        driverContact: z
          .string()
          .trim()
          .min(1, "Driver contact cannot be empty")
          .optional(),
        driverGender: z
          .enum(["MALE", "FEMALE"], {
            errorMap: () => ({
              message: "Driver gender must be MALE or FEMALE",
            }),
          })
          .optional(),
        driverPhotoLink: z.string().trim().optional().nullable(),
        // Conductor
        conductorFirstName: z.string().trim().optional().nullable(),
        conductorLastName: z.string().trim().optional().nullable(),
        conductorDateOfBirth: z
          .string()
          .trim()
          .optional()
          .nullable()
          .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Conductor date of birth must be a valid date",
          ),
        conductorContact: z.string().trim().optional().nullable(),
        conductorGender: z
          .enum(["MALE", "FEMALE"], {
            errorMap: () => ({
              message: "Conductor gender must be MALE or FEMALE",
            }),
          })
          .optional()
          .nullable(),
        conductorPhotoLink: z.string().trim().optional().nullable(),
        // Vehicle
        licenseNumber: z
          .string()
          .trim()
          .min(1, "License number cannot be empty")
          .optional(),
        vehicleNumber: z.string().trim().optional().nullable(),
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

export default updateTransportSchema;
