import { z } from "zod";

const createLeaveRequestSchema = z
  .object({
    request: z
      .object({
        leaveTypeId: z.string().uuid("Invalid leave type ID"),
        startDate: z.string().datetime().or(z.date()),
        endDate: z.string().datetime().or(z.date()),
        reason: z.string().min(1, "Reason is required").max(500, "Reason too long"),
      })
      .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
        message: "End date must be after or equal to start date",
        path: ["endDate"],
      })
      ,
    query: z.object({}),
    params: z.object({}),
  })
  ;

export default createLeaveRequestSchema;

