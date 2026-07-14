import { z } from "zod";

const mcqQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options required").max(6, "Maximum 6 options allowed"),
  correctAnswer: z.number().min(0, "Correct answer index is required"),
  marks: z.number().min(0.5, "Marks must be at least 0.5").max(100),
});

// Base schema without refinements - Zod's .partial() cannot be used on schemas with refinements
const homeworkSchemaBase = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required"),
  classIds: z.array(z.string()).min(1, "At least one class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  dueDate: z.string().min(1, "Due date is required"),
  isMCQ: z.boolean(),
  attachments: z.array(z.string()).optional(),
  mcqQuestions: z.array(mcqQuestionSchema).optional(),
});

export const createHomeworkSchema = homeworkSchemaBase
  .refine(
    (data) => {
      if (data.isMCQ) {
        return data.mcqQuestions && data.mcqQuestions.length > 0;
      }
      return true;
    },
    {
      message: "MCQ questions are required for MCQ homework",
      path: ["mcqQuestions"],
    }
  )
  .refine(
    (data) => {
      if (data.isMCQ && data.mcqQuestions) {
        return data.mcqQuestions.every((q) => q.correctAnswer >= 0 && q.correctAnswer < q.options.length);
      }
      return true;
    },
    {
      message: "Correct answer index must be within options range",
      path: ["mcqQuestions"],
    }
  );

export const updateHomeworkSchema = homeworkSchemaBase.partial();

export const submitHomeworkSchema = z.object({
  answers: z.array(z.number()).optional(),
  attachments: z.array(z.string()).optional(),
  submissionText: z.string().optional(),
}).refine(
  (data) => {
    return data.answers || data.attachments || data.submissionText;
  },
  {
    message: "At least one submission field is required",
  }
);

export const gradeHomeworkSchema = z.object({
  marksObtained: z.number().min(0, "Marks cannot be negative"),
  feedback: z.string().optional(),
});

export type CreateHomeworkFormData = z.infer<typeof createHomeworkSchema>;
export type UpdateHomeworkFormData = z.infer<typeof updateHomeworkSchema>;
export type SubmitHomeworkFormData = z.infer<typeof submitHomeworkSchema>;
export type GradeHomeworkFormData = z.infer<typeof gradeHomeworkSchema>;

