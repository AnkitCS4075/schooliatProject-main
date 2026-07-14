import { z } from "zod";

const getIdCardsSchema = z
  .object({
    request: z.object({}),
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default getIdCardsSchema;
