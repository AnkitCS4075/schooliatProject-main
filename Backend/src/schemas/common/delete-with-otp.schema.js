import { z } from "zod";
import { deletionOtpRequestSchema } from "./deletion-otp-request.schema.js";

/** DELETE routes with `:id` — body `{ request: { otp } }` */
export const deleteByIdWithOtpSchema = z.object({
  request: deletionOtpRequestSchema,
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
});

/**
 * DELETE routes with custom param shape (e.g. `imageId`).
 * @param {z.ZodObject<any>} paramsSchema
 */
export function deleteWithOtpParamsSchema(paramsSchema) {
  return z.object({
    request: deletionOtpRequestSchema,
    query: z.object({}),
    params: paramsSchema,
  });
}
