import { z } from "zod";

const createRouteSchema = z.object({
  request: z.object({
    name: z.string().min(1, "Route name is required").max(100, "Route name too long"),
    transportId: z.string().uuid("Invalid transport ID"),
    startPoint: z.string().min(1, "Start point is required"),
    endPoint: z.string().min(1, "End point is required"),
    distance: z.number().nonnegative().optional().nullable(),
    estimatedTime: z.number().int().min(0).optional().nullable(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export default createRouteSchema;

