import { z } from "zod";

const createCircularSchema = z.object({
  request: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    content: z.string().min(1, "Content is required"),
    targetRoles: z.array(z.string()).optional().default([]),
    targetUserIds: z.array(z.string().uuid()).optional().default([]),
    classIds: z.array(z.string().uuid()).optional().default([]),
    attachments: z.array(z.string().uuid()).optional().default([]),
    expiresAt: z.string().datetime().or(z.date()).optional().nullable(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default createCircularSchema;

