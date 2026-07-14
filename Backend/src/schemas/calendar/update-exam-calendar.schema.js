import { z } from "zod";

const examCalendarItemSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID").optional(),
  subject: z.string().trim().min(1, "Subject cannot be empty"),
  date: z
    .string()
    .trim()
    .refine((val) => !isNaN(Date.parse(val)), "Date must be a valid date"),
});

const updateExamCalendarSchema = z
  .object({
    request: z
      .object({
        classId: z.string().uuid("Class ID must be a valid UUID").optional(),
        examId: z.string().uuid("Exam ID must be a valid UUID").optional(),
        title: z.string().trim().min(1, "Title cannot be empty").optional(),
        visibleFrom: z
          .string()
          .trim()
          .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Visible from date must be a valid date",
          )
          .optional(),
        visibleTill: z
          .string()
          .trim()
          .refine(
            (val) => !val || !isNaN(Date.parse(val)),
            "Visible till date must be a valid date",
          )
          .optional(),
        items: z.array(examCalendarItemSchema).optional(),
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

export default updateExamCalendarSchema;
