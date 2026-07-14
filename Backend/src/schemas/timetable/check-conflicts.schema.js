import { z } from "zod";

const timetableSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  periodNumber: z.number().int().min(1),
  subjectId: z.string().uuid("Invalid subject ID"),
  teacherId: z.string().uuid("Invalid teacher ID"),
  room: z.string().max(50).optional().nullable(),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
});

const checkConflictsSchema = z
  .object({
    request: z
      .object({
        slots: z.array(timetableSlotSchema).min(1),
        classId: z.string().uuid("Invalid class ID").optional().nullable(),
        excludeTimetableId: z.string().uuid("Invalid timetable ID").optional().nullable(),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default checkConflictsSchema;

