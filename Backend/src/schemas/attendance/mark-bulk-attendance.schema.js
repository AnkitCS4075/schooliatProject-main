import { z } from "zod";
import { AttendanceStatus } from "../../prisma/generated/index.js";

const attendanceItemSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  classId: z.string().uuid("Invalid class ID"),
  date: z.string().or(z.date()),
  status: z.nativeEnum(AttendanceStatus),
  periodId: z.string().uuid("Invalid period ID").optional().nullable(),
  lateArrivalTime: z.string().or(z.date()).optional().nullable(),
  absenceReason: z.string().max(500, "Absence reason too long").optional().nullable(),
});

const markBulkAttendanceSchema = z
  .object({
    request: z
      .object({
        attendances: z.array(attendanceItemSchema).min(1, "At least one attendance record required"),
      })
    ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default markBulkAttendanceSchema;

