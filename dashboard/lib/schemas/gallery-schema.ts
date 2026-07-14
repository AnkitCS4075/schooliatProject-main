import { z } from "zod";

export const createGallerySchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  eventId: z.string().optional(),
  classId: z.string().optional(),
  privacy: z.enum(["PUBLIC", "PRIVATE", "CLASS_ONLY"]),
});

export const updateGallerySchema = createGallerySchema.partial();

export const uploadImageSchema = z.object({
  imageId: z.string().min(1, "Image is required"),
  caption: z.string().optional(),
});

export type CreateGalleryFormData = z.infer<typeof createGallerySchema>;
export type UpdateGalleryFormData = z.infer<typeof updateGallerySchema>;
export type UploadImageFormData = z.infer<typeof uploadImageSchema>;

