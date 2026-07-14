"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  useAttendanceReports,
  useFeeAnalytics,
  useAcademicReports,
  useSalaryReports,
  useDashboardSummary,
  useExamsForReports,
} from "@/lib/hooks/use-reports";
import { useAllClasses } from "@/lib/hooks/use-classes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDateRangeForPreset } from "@/lib/utils/analytics";
import { useAcademicYear } from "@/lib/context/academic-year-context";
import type { ReportFilters as ReportFiltersType } from "@/lib/types/reports";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ExportReportMenu } from "@/components/reports/ExportReportMenu";
import { DashboardSummaryStrip } from "@/components/reports/DashboardSummaryStrip";
import { AttendanceSection } from "@/components/reports/AttendanceSection";
import { FeeSection } from "@/components/reports/FeeSection";
import { AcademicSection } from "@/components/reports/AcademicSection";
import { SalarySection } from "@/components/reports/SalarySection";
import { usePortalPeriod } from "@/lib/context/portal-period-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const defaultRange = getDateRangeForPreset("last30");

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"attendance" | "fees" | "academic" | "salary">("attendance");
  const [filters, setFilters] = useState<ReportFiltersType>({
    dateRange: defaultRange,
    classId: null,
    examId: null,
    compareWithPrevious: false,
  });
  const { portalMonth, getMonthDateRange } = usePortalPeriod();
  const [portalDateSync, setPortalDateSync] = useState(true);
  const prevDateRangeRef = useRef(filters.dateRange);

  useEffect(() => {
    prevDateRangeRef.current = filters.dateRange;
  }, [filters.dateRange]);

  const handleFiltersChange = (f: ReportFiltersType) => {
    const prev = prevDateRangeRef.current;
    const dateChanged =
      f.dateRange.startDate !== prev.startDate ||
      f.dateRange.endDate !== prev.endDate ||
      f.dateRange.preset !== prev.preset;
    if (dateChanged) setPortalDateSync(false);
    setFilters(f);
  };

  useEffect(() => {
    if (!portalDateSync) return;
    const r = getMonthDateRange();
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        preset: "custom",
        startDate: r.startDate,
        endDate: r.endDate,
      },
    }));
  }, [portalMonth, portalDateSync, getMonthDateRange]);

  const { selectedYear } = useAcademicYear();
  const { data: classesData } = useAllClasses();
  const { data: examsData } = useExamsForReports({ limit: 500 });
  const { data: summaryData, isLoading: summaryLoading } = useDashboardSummary({
    academicYear: selectedYear
  });

  const classes = useMemo(() => classesData?.data ?? [], [classesData]);
  const exams = useMemo(() => examsData?.data ?? [], [examsData]);

  const { data: attendanceData, isLoading: attendanceLoading } = useAttendanceReports({
    classId: filters.classId && filters.classId !== "all" ? filters.classId : undefined,
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
  });

  const { data: feeData, isLoading: feeLoading } = useFeeAnalytics({
    classId: filters.classId && filters.classId !== "all" ? filters.classId : undefined,
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
  });

  const { data: academicData, isLoading: academicLoading } = useAcademicReports({
    classId: filters.classId && filters.classId !== "all" ? filters.classId : undefined,
    examId: filters.examId ?? undefined,
  });

  const { data: salaryData, isLoading: salaryLoading } = useSalaryReports({
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
  });

  const attendanceReport = attendanceData?.data ?? [];
  const attendanceStats = attendanceData?.statistics ?? {};
  const feeAnalytics = feeData?.data ?? [];
  const feeStats = feeData?.statistics ?? {};
  const academicReport = academicData?.data ?? [];
  const academicStats = academicData?.statistics ?? {};
  const salaryReport = salaryData?.data ?? [];
  const salaryStats = salaryData?.statistics ?? {};

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive reports and analytics for school administration
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Switch
              id="reports-portal-sync"
              checked={portalDateSync}
              onCheckedChange={(c) => {
                const on = c === true;
                setPortalDateSync(on);
                if (on) {
                  const r = getMonthDateRange();
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      preset: "custom",
                      startDate: r.startDate,
                      endDate: r.endDate,
                    },
                  }));
                }
              }}
            />
            <Label htmlFor="reports-portal-sync" className="text-sm font-normal cursor-pointer mb-0">
              Date range follows portal month
            </Label>
          </div>
        </div>
        <ExportReportMenu
          tab={activeTab}
          attendanceData={attendanceReport}
          feeData={feeAnalytics}
          academicData={academicReport}
          salaryData={salaryReport}
        />
      </div>

      <DashboardSummaryStrip summary={summaryData?.data} isLoading={summaryLoading} />

      <ReportFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        classes={classes}
        exams={exams}
        showExamFilter
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceSection
            data={attendanceReport}
            statistics={attendanceStats}
            isLoading={attendanceLoading}
          />
        </TabsContent>

        <TabsContent value="fees" className="mt-6">
          <FeeSection
            data={feeAnalytics}
            statistics={feeStats}
            isLoading={feeLoading}
          />
        </TabsContent>

        <TabsContent value="academic" className="mt-6">
          <AcademicSection
            data={academicReport}
            statistics={academicStats}
            isLoading={academicLoading}
          />
        </TabsContent>

        <TabsContent value="salary" className="mt-6">
          <SalarySection
            data={salaryReport}
            statistics={salaryStats}
            isLoading={salaryLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
