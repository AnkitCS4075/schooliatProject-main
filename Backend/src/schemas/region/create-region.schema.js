import { z } from "zod";

const createRegionSchema = z
  .object({
    request: z
      .object({
        name: z.string().trim().min(1, "Region name is required"),
        zoneHeadId: z.string().uuid().optional().nullable(),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default createRegionSchema;
