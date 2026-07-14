import { z } from "zod";

const cancelInstallmentSchema = z.object({
  request: z.object({
    reason: z.string().trim().max(500).optional().nullable(),
  }),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("Installment ID must be a valid UUID"),
  }),
});

export default cancelInstallmentSchema;
