import { z } from "zod";

const getMySchoolSchema = z
  .object({
    request: z.object({}),
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default getMySchoolSchema;
