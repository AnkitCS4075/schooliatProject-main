import { z } from "zod";

const statusValues = z.enum([
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "RETURNED",
]);

const listCouriersSchema = z.object({
  request: z.object({}),
  query: z.object({
    status: statusValues.optional(),
    search: z.string().max(500).optional(),
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().max(200).optional().default(50),
  }),
  params: z.object({}),
});

export default listCouriersSchema;
