import { z } from "zod";

const getBookByIdSchema = z.object({
  request: z.object({}),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("Invalid book ID"),
  }),
});

export default getBookByIdSchema;
