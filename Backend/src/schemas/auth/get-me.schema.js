import { z } from "zod";

const getMeSchema = z.object({
  request: z.object({}),
  query: z.object({}),
  params: z.object({}),
});

export default getMeSchema;
