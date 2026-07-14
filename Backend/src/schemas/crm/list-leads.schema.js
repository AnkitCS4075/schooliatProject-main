import { z } from "zod";

const listLeadsSchema = z.object({
  request: z.object({}),
  query: z.object({
    stage: z.enum(["NEW", "CONTACTABLE", "CONTACTED", "CONNECTED", "FOLLOW_UP_SCHEDULED", "ADMISSION_DONE", "LOST"]).optional(),
    source: z.enum(["STUDENT_REFERRAL", "PARENT_REFERRAL", "SALES_DEPARTMENT", "GATE_ENTRY"]).optional(),
    assignedToId: z.string().uuid().optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().max(100).optional().default(20),
  }),
  params: z.object({}),
});

export default listLeadsSchema;
