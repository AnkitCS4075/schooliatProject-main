import { z } from "zod";

const addStopSchema = z.object({
  request: z.object({
    routeId: z.string().uuid("Invalid route ID"),
    name: z.string().min(1, "Stop name is required"),
    address: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    sequence: z.number().int().min(0, "Sequence must be non-negative"),
    arrivalTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default addStopSchema;

