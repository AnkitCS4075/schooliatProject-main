import { z } from "zod";
import pkg from "../../prisma/generated/index.js";
const { GalleryPrivacy } = pkg || {};

const getGalleriesSchema = z.object({
  request: z.object({}),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("20"),
    eventId: z.string().uuid().optional(),
    classId: z.string().uuid().optional(),
    privacy: z.enum(["PUBLIC", "PRIVATE", "SCHOOL_ONLY"]).optional(),
  }),
  params: z.object({}),
});

export default getGalleriesSchema;

