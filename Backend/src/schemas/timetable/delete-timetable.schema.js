import { z } from "zod";
import { deletionOtpRequestSchema } from "../common/deletion-otp-request.schema.js";

export const deleteTimetableSchema = z.object({
  request: deletionOtpRequestSchema,
  query: z.object({}),
  params: z.object({
    timetableId: z.string().uuid("Invalid timetable ID"),
  }),
});
