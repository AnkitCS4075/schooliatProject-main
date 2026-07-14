import { z } from "zod";
import { SubmissionStatus } from "../../prisma/generated/index.js";

const getHomeworkSchema = z
  .object({
    request: z.object({}),
    query: z
      .object({
        homeworkId: z.string().uuid("Invalid homework ID").optional(),
        studentId: z.string().uuid("Invalid student ID").optional(),
        classId: z.string().uuid("Invalid class ID").optional(),
        subjectId: z.string().uuid("Invalid subject ID").optional(),
        status: z.nativeEnum(SubmissionStatus).optional(),
        page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
        limit: z.string().regex(/^\d+$/).transform(Number).optional().default("20"),
      })
      ,
    params: z.object({}),
  })
  ;

export default getHomeworkSchema;

