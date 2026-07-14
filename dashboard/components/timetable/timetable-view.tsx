"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClassFilters } from "@/lib/hooks/use-class-filters";
import { useTimetable } from "@/lib/hooks/use-timetable";
import { Loader2 } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIOD_TIMES = [
  "08:00 - 08:45",
  "08:45 - 09:30",
  "09:30 - 10:00",
  "10:00 - 10:45",
  "10:45 - 11:30",
  "11:30 - 12:00",
  "12:00 - 12:45",
  "12:45 - 01:30",
];

const ROW_TEMPLATE = [
  { period: 1, time: PERIOD_TIMES[0], isBreak: false },
  { period: 2, time: PERIOD_TIMES[1], isBreak: false },
  { period: "Short Break", time: PERIOD_TIMES[2], isBreak: true },
  { period: 3, time: PERIOD_TIMES[3], isBreak: false },
  { period: 4, time: PERIOD_TIMES[4], isBreak: false },
  { period: "Long Break", time: PERIOD_TIMES[5], isBreak: true },
  { period: 5, time: PERIOD_TIMES[6], isBreak: false },
  { period: 6, time: PERIOD_TIMES[7], isBreak: false },
];

export function TimetableView() {
  const { classFilter, divisionFilter, classes } = useClassFilters();
  const [classFilterValue, setClassFilterValue] = useState(classFilter.defaultValue);
  const [divisionFilterValue, setDivisionFilterValue] = useState(divisionFilter.defaultValue);

  // Derive classId
  const targetClassId = useMemo(() => {
    if (!classFilterValue || classFilterValue === classFilter.defaultValue) return undefined;
    const parts = classFilterValue.split("-");
    const grade = parts[0];
    const divisionFromClass = parts[1] || "";

    let targetDivision = divisionFromClass;
    if (divisionFilterValue !== divisionFilter.defaultValue) {
      targetDivision = divisionFilterValue;
    }

    const matched = classes.find(c =>
      c.grade === grade &&
      (!targetDivision || c.division === targetDivision)
    );
    return matched?.id;
  }, [classFilterValue, divisionFilterValue, classes, classFilter.defaultValue, divisionFilter.defaultValue]);

  // If no class selected, we don't pass classId; wait until one is chosen.
  const queryParams = targetClassId ? { classId: targetClassId } : {};
  const { data: timetableData, isLoading } = useTimetable(queryParams);

  const filteredTimeTable = useMemo(() => {
    // If no data or not a specific class payload (admin fetch-all doesn't have slots)
    if (!timetableData?.data || !timetableData.data.slots) {
      return ROW_TEMPLATE.map((template, i) => ({
        id: template.isBreak ? `break-${i}` : i + 1,
        ...template,
        ...Object.fromEntries(DAYS.map(d => [d.toLowerCase(), null]))
      }));
    }

    const tt = timetableData.data;

    return ROW_TEMPLATE.map((template, i) => {
      const row: any = {
        id: template.isBreak ? `break-${i}` : i + 1,
        ...template,
      };

      for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
        const dayName = DAYS[dayIdx].toLowerCase();

        if (template.isBreak) {
          row[dayName] = { subject: template.period, teacher: "" };
          continue;
        }

        // 1 = Monday, 6 = Saturday
        const dayOfWeek = dayIdx + 1;
        const periodNumber = template.period as number;

        const slot = tt.slots.find((s: any) => s.dayOfWeek === dayOfWeek && s.periodNumber === periodNumber);

        if (slot && slot.subject && slot.teacher) {
          row[dayName] = {
            subject: slot.subject.name,
            teacher: `${slot.teacher.firstName} ${slot.teacher.lastName || ""}`.trim(),
          };
        } else {
          row[dayName] = null;
        }
      }
      return row;
    });
  }, [timetableData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Timetable</h1>
        <div className="flex gap-2">
          <Select value={classFilterValue} onValueChange={setClassFilterValue}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classFilter.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={divisionFilterValue} onValueChange={setDivisionFilterValue}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Division" />
            </SelectTrigger>
            <SelectContent>
              {divisionFilter.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-schooliat-primary" />
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead className="w-32">Period/Time</TableHead>
                {DAYS.map((day) => (
                  <TableHead key={day} className="min-w-[150px]">
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!targetClassId && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    Please select a class to view its timetable.
                  </TableCell>
                </TableRow>
              ) : timetableData?.data === null ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No active timetable found for the selected class.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTimeTable.map((row) => {
                  if (row.isBreak) {
                    return (
                      <TableRow key={row.id} className="bg-gray-100">
                        <TableCell colSpan={7} className="text-center font-semibold py-3 text-gray-600">
                          {row.period} ({row.time})
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return (
                    <TableRow key={row.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div>
                          <div>Period {row.period}</div>
                          <div className="text-xs text-gray-500">{row.time}</div>
                        </div>
                      </TableCell>
                      {DAYS.map((day) => {
                        const dayData = row[day.toLowerCase() as keyof typeof row] as any;
                        return (
                          <TableCell key={day} className="min-w-[150px] align-top">
                            {dayData ? (
                              <div className="p-2 border border-gray-100 rounded bg-white shadow-sm h-full">
                                <div className="font-semibold text-schooliat-primary">{dayData.subject}</div>
                                <div className="text-sm text-gray-600 truncate" title={dayData.teacher}>{dayData.teacher}</div>
                              </div>
                            ) : (
                              <div className="text-gray-300 text-center py-2">—</div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
