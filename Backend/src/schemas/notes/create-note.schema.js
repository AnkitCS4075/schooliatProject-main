import { z } from "zod";

const createNoteSchema = z.object({
  request: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().optional().nullable(),
    subjectId: z.string().uuid("Invalid subject ID"),
    classId: z.string().uuid("Invalid class ID").optional().nullable(),
    chapter: z.string().optional().nullable(),
    topic: z.string().optional().nullable(),
    fileId: z.string().uuid("Invalid file ID"),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default createNoteSchema;

