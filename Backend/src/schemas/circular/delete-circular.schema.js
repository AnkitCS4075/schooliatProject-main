import { z } from "zod";
import { deletionOtpRequestSchema } from "../common/deletion-otp-request.schema.js";

const deleteCircularSchema = z.object({
  request: deletionOtpRequestSchema,
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("Invalid circular ID"),
  }),
});

export default deleteCircularSchema;
