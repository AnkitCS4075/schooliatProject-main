"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { AddCalendarEventForm } from "@/components/calendar/add-calendar-event-form";
import { AddHolidayForm } from "@/components/calendar/add-holiday-form";

export default function AddCalendarPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "event";

  return (
    <div className="container mx-auto py-6 px-4">
      {type === "holiday" ? <AddHolidayForm /> : <AddCalendarEventForm />}
    </div>
  );
}

