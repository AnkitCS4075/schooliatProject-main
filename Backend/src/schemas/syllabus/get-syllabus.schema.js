import { z } from "zod";

const getSyllabusSchema = z.object({
  request: z.object({}),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("20"),
    subjectId: z.string().uuid().optional(),
    classId: z.string().uuid().optional(),
    academicYear: z.string().optional(),
  }),
  params: z.object({}),
});

export default getSyllabusSchema;

