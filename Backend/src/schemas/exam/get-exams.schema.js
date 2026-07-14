import { z } from "zod";

const positiveIntString = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || (!isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0), "Must be a positive integer");

const getExamsSchema = z.object({
  request: z.object({}),
  query: z.object({
    page: positiveIntString,
    limit: positiveIntString,
    pageNumber: positiveIntString,
    pageSize: positiveIntString,
  }),
  params: z.object({}),
});

export default getExamsSchema;
