import { z } from "zod";

const createGrievanceSchema = z
  .object({
    request: z
      .object({
        title: z
          .string()
          .trim()
          .min(1, "Title is required")
          .max(200, "Title must be at most 200 characters"),
        description: z
          .string()
          .trim()
          .min(1, "Description is required")
          .max(2000, "Description must be at most 2000 characters"),
        priority: z
          .enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
            errorMap: () => ({
              message: "Priority must be LOW, MEDIUM, HIGH, or URGENT",
            }),
          })
          .optional()
          .default("MEDIUM"),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default createGrievanceSchema;
