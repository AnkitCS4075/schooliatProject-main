import { z } from "zod";

const getVendorsSchema = z
  .object({
    request: z.object({}),
    query: z
      .object({
        employeeId: z
          .string()
          .uuid("Employee ID must be a valid UUID")
          .optional(),
        regionId: z.string().uuid("Region ID must be a valid UUID").optional(),
        status: z
          .enum(["NEW", "HOT", "COLD", "FOLLOW_UP", "CONVERTED"])
          .optional(),
        search: z.string().optional(),
      })
      ,
    params: z.object({}),
  })
  ;

export default getVendorsSchema;
