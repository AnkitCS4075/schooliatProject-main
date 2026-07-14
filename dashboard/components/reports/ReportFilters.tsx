"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Filter } from "lucide-react";
import type { ReportDatePreset, ReportFilters as ReportFiltersType } from "@/lib/types/reports";
import { getDateRangeForPreset } from "@/lib/utils/analytics";

const PRESETS: { value: ReportDatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "thisQuarter", label: "This quarter" },
  { value: "custom", label: "Custom range" },
];

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (f: ReportFiltersType) => void;
  classes: Array<{ id: string; grade?: string; division?: string }>;
  exams: Array<{ id: string; name?: string; year?: number }>;
  showExamFilter?: boolean;
  showCompareToggle?: boolean;
}

export function ReportFilters({
  filters,
  onFiltersChange,
  classes,
  exams,
  showExamFilter = false,
  showCompareToggle = false,
}: ReportFiltersProps) {
  const setDatePreset = (preset: ReportDatePreset) => {
    if (preset === "custom") {
      onFiltersChange({
        ...filters,
        dateRange: { ...filters.dateRange, preset: "custom" },
      });
      return;
    }
    const range = getDateRangeForPreset(preset);
    onFiltersChange({ ...filters, dateRange: range });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Date range</Label>
          </div>
          <Select
            value={filters.dateRange.preset ?? "custom"}
            onValueChange={(v) => setDatePreset(v as ReportDatePreset)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filters.dateRange.preset === "custom" && (
            <>
              <div className="flex flex-col gap-1">
                <Label htmlFor="reports-start" className="text-xs">
                  From
                </Label>
                <Input
                  id="reports-start"
                  type="date"
                  value={filters.dateRange.startDate}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, startDate: e.target.value },
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="reports-end" className="text-xs">
                  To
                </Label>
                <Input
                  id="reports-end"
                  type="date"
                  value={filters.dateRange.endDate}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, endDate: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <Label className="text-xs">Class</Label>
            <Select
              value={filters.classId === null || filters.classId === "" ? "all" : filters.classId}
              onValueChange={(v) => onFiltersChange({ ...filters, classId: v === "all" ? null : v })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.grade ?? ""}
                    {c.division ? `-${c.division}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showExamFilter && (
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Exam</Label>
              <Select
                value={filters.examId === null || filters.examId === "" ? "all" : filters.examId}
                onValueChange={(v) => onFiltersChange({ ...filters, examId: v === "all" ? null : v })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All exams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All exams</SelectItem>
                  {exams.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name ?? "Exam"} {e.year ? `(${e.year})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showCompareToggle && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="compare-period"
                checked={filters.compareWithPrevious}
                onChange={(e) =>
                  onFiltersChange({ ...filters, compareWithPrevious: e.target.checked })
                }
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="compare-period" className="text-sm">
                Compare to previous period
              </Label>
            </div>
          )}

          <Button variant="secondary" size="sm" className="shrink-0">
            <Filter className="h-4 w-4 mr-1" />
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
