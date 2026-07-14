import { z } from "zod";
import pkg from "../../prisma/generated/index.js";
const { GalleryPrivacy } = pkg || {};

// Fallback if GalleryPrivacy enum doesn't exist
const PrivacyEnum = GalleryPrivacy || {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
  SCHOOL_ONLY: "SCHOOL_ONLY",
};

const createGallerySchema = z.object({
  request: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().optional().nullable(),
    eventId: z.string().uuid("Invalid event ID").optional().nullable(),
    privacy: z.enum(["PUBLIC", "PRIVATE", "SCHOOL_ONLY"]).optional().default("PUBLIC"),
    classId: z.string().uuid("Invalid class ID").optional().nullable(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default createGallerySchema;

