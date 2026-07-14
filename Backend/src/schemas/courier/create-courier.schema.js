import { z } from "zod";

const statusValues = z.enum([
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "RETURNED",
]);

const createCourierSchema = z.object({
  request: z.object({
    trackingNumber: z.string().min(1).max(200),
    provider: z.string().min(1).max(200),
    recipient: z.string().min(1).max(500),
    destination: z.string().min(1).max(500),
    contents: z.string().max(2000).optional(),
    status: statusValues.optional(),
    dispatchDate: z.string().max(64).optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default createCourierSchema;
