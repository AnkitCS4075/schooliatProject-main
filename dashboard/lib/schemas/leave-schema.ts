import { z } from "zod";

export const createLeaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500, "Reason too long"),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  {
    message: "End date must be on or after start date",
    path: ["endDate"],
  }
);

export const approveLeaveSchema = z.object({
  comments: z.string().optional(),
});

export const rejectLeaveSchema = z.object({
  comments: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

export type CreateLeaveRequestFormData = z.infer<typeof createLeaveRequestSchema>;
export type ApproveLeaveFormData = z.infer<typeof approveLeaveSchema>;
export type RejectLeaveFormData = z.infer<typeof rejectLeaveSchema>;

