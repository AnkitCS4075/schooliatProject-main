import { z } from "zod";

const reserveBookSchema = z.object({
  request: z.object({
    bookId: z.string().uuid("Invalid book ID"),
    userId: z.string().uuid("Invalid user ID"),
    expiresAt: z.string().datetime().or(z.date()),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default reserveBookSchema;

