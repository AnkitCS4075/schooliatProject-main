"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { EditCalendarEventForm } from "@/components/calendar/edit-calendar-event-form";
import { EditHolidayForm } from "@/components/calendar/edit-holiday-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditCalendarPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("editingCalendarItem");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItem(parsed);
        setLoading(false);
      } catch (e) {
        console.error("Failed to parse stored item", e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Item not found</p>
          <button
            onClick={() => router.push("/admin/calendar")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-in-out"
          >
            Back to Calendar
          </button>
        </div>
      </div>
    );
  }

  const isHoliday = !item.dateType;

  return (
    <div className="container mx-auto py-6 px-4">
      {isHoliday ? (
        <EditHolidayForm item={item} />
      ) : (
        <EditCalendarEventForm item={item} />
      )}
    </div>
  );
}

