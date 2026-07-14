"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAttendance, useMarkAttendance, useMarkBulkAttendance, useAttendanceStatistics, useAttendancePeriods } from "@/lib/hooks/use-attendance";
import { AttendanceMarkingTable } from "@/components/attendance/attendance-marking-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Calendar, Download, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { useClassesContext } from "@/lib/context/classes-context";
import { useStudents } from "@/lib/hooks/use-students";
import { resolveStudentAttendanceRow } from "@/lib/attendance/resolve-student-attendance";
import { isAttendanceDateLocked } from "@/lib/attendance/attendance-date-policy";
import {
  downloadCsv,
  downloadTablePdf,
  formatDateLabel,
} from "@/lib/attendance/export-attendance";

export default function AttendancePage() {
  const router = useRouter();
  const { classes, isLoading: classesLoading } = useClassesContext();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  /** `"all"` = every period + daily rows; otherwise attendance period UUID */
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"mark" | "view" | "report">("mark");

  const periodQueryParam =
    selectedPeriodId && selectedPeriodId !== "all" ? selectedPeriodId : undefined;

  // Fetch students for the selected class
  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    classId: selectedClassId,
    limit: 1000
  });

  // Since we fetch by classId, studentsData already contains the filtered list
  const filteredStudents = selectedClassId ? (studentsData?.data || []) : [];

  // Fetch attendance for selected date and class
  const { data: attendanceData, isLoading: attendanceLoading, refetch } = useAttendance({
    classId: selectedClassId || undefined,
    date: selectedDate,
    periodId: periodQueryParam,
  });

  // Fetch attendance statistics
  const { data: statisticsData } = useAttendanceStatistics({
    classId: selectedClassId || undefined,
    startDate: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    periodId: periodQueryParam,
  });

  // Fetch attendance periods
  const { data: periodsData } = useAttendancePeriods();
  const periods = periodsData?.data || [];

  const markAttendance = useMarkAttendance();
  const markBulkAttendance = useMarkBulkAttendance();

  const handleMarkAttendance = useCallback(
    async (data: {
      studentId: string;
      status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
      lateArrivalTime?: string;
      absenceReason?: string;
    }) => {
      if (!selectedClassId) {
        toast.error("Please select a class");
        return;
      }
      if (isAttendanceDateLocked(selectedDate)) {
        toast.error(
          "Attendance cannot be marked or edited more than 48 hours after the attendance date."
        );
        return;
      }

      try {
        await markAttendance.mutateAsync({
          ...data,
          classId: selectedClassId,
          date: selectedDate,
          ...(periodQueryParam ? { periodId: periodQueryParam } : {}),
        });
        toast.success("Attendance marked successfully");
        refetch();
      } catch (error: any) {
        toast.error(error?.message || "Failed to mark attendance");
      }
    },
    [selectedClassId, selectedDate, periodQueryParam, markAttendance, refetch]
  );

  const handleBulkMarkAll = useCallback(
    async (status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY") => {
      if (!selectedClassId) {
        toast.error("Please select a class");
        return;
      }
      if (isAttendanceDateLocked(selectedDate)) {
        toast.error(
          "Attendance cannot be marked or edited more than 48 hours after the attendance date."
        );
        return;
      }

      if (filteredStudents.length === 0) {
        toast.error("No students found for this class");
        return;
      }

      try {
        const attendances = filteredStudents.map((student: any) => ({
          studentId: student.id,
          classId: selectedClassId,
          date: selectedDate,
          status,
          ...(periodQueryParam ? { periodId: periodQueryParam } : {}),
        }));

        await markBulkAttendance.mutateAsync({ attendances });
        toast.success(`Marked all students as ${status}`);
        refetch();
      } catch (error: any) {
        toast.error(error?.message || "Failed to mark bulk attendance");
      }
    },
    [selectedClassId, selectedDate, periodQueryParam, filteredStudents, markBulkAttendance, refetch]
  );

  const handleBulkMarkSelected = useCallback(
    async (
      status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY",
      studentIds: string[]
    ) => {
      if (!selectedClassId) {
        toast.error("Please select a class");
        return;
      }
      if (isAttendanceDateLocked(selectedDate)) {
        toast.error(
          "Attendance cannot be marked or edited more than 48 hours after the attendance date."
        );
        return;
      }
      if (studentIds.length === 0) {
        toast.error("No students selected");
        return;
      }

      try {
        const attendances = studentIds.map((studentId) => ({
          studentId,
          classId: selectedClassId,
          date: selectedDate,
          status,
          ...(periodQueryParam ? { periodId: periodQueryParam } : {}),
        }));

        await markBulkAttendance.mutateAsync({ attendances });
        toast.success(`Marked ${studentIds.length} student(s) as ${status}`);
        refetch();
      } catch (error: any) {
        toast.error(error?.message || "Failed to mark bulk attendance");
      }
    },
    [selectedClassId, selectedDate, periodQueryParam, markBulkAttendance, refetch]
  );

  const tableStudents = useMemo(() => {
    const rows = attendanceData?.data;
    return filteredStudents.map((student: any) => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      rollNumber: student.studentProfile?.rollNumber,
      attendance: resolveStudentAttendanceRow(
        rows,
        student.id,
        periodQueryParam ?? null
      ),
    }));
  }, [filteredStudents, attendanceData?.data, periodQueryParam]);

  const statistics = statisticsData?.data || {};
  const presentCount = statistics.present ?? statistics.presentCount ?? 0;
  const absentCount = statistics.absent ?? statistics.absentCount ?? 0;
  const lateCount = statistics.late ?? statistics.lateCount ?? 0;
  const halfDayCount = statistics.halfDay ?? 0;
  const totalCount = statistics.total ?? statistics.totalCount ?? 0;
  const attendancePercentage =
    totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : "0";

  const dateLocked = isAttendanceDateLocked(selectedDate);

  const selectedClassLabel = useMemo(() => {
    const cls = classes?.find((c) => c.id === selectedClassId);
    if (!cls) return "";
    return cls.division ? `${cls.grade}-${cls.division}` : String(cls.grade);
  }, [classes, selectedClassId]);

  const exportMarkingSheet = useCallback(
    (kind: "csv" | "pdf") => {
      if (!selectedClassId || tableStudents.length === 0) {
        toast.error("Select a class with students to export");
        return;
      }
      const headers = [
        "No",
        "Roll No",
        "Student name",
        "Status",
        "Late time",
        "Absence reason",
        "Recorded",
      ];
      const rows = tableStudents.map((s: (typeof tableStudents)[number], i: number) => {
        const att = s.attendance;
        const recorded = att ? "Yes" : "No";
        return [
          String(i + 1),
          String(s.rollNumber ?? "—"),
          `${s.firstName} ${s.lastName}`.trim(),
          att?.status ?? "Not recorded",
          att?.lateArrivalTime ?? "—",
          att?.absenceReason ?? "—",
          recorded,
        ];
      });
      const subtitle = `${selectedClassLabel || "Class"} · ${formatDateLabel(selectedDate)}`;
      const base = `attendance_${selectedClassLabel || "class"}_${selectedDate}`;
      if (kind === "csv") {
        downloadCsv(`${base}.csv`, headers, rows);
      } else {
        downloadTablePdf({
          title: "Student attendance (marking view)",
          subtitle,
          headers,
          rows,
          filename: `${base}.pdf`,
        });
      }
      toast.success(kind === "csv" ? "Excel-compatible CSV downloaded" : "PDF downloaded");
    },
    [selectedClassId, selectedClassLabel, selectedDate, tableStudents]
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Attendance Management</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === "mark" ? "view" : "mark")}
          >
            {viewMode === "mark" ? "View Mode" : "Mark Mode"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/attendance/reports")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Class</Label>
              {classesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.division ? `${cls.grade}-${cls.division}` : cls.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              {dateLocked ? (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                  This date is closed for marking: changes are not allowed more than 48 hours after
                  the attendance day.
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Period (Optional)</Label>
              <Select
                value={selectedPeriodId}
                onValueChange={setSelectedPeriodId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {periods.map((period: any) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name} ({period.startTime} - {period.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {selectedClassId && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Records (period)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{presentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Late</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Half day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-800">{halfDayCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Present %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{attendancePercentage}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      {selectedClassId ? (
        studentsLoading ? (
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>
                Attendance for {format(new Date(selectedDate), "MMMM dd, yyyy")}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => exportMarkingSheet("csv")}
                  className="gap-1"
                >
                  <Download className="h-4 w-4" />
                  Excel (CSV)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => exportMarkingSheet("pdf")}
                  className="gap-1"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AttendanceMarkingTable
                key={`${selectedClassId}-${selectedDate}-${selectedPeriodId}`}
                students={tableStudents}
                date={selectedDate}
                classId={selectedClassId}
                onMarkAttendance={handleMarkAttendance}
                onBulkMark={handleBulkMarkAll}
                onBulkMarkSelected={handleBulkMarkSelected}
                isDateLocked={dateLocked}
                isLoading={markAttendance.isPending || markBulkAttendance.isPending}
              />
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Please select a class to view and mark attendance</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

