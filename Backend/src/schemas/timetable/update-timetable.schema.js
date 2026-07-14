import { z } from "zod";

const timetableSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  periodNumber: z.number().int().min(1),
  subjectId: z.string().uuid("Invalid subject ID"),
  teacherId: z.string().uuid("Invalid teacher ID"),
  room: z.string().max(50, "Room name too long").optional().nullable(),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

const updateTimetableSchema = z
  .object({
    request: z
      .object({
        name: z.string().min(1).max(100).optional(),
        effectiveFrom: z.string().datetime().or(z.date()).optional(),
        effectiveTill: z.string().datetime().or(z.date()).optional().nullable(),
        isActive: z.boolean().optional(),
        slots: z.array(timetableSlotSchema).optional(),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default updateTimetableSchema;

