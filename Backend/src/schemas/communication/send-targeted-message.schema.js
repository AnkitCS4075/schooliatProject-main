import { z } from "zod";

const sendTargetedMessageSchema = z.object({
  request: z.object({
    content: z
      .string()
      .min(1, "Message content is required")
      .max(5000, "Message too long"),
    target: z.object({
      type: z.enum(
        ["INDIVIDUAL", "CLASS", "ALL_TEACHERS", "ALL_STAFF", "WHOLE_SCHOOL"],
        "Invalid target type",
      ),
      userId: z.string().uuid("Invalid user ID").optional(),
      classId: z.string().uuid("Invalid class ID").optional(),
    }),
    attachments: z.array(z.string().uuid("Invalid file ID")).optional().default([]),
    channel: z.enum(["in_app", "sms", "email"]).optional().default("in_app"),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default sendTargetedMessageSchema;
