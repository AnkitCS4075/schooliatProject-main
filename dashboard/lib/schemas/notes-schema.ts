import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required"),
  subjectId: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  chapter: z.string().optional(),
  topic: z.string().optional(),
  fileId: z.string().optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export const createSyllabusSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  chapters: z.array(z.object({
    chapterNumber: z.number().int().min(1),
    chapterName: z.string().min(1, "Chapter name is required"),
    topics: z.array(z.string().min(1)).min(1, "At least one topic is required"),
  })).min(1, "At least one chapter is required"),
  fileId: z.string().optional(),
});

export const updateSyllabusSchema = z.object({
  chapters: z.array(z.object({
    chapterNumber: z.number().int().min(1),
    chapterName: z.string().min(1, "Chapter name is required"),
    topics: z.array(z.string().min(1)).min(1, "At least one topic is required"),
  })).optional(),
  fileId: z.string().optional(),
});

export type CreateNoteFormData = z.infer<typeof createNoteSchema>;
export type UpdateNoteFormData = z.infer<typeof updateNoteSchema>;
export type CreateSyllabusFormData = z.infer<typeof createSyllabusSchema>;
export type UpdateSyllabusFormData = z.infer<typeof updateSyllabusSchema>;

