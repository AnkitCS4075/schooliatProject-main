import { z } from "zod";

const getSettingsSchema = z
  .object({
    request: z.object({}).strip().optional(),
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default getSettingsSchema;
