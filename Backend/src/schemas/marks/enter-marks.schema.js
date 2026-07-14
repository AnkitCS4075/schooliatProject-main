import { z } from "zod";

const enterMarksSchema = z
  .object({
    request: z
      .object({
        examId: z.string().uuid("Invalid exam ID"),
        studentId: z.string().uuid("Invalid student ID"),
        subjectId: z.string().uuid("Invalid subject ID"),
        classId: z.string().uuid("Invalid class ID"),
        marksObtained: z.number().min(0, "Marks cannot be negative"),
        maxMarks: z.number().min(1, "Maximum marks must be at least 1"),
      })
      .refine((data) => data.marksObtained <= data.maxMarks, {
        message: "Marks obtained cannot exceed maximum marks",
        path: ["marksObtained"],
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default enterMarksSchema;

