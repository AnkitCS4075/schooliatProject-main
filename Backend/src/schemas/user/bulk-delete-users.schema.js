import { z } from "zod";
import { deletionOtpRequestFields } from "../common/deletion-otp-request.schema.js";

const idList = z.array(z.string().uuid()).min(1).max(200);

export const bulkDeleteTeachersSchema = z.object({
  request: z.object({
    ...deletionOtpRequestFields,
    teacherIds: idList,
  }),
  query: z.object({}),
  params: z.object({}),
});

export const bulkDeleteStaffSchema = z.object({
  request: z.object({
    ...deletionOtpRequestFields,
    staffIds: idList,
  }),
  query: z.object({}),
  params: z.object({}),
});

export const bulkDeleteStudentsSchema = z.object({
  request: z.object({
    ...deletionOtpRequestFields,
    studentIds: idList,
  }),
  query: z.object({}),
  params: z.object({}),
});
