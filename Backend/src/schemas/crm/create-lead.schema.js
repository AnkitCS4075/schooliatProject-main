import { z } from "zod";

const createLeadSchema = z.object({
  request: z.object({
    schoolId: z.string().uuid().optional(),
    name: z.string().trim().min(1, "Name is required").max(200),
    phone: z.string().trim().min(1, "Phone number is required").max(20),
    source: z.enum(["STUDENT_REFERRAL", "PARENT_REFERRAL", "SALES_DEPARTMENT", "GATE_ENTRY", "GATE_WALK_IN"], {
      errorMap: () => ({ message: "Source must be one of: STUDENT_REFERRAL, PARENT_REFERRAL, SALES_DEPARTMENT, GATE_ENTRY, GATE_WALK_IN" }),
    }),
    category: z.string().trim().max(100).optional(),
    classInterestedIn: z.string().trim().max(100).optional(),
    purposeOfVisit: z.string().trim().max(500).optional(),
    assignedToId: z.string().uuid().optional(),
    remarks: z.string().trim().max(2000).optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default createLeadSchema;
