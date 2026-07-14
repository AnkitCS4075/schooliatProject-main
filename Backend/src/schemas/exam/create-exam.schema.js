import { z } from "zod";
import { ExamType } from "../../prisma/generated/index.js";

const createExamSchema = z
  .object({
    request: z
      .object({
        year: z
          .number()
          .int("Year must be an integer")
          .min(1900, "Year must be at least 1900")
          .max(2100, "Year must be at most 2100"),
        name: z.string().trim().min(1, "Name cannot be empty"),
        type: z.nativeEnum(ExamType, {
          errorMap: () => ({
            message: `Type must be one of: ${Object.values(ExamType).join(", ")}`,
          }),
        }),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default createExamSchema;
