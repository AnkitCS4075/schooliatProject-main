import { z } from "zod";

const getRegionsSchema = z
  .object({
    request: z.object({}),
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default getRegionsSchema;
