import { z } from "zod";

const createSyllabusSchema = z.object({
  request: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().optional().nullable(),
    subjectId: z.string().uuid("Invalid subject ID"),
    classId: z.string().uuid("Invalid class ID"),
    academicYear: z.string().min(1, "Academic year is required"),
    chapters: z.any().optional().nullable(), // JSON array
    fileId: z.string().uuid("Invalid file ID").optional().nullable(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default createSyllabusSchema;

