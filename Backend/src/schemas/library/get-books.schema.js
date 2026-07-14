import { z } from "zod";

const getBooksSchema = z.object({
  request: z.object({}),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("20"),
    title: z.string().optional(),
    author: z.string().optional(),
    category: z.string().optional(),
    isbn: z.string().optional(),
  }),
  params: z.object({}),
});

export default getBooksSchema;

