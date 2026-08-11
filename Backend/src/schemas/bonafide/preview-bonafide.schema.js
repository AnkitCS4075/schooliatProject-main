import { z } from "zod";

const previewBonafideSchema = z.object({
  request: z.object({
    studentId: z.string().uuid("Student ID must be a valid UUID"),
    purpose: z.enum(["PASSPORT", "SCHOLARSHIP", "BANK", "VISA", "GENERAL"], {
      errorMap: () => ({ message: "Purpose must be one of: PASSPORT, SCHOLARSHIP, BANK, VISA, GENERAL" }),
    }),
    isDuplicate: z.boolean().optional().default(false),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default previewBonafideSchema;
