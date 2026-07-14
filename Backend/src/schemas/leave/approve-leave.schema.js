import { z } from "zod";

const approveLeaveSchema = z
  .object({
    request: z
      .object({
        leaveRequestId: z.string().uuid("Invalid leave request ID"),
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default approveLeaveSchema;

