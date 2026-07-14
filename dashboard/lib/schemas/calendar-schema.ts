import { z } from "zod";

export const calendarEventSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  from: z.string().min(1, "Start date is required"),
  till: z.string().min(1, "End date is required"),
  visibleFrom: z.string().min(1, "Visible from date is required"),
  visibleTill: z.string().min(1, "Visible till date is required"),
}).refine(
  (data) => {
    const from = new Date(data.from);
    const till = new Date(data.till);
    return till >= from;
  },
  {
    message: "End date must be after or equal to start date",
    path: ["till"],
  }
).refine(
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

export const holidaySchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  from: z.string().min(1, "Start date is required"),
  till: z.string().min(1, "End date is required"),
  visibleFrom: z.string().min(1, "Visible from date is required"),
  visibleTill: z.string().min(1, "Visible till date is required"),
}).refine(
  (data) => {
    const from = new Date(data.from);
    const till = new Date(data.till);
    return till >= from;
  },
  {
    message: "End date must be after or equal to start date",
    path: ["till"],
  }
).refine(
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

export type CalendarEventFormData = z.infer<typeof calendarEventSchema>;
export type HolidayFormData = z.infer<typeof holidaySchema>;

