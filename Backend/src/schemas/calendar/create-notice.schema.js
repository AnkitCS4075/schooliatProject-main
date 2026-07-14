import { z } from "zod";

const createNoticeSchema = z
  .object({
    request: z
      .object({
        title: z.string().trim().min(1, "Title cannot be empty"),
        content: z.string().trim().min(1, "Content cannot be empty"),
        visibleFrom: z
          .string()
          .trim()
          .refine(
            (val) => !isNaN(Date.parse(val)),
            "Visible from date must be a valid date",
          ),
        visibleTill: z
          .string()
          .trim()
          .refine(
            (val) => !isNaN(Date.parse(val)),
            "Visible till date must be a valid date",
          ),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default createNoticeSchema;
