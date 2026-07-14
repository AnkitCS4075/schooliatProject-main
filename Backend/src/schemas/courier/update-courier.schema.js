import { z } from "zod";

const statusValues = z.enum([
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "RETURNED",
]);

const updateCourierSchema = z.object({
  request: z
    .object({
      trackingNumber: z.string().min(1).max(200).optional(),
      provider: z.string().min(1).max(200).optional(),
      recipient: z.string().min(1).max(500).optional(),
      destination: z.string().min(1).max(500).optional(),
      contents: z.string().max(2000).optional(),
      status: statusValues.optional(),
      dispatchDate: z.string().max(64).optional(),
    })
    .refine((o) => Object.keys(o).length > 0, {
      message: "At least one field is required to update",
    }),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid("Courier ID must be a valid UUID"),
  }),
});

export default updateCourierSchema;
