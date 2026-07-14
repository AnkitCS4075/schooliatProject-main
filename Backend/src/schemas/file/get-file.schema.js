import { z } from "zod";

const getFileSchema = z
  .object({
    request: z.object({}),
    query: z.object({}),
    params: z
      .object({
        id: z.string().uuid("ID must be a valid UUID"),
      })
      .passthrough(),
  })
  ;

export default getFileSchema;
