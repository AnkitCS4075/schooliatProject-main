import { z } from "zod";

const updateBookSchema = z.object({
  request: z.object({
    title: z.string().min(1).max(200).optional(),
    author: z.string().min(1).max(100).optional(),
    isbn: z.string().optional().nullable(),
    publisher: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    totalCopies: z.number().int().min(1).optional(),
    location: z.string().optional().nullable(),
    price: z.number().nonnegative().optional().nullable(),
    language: z.string().optional(),
    publishedYear: z.number().int().min(1000).max(2100).optional().nullable(),
  }),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("Invalid book ID"),
  }),
});

export default updateBookSchema;

