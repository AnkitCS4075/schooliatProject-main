import { z } from "zod";

const createAttendancePeriodSchema = z
  .object({
    request: z
      .object({
        name: z.string().min(1, "Period name is required").max(50, "Period name too long"),
        startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
        endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

const getAttendancePeriodsSchema = z
  .object({
    request: z.object({}),
    query: z.object({}),
    params: z.object({}),
  })
  ;

export { createAttendancePeriodSchema, getAttendancePeriodsSchema };

