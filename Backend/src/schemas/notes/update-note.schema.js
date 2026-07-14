import { z } from "zod";

const updateNoteSchema = z.object({
  request: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    subjectId: z.string().uuid().optional(),
    classId: z.string().uuid().optional().nullable(),
    chapter: z.string().optional().nullable(),
    topic: z.string().optional().nullable(),
    fileId: z.string().uuid().optional(),
  }),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("Invalid note ID"),
  }),
});

export default updateNoteSchema;

