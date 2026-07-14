import { z } from "zod";

const getClassByIdSchema = z.object({
  request: z.object({}),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("Invalid class id"),
  }),
});

export default getClassByIdSchema;
