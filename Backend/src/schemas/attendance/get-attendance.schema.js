import { z } from "zod";

const getAttendanceSchema = z
  .object({
    request: z.object({}),
    query: z
      .object({
        studentId: z.string().uuid("Invalid student ID").optional(),
        classId: z.string().uuid("Invalid class ID").optional(),
        startDate: z.string().or(z.date()).optional(),
        endDate: z.string().or(z.date()).optional(),
        date: z.string().or(z.date()).optional(),
        periodId: z
          .union([z.literal("all"), z.string().uuid("Invalid period ID")])
          .optional(),
        page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
        limit: z.string().regex(/^\d+$/).transform(Number).optional().default("20"),
      })
    ,
    params: z.object({}),
  })
  ;

export default getAttendanceSchema;

