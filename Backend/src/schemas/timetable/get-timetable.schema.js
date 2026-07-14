import { z } from "zod";

const getTimetableSchema = z
  .object({
    request: z.object({}),
    query: z
      .object({
        classId: z.string().uuid("Invalid class ID").optional(),
        teacherId: z.string().uuid("Invalid teacher ID").optional(),
        subjectId: z.string().uuid("Invalid subject ID").optional(),
        date: z.string().datetime().or(z.date()).optional(),
        timetableId: z.string().uuid("Invalid timetable ID").optional(),
      })
      ,
    params: z.object({}),
  })
  ;

export default getTimetableSchema;

