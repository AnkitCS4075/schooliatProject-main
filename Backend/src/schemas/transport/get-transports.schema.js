import { z } from "zod";

const getTransportsSchema = z
  .object({
    request: z.object({}),
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default getTransportsSchema;
