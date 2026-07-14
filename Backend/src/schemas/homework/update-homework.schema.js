import { z } from "zod";

const updateHomeworkSchema = z.object({
  request: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    classIds: z.array(z.string().uuid()).min(1).optional(),
    subjectId: z.string().uuid().optional(),
    dueDate: z.string().datetime().or(z.date()).optional(),
    attachments: z.array(z.string().uuid()).optional(),
  }),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export default updateHomeworkSchema;
