import { z } from "zod";

const marksItemSchema = z.object({
  examId: z.string().uuid("Invalid exam ID"),
  studentId: z.string().uuid("Invalid student ID"),
  subjectId: z.string().uuid("Invalid subject ID"),
  classId: z.string().uuid("Invalid class ID"),
  marksObtained: z.number().min(0),
  maxMarks: z.number().min(1),
}).refine((data) => data.marksObtained <= data.maxMarks, {
  message: "Marks obtained cannot exceed maximum marks",
  path: ["marksObtained"],
});

const enterBulkMarksSchema = z
  .object({
    request: z
      .object({
        marks: z.array(marksItemSchema).min(1, "At least one marks record required"),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default enterBulkMarksSchema;

