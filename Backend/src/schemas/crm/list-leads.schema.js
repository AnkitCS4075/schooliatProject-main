import { z } from "zod";

const listLeadsSchema = z.object({
  request: z.object({}),
  query: z.object({
    schoolId: z.string().uuid().optional(),
    stage: z.enum(["NEW", "CONTACTABLE", "CONTACTED", "CONNECTED", "FOLLOW_UP_SCHEDULED", "ADMISSION_DONE", "LOST"]).optional(),
    source: z.enum(["STUDENT_REFERRAL", "PARENT_REFERRAL", "SALES_DEPARTMENT", "GATE_ENTRY", "GATE_WALK_IN"]).optional(),
    followUpStatus: z.enum(["PENDING", "INTERESTED", "NOT_INTERESTED", "CONVERTED", "LOST"]).optional(),
    assignedToId: z.string().uuid().optional(),
    sortBy: z.enum(["date", "class", "followUpStatus", "followUpDate", "assignedStaff"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().max(100).optional().default(20),
  }),
  params: z.object({}),
});

export default listLeadsSchema;
