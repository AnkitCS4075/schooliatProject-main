import { z } from "zod";

const listGateEntriesSchema = z.object({
  request: z.object({}),
  query: z.object({
    schoolId: z.string().uuid().optional(),
    category: z.enum(["ADMISSION_ENQUIRY", "VISITOR", "PARENT", "VENDOR", "STAFF_IN_OUT", "OTHER"]).optional(),
    crmSynced: z.enum(["true", "false"]).optional(),
    search: z.string().trim().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().max(100).optional().default(20),
  }),
  params: z.object({}),
});

export default listGateEntriesSchema;
