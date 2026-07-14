import { z } from "zod";

const listGateEntriesSchema = z.object({
  request: z.object({}),
  query: z.object({
    category: z.enum(["ADMISSION_ENQUIRY", "PARENT", "VENDOR", "STAFF_IN_OUT", "OTHER"]).optional(),
    search: z.string().trim().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().max(100).optional().default(20),
  }),
  params: z.object({}),
});

export default listGateEntriesSchema;
