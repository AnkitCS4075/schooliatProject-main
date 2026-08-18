import { z } from "zod";

const createGateEntrySchema = z.object({
  request: z.object({
    schoolId: z.string().uuid().optional(),
    category: z.enum(["ADMISSION_ENQUIRY", "VISITOR", "PARENT", "VENDOR", "STAFF_IN_OUT", "OTHER"], {
      errorMap: () => ({ message: "Category must be one of: ADMISSION_ENQUIRY, VISITOR, PARENT, VENDOR, STAFF_IN_OUT, OTHER" }),
    }),
    name: z.string().trim().min(1, "Visitor name is required").max(200),
    phone: z.string().trim().min(1, "Phone number is required").max(20),
    reason: z.string().trim().max(500).optional(),
    classInterestedIn: z.string().trim().max(100).optional(),
    personToMeet: z.string().trim().max(200).optional(),
    photoFileId: z.string().uuid().optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default createGateEntrySchema;
