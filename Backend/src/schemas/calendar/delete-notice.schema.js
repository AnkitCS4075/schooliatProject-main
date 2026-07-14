import { z } from "zod";
import { deletionOtpRequestSchema } from "../common/deletion-otp-request.schema.js";

const deleteNoticeSchema = z.object({
  request: deletionOtpRequestSchema,
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
});

export default deleteNoticeSchema;
