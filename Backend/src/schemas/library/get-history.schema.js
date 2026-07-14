import { z } from "zod";

const getHistorySchema = z.object({
  request: z.object({}),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("20"),
    status: z.enum(["ISSUED", "RETURNED", "OVERDUE", "LOST"]).optional(),
    userId: z.string().uuid("Invalid user ID").optional(),
  }),
  params: z.object({}),
});

export default getHistorySchema;

