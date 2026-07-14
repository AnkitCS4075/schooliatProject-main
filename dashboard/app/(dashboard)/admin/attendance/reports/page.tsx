"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { downloadFromApi } from "@/lib/api/client";
import { useAttendanceReports } from "@/lib/hooks/use-reports";
import { useTeachersPage, TEACHERS_MAX_PAGE_SIZE } from "@/lib/hooks/use-teachers";
import { useStaffPage } from "@/lib/hooks/use-staff";
import { downloadTablePdf, formatDateLabel } from "@/lib/attendance/export-attendance";
import { useAllClasses } from "@/lib/hooks/use-classes";
import { useStudents } from "@/lib/hooks/use-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { usePortalPeriod } from "@/lib/context/portal-period-context";
import { Switch } from "@/components/ui/switch";

const COLORS = {
  PRESENT: "#84cc16",
  ABSENT: "#ef4444",
  LATE: "#f59e0b",
};

export default function AttendanceReportsPage() {
  const { portalMonth, getMonthDateRange } = usePortalPeriod();
  const [syncPortalMonth, setSyncPortalMonth] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");
  const [selectedMarkedById, setSelectedMarkedById] = useState<string>("all");

  useEffect(() => {
    if (!syncPortalMonth) return;
    const r = getMonthDateRange();
    setDateRange({ startDate: r.startDate, endDate: r.endDate });
  }, [portalMonth, syncPortalMonth, getMonthDateRange]);

  // Fetch classes
  const { data: classesData, isLoading: classesLoading } = useAllClasses();
  const classes = classesData?.data || [];

  // Fetch students for selected class
  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    page: 1,
    limit: 1000,
  });
  const allStudents = studentsData?.data || [];
  const filteredStudents = selectedClassId && selectedClassId !== "all"
    ? allStudents.filter((s: any) => s.studentProfile?.classId === selectedClassId)
    : [];

  const { data: teachersForMarkers } = useTeachersPage(1, TEACHERS_MAX_PAGE_SIZE);
  const { data: staffForMarkers } = useStaffPage(1, 500);

  const markerOptions = useMemo(() => {
    const t = (teachersForMarkers?.data || []).map((u: { id: string; firstName: string; lastName?: string; publicUserId?: string }) => ({
      id: u.id,
      label: `${u.firstName} ${u.lastName || ""}`.trim() + (u.publicUserId ? ` (${u.publicUserId})` : ""),
      kind: "Teacher" as const,
    }));
    const s = (staffForMarkers?.data || []).map((u: { id: string; firstName: string; lastName?: string; publicUserId?: string }) => ({
      id: u.id,
      label: `${u.firstName} ${u.lastName || ""}`.trim() + (u.publicUserId ? ` (${u.publicUserId})` : ""),
      kind: "Staff" as const,
    }));
    return [...t, ...s].sort((a, b) => a.label.localeCompare(b.label));
  }, [teachersForMarkers?.data, staffForMarkers?.data]);

  // Fetch attendance reports
  const { data: reportsData, isLoading: reportsLoading } = useAttendanceReports({
    classId: selectedClassId && selectedClassId !== "all" ? selectedClassId : undefined,
    studentId: selectedStudentId && selectedStudentId !== "all" ? selectedStudentId : undefined,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    markedBy: selectedMarkedById && selectedMarkedById !== "all" ? selectedMarkedById : undefined,
  });

  const attendanceRecords = reportsData?.data || [];
  const statistics = reportsData?.statistics || {};

  const sortedAttendanceRecords = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return [];
    return [...attendanceRecords].sort((a: any, b: any) => {
      // 1. Sort by Roll Number (primary)
      const rollA = parseInt(String(a.student?.studentProfile?.rollNumber ?? "99999"), 10);
      const rollB = parseInt(String(b.student?.studentProfile?.rollNumber ?? "99999"), 10);
      if (rollA !== rollB) return rollA - rollB;

      // 2. Sort by Class Grade
      const classA = a.student?.studentProfile?.class;
      const classB = b.student?.studentProfile?.class;
      const gradeA = String(classA?.grade || "").toLowerCase();
      const gradeB = String(classB?.grade || "").toLowerCase();
      if (gradeA !== gradeB) return gradeA.localeCompare(gradeB);

      // 3. Sort by Class Division
      const divA = String(classA?.division || "").toLowerCase();
      const divB = String(classB?.division || "").toLowerCase();
      if (divA !== divB) return divA.localeCompare(divB);

      // 4. Sort by Date (Descending)
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [attendanceRecords]);

  // Process data for charts
  const dailyAttendanceData = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return [];

    // Group by date
    const groupedByDate: Record<string, { present: number; absent: number; late: number }> = {};

    attendanceRecords.forEach((record: any) => {
      const dateKey = format(new Date(record.date), "MMM dd");
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { present: 0, absent: 0, late: 0 };
      }

      if (record.status === "PRESENT") {
        groupedByDate[dateKey].present++;
      } else if (record.status === "ABSENT") {
        groupedByDate[dateKey].absent++;
      } else if (record.status === "LATE") {
        groupedByDate[dateKey].late++;
      }
    });

    return Object.entries(groupedByDate)
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  }, [attendanceRecords]);

  const statusDistributionData = useMemo(() => {
    const present = statistics.presentCount || 0;
    const absent = statistics.absentCount || 0;
    const late = statistics.lateCount || 0;
    const total = present + absent + late;

    return [
      { name: "Present", value: present, percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0 },
      { name: "Absent", value: absent, percentage: total > 0 ? ((absent / total) * 100).toFixed(1) : 0 },
      { name: "Late", value: late, percentage: total > 0 ? ((late / total) * 100).toFixed(1) : 0 },
    ].filter((item) => item.value > 0);
  }, [statistics]);

  const classWiseData = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return [];

    const groupedByClass: Record<
      string,
      { present: number; absent: number; late: number; total: number }
    > = {};

    attendanceRecords.forEach((record: any) => {
      const className =
        record.student?.studentProfile?.class?.grade +
        (record.student?.studentProfile?.class?.division
          ? `-${record.student.studentProfile.class.division}`
          : "") || "Unknown";

      if (!groupedByClass[className]) {
        groupedByClass[className] = { present: 0, absent: 0, late: 0, total: 0 };
      }

      groupedByClass[className].total++;
      if (record.status === "PRESENT") {
        groupedByClass[className].present++;
      } else if (record.status === "ABSENT") {
        groupedByClass[className].absent++;
      } else if (record.status === "LATE") {
        groupedByClass[className].late++;
      }
    });

    return Object.entries(groupedByClass).map(([className, counts]) => ({
      className,
      ...counts,
      attendanceRate:
        counts.total > 0 ? ((counts.present / counts.total) * 100).toFixed(1) : 0,
    }));
  }, [attendanceRecords]);

  const saveBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleExportCsv = async () => {
    try {
      const blob = await downloadFromApi("/attendance/report", {
        query: {
          format: "csv",
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          ...(selectedClassId && selectedClassId !== "all" ? { classId: selectedClassId } : {}),
          ...(selectedStudentId && selectedStudentId !== "all" ? { studentId: selectedStudentId } : {}),
          ...(selectedMarkedById && selectedMarkedById !== "all" ? { markedBy: selectedMarkedById } : {}),
        },
      });
      saveBlob(blob, `attendance_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
      toast.success("Excel-compatible CSV downloaded");
    } catch (error: any) {
      toast.error(error?.message || "Failed to export report");
    }
  };

  const handleExportPdf = () => {
    try {
      if (!sortedAttendanceRecords.length) {
        toast.error("No records to export");
        return;
      }
      const headers = [
        "Roll",
        "Date",
        "Student",
        "Class",
        "Status",
        "Recorded by",
        "Staff ID",
      ];
      const rows = sortedAttendanceRecords.map((record: any) => {
        const name = `${record.student?.firstName || ""} ${record.student?.lastName || ""}`.trim();
        const cls =
          (record.student?.studentProfile?.class?.grade || "") +
          (record.student?.studentProfile?.class?.division
            ? `-${record.student.studentProfile.class.division}`
            : "");
        const mb = record.markedByUser;
        const who = mb
          ? `${mb.firstName || ""} ${mb.lastName || ""}`.trim()
          : "—";
        const staffId = mb?.publicUserId || "—";
        return [
          String(record.student?.studentProfile?.rollNumber ?? "—"),
          format(new Date(record.date), "MMM dd, yyyy"),
          name,
          cls || "—",
          String(record.status ?? "—"),
          who,
          staffId,
        ];
      });
      downloadTablePdf({
        title: "Attendance report",
        subtitle: `${formatDateLabel(dateRange.startDate)} – ${formatDateLabel(dateRange.endDate)}`,
        headers,
        rows,
        filename: `attendance_report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`,
      });
      toast.success("PDF downloaded");
    } catch (error: any) {
      toast.error(error?.message || "Failed to build PDF");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return (
          <Badge className="bg-primary hover:bg-schooliat-primary-dark">
            <CheckCircle className="h-3 w-3 mr-1" />
            Present
          </Badge>
        );
      case "ABSENT":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Absent
          </Badge>
        );
      case "LATE":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Late
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Attendance Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive attendance analytics and reports</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void handleExportCsv()} className="gap-2" variant="outline">
            <Download className="h-4 w-4" />
            Excel (CSV)
          </Button>
          <Button onClick={handleExportPdf} className="gap-2" variant="outline">
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              {classesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.grade}
                        {cls.division ? `-${cls.division}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              {studentsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                  disabled={!selectedClassId || selectedClassId === "all"}
                >
                  <SelectTrigger id="student">
                    <SelectValue placeholder={selectedClassId && selectedClassId !== "all" ? "Select Student" : "Select Class First"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {filteredStudents.map((student: any) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} - {student.publicUserId || student.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="marked-by">Recorded by (teacher / staff)</Label>
              <Select value={selectedMarkedById} onValueChange={setSelectedMarkedById}>
                <SelectTrigger id="marked-by">
                  <SelectValue placeholder="Anyone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Anyone</SelectItem>
                  {markerOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label} · {m.kind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-full flex items-center gap-3 py-1">
              <Switch
                id="attendance-portal-month"
                checked={syncPortalMonth}
                onCheckedChange={(c) => {
                  const on = c === true;
                  setSyncPortalMonth(on);
                  if (on) {
                    const r = getMonthDateRange();
                    setDateRange({ startDate: r.startDate, endDate: r.endDate });
                  }
                }}
              />
              <Label htmlFor="attendance-portal-month" className="text-sm font-normal cursor-pointer mb-0">
                Use portal month for date range (matches navbar month selector)
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => {
                  setSyncPortalMonth(false);
                  setDateRange({ ...dateRange, startDate: e.target.value });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => {
                  setSyncPortalMonth(false);
                  setDateRange({ ...dateRange, endDate: e.target.value });
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {reportsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-3xl font-bold">{statistics.totalDays || 0}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-primary" />
                <div className="text-3xl font-bold text-primary">
                  {statistics.presentCount || 0}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="text-3xl font-bold text-red-600">{statistics.absentCount || 0}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
                <div className="text-3xl font-bold text-yellow-600">
                  {statistics.attendanceRate || "0.00"}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {reportsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Attendance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyAttendanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="present"
                      stroke={COLORS.PRESENT}
                      strokeWidth={2}
                      name="Present"
                    />
                    <Line
                      type="monotone"
                      dataKey="absent"
                      stroke={COLORS.ABSENT}
                      strokeWidth={2}
                      name="Absent"
                    />
                    <Line
                      type="monotone"
                      dataKey="late"
                      stroke={COLORS.LATE}
                      strokeWidth={2}
                      name="Late"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No data available for the selected period</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {statusDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: ${entry.percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === "Present"
                              ? COLORS.PRESENT
                              : entry.name === "Absent"
                                ? COLORS.ABSENT
                                : COLORS.LATE
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No data available for the selected period</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Class-wise Attendance */}
          {classWiseData.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Class-wise Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classWiseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill={COLORS.PRESENT} name="Present" />
                    <Bar dataKey="absent" fill={COLORS.ABSENT} name="Absent" />
                    <Bar dataKey="late" fill={COLORS.LATE} name="Late" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Attendance Records Table */}
      <AttendanceRecordsTable
        records={sortedAttendanceRecords}
        isLoading={reportsLoading}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
}

function AttendanceRecordsTable({
  records,
  isLoading,
  getStatusBadge,
}: {
  records: any[];
  isLoading: boolean;
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [recordsPage, setRecordsPage] = useState(0);
  const pageSize = 25;

  const filtered = useMemo(() => {
    let list = records;
    if (statusFilter !== "ALL") {
      list = list.filter((r: any) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r: any) => {
        const name = `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.toLowerCase();
        const roll = String(r.student?.studentProfile?.rollNumber ?? "");
        const userId = (r.student?.publicUserId || "").toLowerCase();
        const mb = r.markedByUser;
        const marker = `${mb?.firstName || ""} ${mb?.lastName || ""} ${mb?.publicUserId || ""}`.toLowerCase();
        return name.includes(q) || roll.includes(q) || userId.includes(q) || marker.includes(q);
      });
    }
    return list;
  }, [records, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(recordsPage * pageSize, (recordsPage + 1) * pageSize);

  useEffect(() => {
    setRecordsPage(0);
  }, [search, statusFilter]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle>Attendance Records ({filtered.length})</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Search student, roll, or who recorded…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No attendance records found{search ? " matching your search" : ""}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-schooliat-tint">
                    <TableHead>Roll No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recorded by</TableHead>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Late Arrival</TableHead>
                    <TableHead>Absence Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((record: any, index: number) => (
                    <TableRow key={record.id || index}>
                      <TableCell className="font-medium">
                        {record.student?.studentProfile?.rollNumber ?? "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {format(new Date(record.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {record.student?.firstName || ""} {record.student?.lastName || ""}
                        {record.student?.publicUserId && (
                          <span className="text-gray-500 text-sm ml-2">
                            ({record.student.publicUserId})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.student?.studentProfile?.class?.grade || "N/A"}
                        {record.student?.studentProfile?.class?.division
                          ? `-${record.student.studentProfile.class.division}`
                          : ""}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-sm">
                        {record.markedByUser
                          ? `${record.markedByUser.firstName || ""} ${record.markedByUser.lastName || ""}`.trim()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {record.markedByUser?.publicUserId ?? "—"}
                      </TableCell>
                      <TableCell>
                        {record.lateArrivalTime
                          ? format(new Date(record.lateArrivalTime), "hh:mm a")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.absenceReason || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Page {recordsPage + 1} of {totalPages} ({filtered.length} records)
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRecordsPage((p) => Math.max(0, p - 1))} disabled={recordsPage === 0}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setRecordsPage((p) => Math.min(totalPages - 1, p + 1))} disabled={recordsPage >= totalPages - 1}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

