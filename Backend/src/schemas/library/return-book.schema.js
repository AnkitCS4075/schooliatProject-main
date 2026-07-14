import { z } from "zod";

const returnBookSchema = z.object({
  request: z.object({
    remarks: z.string().optional().nullable(),
  }),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("Invalid issue ID"),
  }),
});

export default returnBookSchema;

