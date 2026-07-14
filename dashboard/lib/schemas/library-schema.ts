import { z } from "zod";

// Base schema without refinements - Zod's .partial() cannot be used on schemas with refinements
const bookSchemaBase = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  author: z.string().min(1, "Author is required").max(100, "Author name too long"),
  isbn: z.string().optional(),
  category: z.string().optional(),
  totalCopies: z.number().int().min(1, "Total copies must be at least 1"),
  availableCopies: z.number().int().min(0, "Available copies cannot be negative"),
  publisher: z.string().optional(),
  publishedYear: z.number().int().min(1000).max(new Date().getFullYear() + 1).optional(),
  description: z.string().optional(),
});

export const createBookSchema = bookSchemaBase.refine(
  (data) => data.availableCopies <= data.totalCopies,
  {
    message: "Available copies cannot exceed total copies",
    path: ["availableCopies"],
  }
);

export const updateBookSchema = bookSchemaBase.partial();

export const issueBookSchema = z.object({
  bookId: z.string().min(1, "Book is required"),
  userId: z.string().min(1, "User is required"),
  dueDate: z.string().min(1, "Due date is required"),
  finePerDay: z.number().min(0).optional(),
});

export const returnBookSchema = z.object({
  finePaid: z.number().min(0).optional(),
  condition: z.string().optional(),
});

export const reserveBookSchema = z.object({
  bookId: z.string().min(1, "Book is required"),
  userId: z.string().min(1, "User is required"),
});

export type CreateBookFormData = z.infer<typeof createBookSchema>;
export type UpdateBookFormData = z.infer<typeof updateBookSchema>;
export type IssueBookFormData = z.infer<typeof issueBookSchema>;
export type ReturnBookFormData = z.infer<typeof returnBookSchema>;
export type ReserveBookFormData = z.infer<typeof reserveBookSchema>;

