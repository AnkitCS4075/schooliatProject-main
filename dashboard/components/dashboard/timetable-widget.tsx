"use client";

import { useMemo } from "react";
import { useTimetable } from "@/lib/hooks/use-timetable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type TimetableRow = {
  slot: {
    id: string;
    periodNumber: number;
    startTime: string;
    endTime?: string;
    subject?: { name?: string } | null;
    teacher?: { firstName?: string; lastName?: string } | null;
  };
  classLabel: string;
};

export function TimetableWidget() {
  const router = useRouter();
  const today = new Date();
  const dayOfWeek = today.getDay();

  const { data, isLoading } = useTimetable({});
  const timetables = data?.data;
  const list = Array.isArray(timetables) ? timetables : timetables ? [timetables] : [];

  const todaySlots: TimetableRow[] = useMemo(() => {
    const rows: TimetableRow[] = [];
    for (const tt of list) {
      const cls = tt?.class;
      const classLabel = cls
        ? `${cls.grade ?? ""}${cls.division ? `-${cls.division}` : ""}`.trim() ||
          "Class"
        : "Class";
      const slots = tt?.slots;
      if (!Array.isArray(slots)) continue;
      for (const s of slots) {
        if (s?.dayOfWeek === dayOfWeek) {
          rows.push({ slot: s, classLabel });
        }
      }
    }
    rows.sort((a, b) => {
      const p = (a.slot.periodNumber ?? 0) - (b.slot.periodNumber ?? 0);
      if (p !== 0) return p;
      return a.classLabel.localeCompare(b.classLabel);
    });
    return rows;
  }, [list, dayOfWeek]);

  const getDayName = (dayNum: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayNum];
  };

  return (
    <Card className="border-none shadow-sm h-full rounded-2xl overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-white">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-schooliat-main" />
          Today&apos;s Schedule
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/timetable")}
          className="text-xs text-schooliat-main hover:text-schooliat-main hover:bg-schooliat-tint"
        >
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden bg-gray-50/50">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-schooliat-main" />
          </div>
        ) : todaySlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
            <div className="bg-white p-3 rounded-full shadow-sm">
              <Clock className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 italic">
              No classes scheduled for {getDayName(dayOfWeek)} across your
              timetables.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto scrollbar-hide">
            {todaySlots.map(({ slot, classLabel }) => (
              <div
                key={`${slot.id}-${classLabel}-${slot.periodNumber}`}
                className="p-4 hover:bg-white transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-schooliat-tint text-schooliat-main font-bold h-10 w-10 rounded-xl flex items-center justify-center text-sm shrink-0">
                      P{slot.periodNumber}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 line-clamp-1 flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        {slot.subject?.name ?? "Subject"}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {slot.teacher?.firstName ?? ""}{" "}
                          {slot.teacher?.lastName ?? ""}
                          {!slot.teacher?.firstName && !slot.teacher?.lastName
                            ? "—"
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium text-gray-700">
                      {slot.startTime}
                    </div>
                    <div className="text-[10px] text-gray-400">{classLabel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
