import { z } from "zod";

const updateLeadSchema = z.object({
  request: z.object({
    name: z.string().trim().min(1).max(200).optional(),
    phone: z.string().trim().min(1).max(20).optional(),
    stage: z.enum(["NEW", "CONTACTABLE", "CONTACTED", "CONNECTED", "FOLLOW_UP_SCHEDULED", "ADMISSION_DONE", "LOST"]).optional(),
    category: z.string().trim().max(100).optional(),
    assignedToId: z.string().uuid().nullable().optional(),
    nextFollowUpAt: z.coerce.date().nullable().optional(),
  }),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("Lead ID must be a valid UUID"),
  }),
});

export default updateLeadSchema;
