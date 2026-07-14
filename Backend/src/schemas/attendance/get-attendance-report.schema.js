import { z } from "zod";
import { AttendanceStatus } from "../../prisma/generated/index.js";

const getAttendanceReportSchema = z
  .object({
    request: z.object({}),
    query: z
      .object({
        studentId: z.string().uuid("Invalid student ID").optional(),
        classId: z.string().uuid("Invalid class ID").optional(),
        schoolId: z.string().uuid("Invalid school ID").optional(),
        startDate: z.string().or(z.date()),
        endDate: z.string().or(z.date()),
        status: z.nativeEnum(AttendanceStatus).optional(),
        periodId: z.string().uuid("Invalid period ID").optional(),
        markedBy: z.string().uuid("Invalid marked-by user ID").optional(),
        format: z.enum(["json", "pdf", "excel", "csv"]).optional().default("json"),
      })
    ,
    params: z.object({}),
  })
  ;

export default getAttendanceReportSchema;

