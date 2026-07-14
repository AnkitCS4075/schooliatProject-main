import { z } from "zod";

const updateExamCalendarItemSchema = z
  .object({
    request: z
      .object({
        examCalendarId: z
          .string()
          .uuid("Exam calendar ID must be a valid UUID")
          .optional(),
        subject: z.string().trim().min(1, "Subject cannot be empty").optional(),
        date: z
          .string()
          .trim()
          .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Date must be a valid date",
          )
          .optional(),
      })
      ,
    query: z.object({}),
    params: z
      .object({
        id: z.string().uuid("ID must be a valid UUID"),
      })
      ,
  })
  ;

export default updateExamCalendarItemSchema;
