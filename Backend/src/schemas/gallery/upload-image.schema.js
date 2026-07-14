import { z } from "zod";

const uploadImageSchema = z.object({
  request: z.object({
    galleryId: z.string().uuid("Invalid gallery ID"),
    fileId: z.string().uuid("Invalid file ID"),
    caption: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    order: z.number().int().min(0).optional().default(0),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default uploadImageSchema;

 