import { z } from "zod";

const gradeRangeSchema = z.object({
  min: z.number().min(0).max(100),
  max: z.number().min(0).max(100),
  grade: z.string().min(1).max(10),
});

const calculateResultSchema = z
  .object({
    request: z
      .object({
        examId: z.string().uuid("Invalid exam ID"),
        studentId: z.string().uuid("Invalid student ID").optional(),
        classId: z.string().uuid("Invalid class ID"),
        gradeConfig: z.object({
          gradeRanges: z.array(gradeRangeSchema).optional().default([]),
          passingPercentage: z.number().min(0).max(100).optional().default(33),
          cgpaScale: z.number().min(1).max(10).optional().nullable(),
          calculateRank: z.boolean().optional().default(false),
        }).optional().default({}),
      }),
    query: z.object({}),
    params: z.object({}),
  });

export default calculateResultSchema;

