import { z } from "zod";
import { deletionOtpRequestFields } from "../common/deletion-otp-request.schema.js";

export const bulkDeleteTransportsSchema = z.object({
  request: z.object({
    ...deletionOtpRequestFields,
    transportIds: z.array(z.string().uuid()).min(1).max(200),
  }),
  query: z.object({}),
  params: z.object({}),
});
