import { z } from "zod";

const getStudentFeeLedgerSchema = z.object({
  request: z.object({}).strip().optional(),
  query: z.object({
    limit: z.string().optional(),
  }),
  params: z.object({
    studentId: z.string().uuid("Student ID must be a valid UUID"),
  }),
});

export default getStudentFeeLedgerSchema;
