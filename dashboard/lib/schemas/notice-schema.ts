import { z } from "zod";

export const noticeSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  content: z.string().min(1, "Content is required").trim(),
  visibleFrom: z.string().min(1, "Visible from date is required"),
  visibleTill: z.string().min(1, "Visible till date is required"),
}).refine(
  (data) => {
    const visibleFrom = new Date(data.visibleFrom);
    const visibleTill = new Date(data.visibleTill);
    return visibleTill >= visibleFrom;
  },
  {
    message: "Visible till date must be after or equal to visible from date",
    path: ["visibleTill"],
  }
);

export type NoticeFormData = z.infer<typeof noticeSchema>;

