import { z } from "zod";

const submitHomeworkSchema = z
  .object({
    request: z
      .object({
        homeworkId: z.string().uuid("Invalid homework ID"),
        files: z.array(z.string().uuid("Invalid file ID")).optional().default([]),
        mcqAnswers: z.array(
          z.object({
            questionId: z.string().uuid("Invalid question ID"),
            selectedAnswer: z.number().int().min(0, "Invalid answer index"),
          }),
        ).optional().default([]),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default submitHomeworkSchema;

