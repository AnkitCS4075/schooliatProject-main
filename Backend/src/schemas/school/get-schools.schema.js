import { z } from "zod";

const getSchoolsSchema = z.object({
  request: z.object({}),
  query: z.object({
    search: z.string().optional(),
    regionId: z.string().uuid().optional(),
  }),
  params: z.object({}),
});

export default getSchoolsSchema;
