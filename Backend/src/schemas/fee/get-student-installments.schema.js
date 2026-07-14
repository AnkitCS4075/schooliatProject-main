import { z } from "zod";

const getStudentInstallmentsSchema = z
  .object({
    request: z.object({}).strip().optional(),
    query: z.object({}),
    params: z
      .object({
        studentId: z.string().uuid("Student ID must be a valid UUID"),
      })
      ,
  })
  ;

export default getStudentInstallmentsSchema;
