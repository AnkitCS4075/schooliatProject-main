"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { isAttendanceDateLocked } from "@/lib/attendance/attendance-date-policy";
import {
  downloadCsv,
  downloadTablePdf,
  formatDateLabel,
} from "@/lib/attendance/export-attendance";
import { useStaffPage } from "@/lib/hooks/use-staff";
import { TEACHERS_MAX_PAGE_SIZE, useTeachersPage } from "@/lib/hooks/use-teachers";
import { useAttendance, useMarkBulkAttendance } from "@/lib/hooks/use-attendance";
import { useClassesContext } from "@/lib/context/classes-context";
import {
  StaffAttendanceTable,
  type StaffAttendanceRow,
  type StaffAttendanceStatus,
} from "@/components/attendance/staff-attendance-table";
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
import { Calendar, CheckCircle2, Clock, Download } from "lucide-react";
import { format } from "date-fns";

type RoleFilter = "all" | "teacher" | "staff";

export default function StaffAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusMap, setStatusMap] = useState<
    Record<string, StaffAttendanceStatus>
  >({});

  const { classes } = useClassesContext();

  const { data: staffData, isLoading: staffLoading } = useStaffPage(1, 500);
  const { data: teachersData, isLoading: teachersLoading } = useTeachersPage(
    1,
    TEACHERS_MAX_PAGE_SIZE
  );

  const { data: attendanceData, isLoading: attendanceLoading, refetch } =
    useAttendance({
      date: selectedDate,
    });

  const markBulkAttendance = useMarkBulkAttendance();

  const allMembers: StaffAttendanceRow[] = useMemo(() => {
    const staffList = (staffData?.data || []).map((s: { id: string; firstName: string; lastName?: string; email?: string; publicUserId?: string }) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      publicUserId: s.publicUserId,
      kind: "STAFF" as const,
    }));
    const teacherList = (teachersData?.data || []).map((t: { id: string; firstName: string; lastName?: string; email?: string; publicUserId?: string }) => ({
      id: t.id,
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      publicUserId: t.publicUserId,
      kind: "TEACHER" as const,
    }));
    return [...teacherList, ...staffList];
  }, [staffData, teachersData]);

  const existingAttendance = useMemo(
    () => attendanceData?.data ?? [],
    [attendanceData?.data]
  );

  const getStatus = useCallback(
    (staffId: string): StaffAttendanceStatus | null => {
      if (statusMap[staffId]) return statusMap[staffId];
      const existing = existingAttendance.find(
        (a: { studentId: string; status?: string }) => a.studentId === staffId
      );
      const st = existing?.status;
      if (
        st === "PRESENT" ||
        st === "ABSENT" ||
        st === "LATE" ||
        st === "HALF_DAY"
      ) {
        return st;
      }
      return null;
    },
    [statusMap, existingAttendance]
  );

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allMembers.filter((m) => {
      if (roleFilter === "teacher" && m.kind !== "TEACHER") return false;
      if (roleFilter === "staff" && m.kind !== "STAFF") return false;
      if (!q) return true;
      const name = `${m.firstName} ${m.lastName || ""}`.toLowerCase();
      const email = (m.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [allMembers, search, roleFilter]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let halfDay = 0;
    let unmarked = 0;
    for (const m of filteredMembers) {
      const s = getStatus(m.id);
      if (!s) unmarked++;
      else if (s === "PRESENT") present++;
      else if (s === "ABSENT") absent++;
      else if (s === "LATE") late++;
      else if (s === "HALF_DAY") halfDay++;
    }
    const total = filteredMembers.length;
    const marked = total - unmarked;
    const pct =
      marked > 0
        ? (((present + late + halfDay) / marked) * 100).toFixed(1)
        : "0";
    return {
      total,
      present,
      absent,
      late,
      halfDay,
      unmarked,
      marked,
      pct,
    };
  }, [filteredMembers, getStatus]);

  const setRowStatus = useCallback((id: string, status: StaffAttendanceStatus) => {
    setStatusMap((prev) => ({ ...prev, [id]: status }));
  }, []);

  const dateLocked = isAttendanceDateLocked(selectedDate);
  const effectiveClassId = classes?.[0]?.id || "";

  const handleBulkMarkApi = useCallback(
    async (
      status: StaffAttendanceStatus,
      memberIds: string[]
    ) => {
      if (!effectiveClassId) {
        toast.error("No class is configured for this school");
        return;
      }
      if (dateLocked) {
        toast.error(
          "Attendance cannot be marked or edited more than 48 hours after the attendance date."
        );
        return;
      }
      if (memberIds.length === 0) {
        toast.error("No people to mark");
        return;
      }
      try {
        await markBulkAttendance.mutateAsync({
          attendances: memberIds.map((studentId) => ({
            studentId,
            classId: effectiveClassId,
            date: selectedDate,
            status,
          })),
        });
        toast.success(
          `Marked ${memberIds.length} as ${status.replace("_", " ").toLowerCase()}`
        );
        setStatusMap({});
        await refetch();
      } catch (error: unknown) {
        const msg =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: string }).message)
            : "Failed to mark attendance";
        toast.error(msg);
      }
    },
    [effectiveClassId, selectedDate, dateLocked, markBulkAttendance, refetch]
  );

  const handleSavePending = useCallback(async () => {
    const entries = Object.entries(statusMap);
    if (!effectiveClassId) {
      toast.error("No class is configured for this school");
      return;
    }
    if (dateLocked) {
      toast.error(
        "Attendance cannot be marked or edited more than 48 hours after the attendance date."
      );
      return;
    }
    if (entries.length === 0) {
      toast.error("No attendance changes to save");
      return;
    }
    try {
      await markBulkAttendance.mutateAsync({
        attendances: entries.map(([studentId, status]) => ({
          studentId,
          classId: effectiveClassId,
          date: selectedDate,
          status,
        })),
      });
      toast.success(`Saved attendance for ${entries.length} people`);
      setStatusMap({});
      await refetch();
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to save attendance";
      toast.error(msg);
    }
  }, [statusMap, effectiveClassId, selectedDate, dateLocked, markBulkAttendance, refetch]);

  const exportStaffAttendance = useCallback(
    (kind: "csv" | "pdf") => {
      if (!effectiveClassId || filteredMembers.length === 0) {
        toast.error("Ensure there are people in the list");
        return;
      }
      const headers = ["Name", "Staff ID", "Role", "Present / Absent"];
      const rows = filteredMembers.map((m) => {
        const st = getStatus(m.id);
        const label =
          st === "PRESENT"
            ? "Present"
            : st === "ABSENT"
              ? "Absent"
              : st === "LATE"
                ? "Late"
                : st === "HALF_DAY"
                  ? "Half day"
                  : "Not marked";
        return [
          `${m.firstName} ${m.lastName || ""}`.trim(),
          m.publicUserId ?? "—",
          m.kind === "TEACHER" ? "Teacher" : "Staff",
          label,
        ];
      });
      const cls = classes?.find((c) => c.id === effectiveClassId);
      const schoolUnitLabel = cls
        ? cls.division
          ? `${cls.grade}-${cls.division}`
          : String(cls.grade)
        : "school";
      const subtitle = `${formatDateLabel(selectedDate)}`;
      const base = `staff_attendance_${schoolUnitLabel}_${selectedDate}`;
      if (kind === "csv") {
        downloadCsv(`${base}.csv`, headers, rows);
      } else {
        downloadTablePdf({
          title: "Staff & teacher attendance",
          subtitle,
          headers,
          rows,
          filename: `${base}.pdf`,
        });
      }
      toast.success(kind === "csv" ? "Excel-compatible CSV downloaded" : "PDF downloaded");
    },
    [effectiveClassId, selectedDate, filteredMembers, getStatus, classes]
  );

  const isLoading = staffLoading || teachersLoading;
  const changedCount = Object.keys(statusMap).length;
  const tableLoading = isLoading || (effectiveClassId ? attendanceLoading : false);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Staff &amp; Teacher Attendance</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setStatusMap({});
                }}
              />
              {dateLocked ? (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                  This date is closed for marking: changes are not allowed more than 48 hours after
                  the attendance day.
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={roleFilter}
                onValueChange={(v) => setRoleFilter(v as RoleFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="teacher">Teachers only</SelectItem>
                  <SelectItem value="staff">Staff only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="staff-att-search">Search</Label>
            <Input
              id="staff-att-search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {effectiveClassId && !isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In view
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {summary.present}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                Absent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summary.absent}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">
                Late
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {summary.late}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">
                Half day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-800">
                {summary.halfDay}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unmarked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.unmarked}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">
                Present % (marked)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">
                {summary.pct}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tableLoading ? (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ) : !effectiveClassId ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No class found. Add a class to enable staff or teacher attendance.</p>
            </div>
          </CardContent>
        </Card>
      ) : allMembers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No staff or teachers found for this school.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Attendance for{" "}
              {format(new Date(selectedDate), "MMMM dd, yyyy")}
              {filteredMembers.length !== allMembers.length && (
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  ({filteredMembers.length} shown)
                </span>
              )}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                disabled={
                  !effectiveClassId ||
                  filteredMembers.length === 0 ||
                  markBulkAttendance.isPending ||
                  dateLocked
                }
                onClick={() =>
                  handleBulkMarkApi(
                    "PRESENT",
                    filteredMembers.map((m) => m.id)
                  )
                }
                className="gap-2 text-green-800 border-green-300 hover:bg-green-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark all present
              </Button>
              <Button
                variant="outline"
                disabled={
                  !effectiveClassId ||
                  filteredMembers.length === 0 ||
                  markBulkAttendance.isPending ||
                  dateLocked
                }
                onClick={() =>
                  handleBulkMarkApi(
                    "ABSENT",
                    filteredMembers.map((m) => m.id)
                  )
                }
                className="gap-2 text-red-800 border-red-300 hover:bg-red-50"
              >
                Mark all absent
              </Button>
              <Button
                variant="outline"
                disabled={
                  !effectiveClassId ||
                  filteredMembers.length === 0 ||
                  markBulkAttendance.isPending ||
                  dateLocked
                }
                onClick={() =>
                  handleBulkMarkApi(
                    "LATE",
                    filteredMembers.map((m) => m.id)
                  )
                }
                className="gap-2 text-yellow-800 border-yellow-300 hover:bg-yellow-50"
              >
                Mark all late
              </Button>
              <Button
                variant="outline"
                disabled={
                  !effectiveClassId ||
                  filteredMembers.length === 0 ||
                  markBulkAttendance.isPending ||
                  dateLocked
                }
                onClick={() =>
                  handleBulkMarkApi(
                    "HALF_DAY",
                    filteredMembers.map((m) => m.id)
                  )
                }
                className="gap-2 text-amber-900 border-amber-300 hover:bg-amber-50"
              >
                Mark all half day
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!effectiveClassId || filteredMembers.length === 0}
                onClick={() => exportStaffAttendance("csv")}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Excel (CSV)
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!effectiveClassId || filteredMembers.length === 0}
                onClick={() => exportStaffAttendance("pdf")}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
              <Button
                onClick={() => void handleSavePending()}
                disabled={
                  changedCount === 0 || markBulkAttendance.isPending || dateLocked
                }
                className="bg-[#4b830d] hover:bg-[#3a6a0a] text-white gap-2"
              >
                {markBulkAttendance.isPending ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {changedCount === 0 ? "No changes to save" : "Submit attendance"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <StaffAttendanceTable
              key={`${effectiveClassId}-${selectedDate}-${roleFilter}`}
              members={filteredMembers}
              getStatus={getStatus}
              onSetStatus={setRowStatus}
              onBulkMarkSelected={handleBulkMarkApi}
              disabled={markBulkAttendance.isPending || dateLocked}
            />

            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                {changedCount > 0
                  ? `${changedCount} unsaved change(s)`
                  : "No unsaved changes"}
              </p>
              <Button
                onClick={() => void handleSavePending()}
                disabled={
                  changedCount === 0 || markBulkAttendance.isPending || dateLocked
                }
                className="bg-[#4b830d] hover:bg-[#3a6a0a] text-white gap-2"
              >
                {markBulkAttendance.isPending ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {changedCount === 0 ? "No changes to save" : "Save pending changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
