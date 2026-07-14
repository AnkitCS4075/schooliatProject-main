import { z } from "zod";

export const markAttendanceSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  classId: z.string().min(1, "Class is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]),
  periodId: z.string().optional(),
  lateArrivalTime: z.string().optional(),
  absenceReason: z.string().optional(),
});

export const bulkAttendanceSchema = z.object({
  attendances: z.array(markAttendanceSchema).min(1, "At least one attendance record is required"),
});

export const attendancePeriodSchema = z.object({
  name: z.string().min(1, "Period name is required"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
}).refine(
  (data) => {
    const [startHour, startMin] = data.startTime.split(":").map(Number);
    const [endHour, endMin] = data.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export type MarkAttendanceFormData = z.infer<typeof markAttendanceSchema>;
export type BulkAttendanceFormData = z.infer<typeof bulkAttendanceSchema>;
export type AttendancePeriodFormData = z.infer<typeof attendancePeriodSchema>;

