import { z } from "zod";

const createBookSchema = z.object({
  request: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    author: z.string().min(1, "Author is required").max(100, "Author name too long"),
    isbn: z.string().optional().nullable(),
    publisher: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    totalCopies: z.number().int().min(1, "At least 1 copy required").default(1),
    location: z.string().optional().nullable(),
    price: z.number().nonnegative().optional().nullable(),
    language: z.string().default("English"),
    publishedYear: z.number().int().min(1000).max(2100).optional().nullable(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default createBookSchema;

