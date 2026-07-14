import { z } from "zod";

const issueBookSchema = z.object({
  request: z.object({
    bookId: z.string().uuid("Invalid book ID"),
    userId: z.string().uuid("Invalid user ID"),
    dueDate: z.string().datetime().or(z.date()),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default issueBookSchema;

