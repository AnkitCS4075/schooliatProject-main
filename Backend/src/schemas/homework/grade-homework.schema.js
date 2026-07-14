import { z } from "zod";

const gradeHomeworkSchema = z
  .object({
    request: z
      .object({
        submissionId: z.string().uuid("Invalid submission ID"),
        feedback: z.string().max(1000, "Feedback too long").optional().nullable(),
        grade: z.string().max(10, "Grade too long").optional().nullable(),
        marksObtained: z.number().int().min(0).optional().nullable(),
        totalMarks: z.number().int().min(1).optional().nullable(),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default gradeHomeworkSchema;

