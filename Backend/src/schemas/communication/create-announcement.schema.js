import { z } from "zod";

const createAnnouncementSchema = z
  .object({
    request: z
      .object({
        title: z.string().min(1, "Title is required").max(200, "Title too long"),
        content: z.string().min(1, "Content is required").max(5000, "Content too long"),
        targetUserIds: z.array(z.string().uuid("Invalid user ID")).optional().default([]),
        targetRoles: z.array(z.string()).optional().default([]),
        targetSchoolIds: z.array(z.string().uuid("Invalid school ID")).optional().default([]),
        type: z.string().max(64).optional(),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default createAnnouncementSchema;

