import { z } from "zod";

const updateMeSchema = z.object({
  request: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().max(100).optional().nullable(),
    contact: z.string().max(50).optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default updateMeSchema;
