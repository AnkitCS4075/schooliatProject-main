import { z } from "zod";

const addRemarkSchema = z.object({
  request: z.object({
    content: z.string().trim().min(1, "Remark content is required").max(2000),
  }),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("Lead ID must be a valid UUID"),
  }),
});

export default addRemarkSchema;
