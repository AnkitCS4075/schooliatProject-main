import { z } from "zod";

const getRolesSchema = z
  .object({
    request: z.object({}),
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default getRolesSchema;
