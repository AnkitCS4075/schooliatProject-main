"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Clock, User, Minus } from "lucide-react";
export type MarkableAttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber?: string;
  classGrade?: string;
  classDivision?: string;
  attendance?: {
    status: MarkableAttendanceStatus;
    lateArrivalTime?: string;
    absenceReason?: string;
  };
}

interface AttendanceMarkingTableProps {
  students: Student[];
  date: string;
  classId: string;
  onMarkAttendance: (data: {
    studentId: string;
    status: MarkableAttendanceStatus;
    lateArrivalTime?: string;
    absenceReason?: string;
  }) => void;
  /** Mark every student in the class for the selected date/period */
  onBulkMark: (status: MarkableAttendanceStatus) => void;
  /** Mark only the given student IDs (selection toolbar) */
  onBulkMarkSelected: (status: MarkableAttendanceStatus, studentIds: string[]) => void;
  /** When true, marks cannot be submitted (48h policy) */
  isDateLocked?: boolean;
  isLoading?: boolean;
}

function normalizeAttendanceRow(
  r:
    | {
        status: MarkableAttendanceStatus;
        lateArrivalTime?: string;
        absenceReason?: string;
      }
    | undefined
) {
  if (!r) return null;
  return {
    status: r.status,
    late: (r.lateArrivalTime || "").trim(),
    absence: (r.absenceReason || "").trim(),
  };
}

function rowNeedsSave(
  local: { status: MarkableAttendanceStatus; lateArrivalTime?: string; absenceReason?: string },
  server: Student["attendance"]
) {
  const a = normalizeAttendanceRow(local);
  const b = normalizeAttendanceRow(server);
  if (!server) return true;
  if (!a || !b) return true;
  return a.status !== b.status || a.late !== b.late || a.absence !== b.absence;
}

export function AttendanceMarkingTable({
  students,
  date,
  classId,
  onMarkAttendance,
  onBulkMark,
  onBulkMarkSelected,
  isDateLocked = false,
  isLoading = false,
}: AttendanceMarkingTableProps) {
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      // 1. Sort by Grade
      const gradeA = String(a.classGrade || "").toLowerCase();
      const gradeB = String(b.classGrade || "").toLowerCase();
      if (gradeA !== gradeB) return gradeA.localeCompare(gradeB);

      // 2. Sort by Division
      const divA = String(a.classDivision || "").toLowerCase();
      const divB = String(b.classDivision || "").toLowerCase();
      if (divA !== divB) return divA.localeCompare(divB);

      // 3. Sort by Roll Number
      const rollA = parseInt(a.rollNumber || "99999", 10);
      const rollB = parseInt(b.rollNumber || "99999", 10);
      return rollA - rollB;
    });
  }, [students]);
  const studentsSyncKey = useMemo(
    () =>
      students
        .map(
          (s) =>
            `${s.id}:${s.attendance?.status ?? ""}:${s.attendance?.lateArrivalTime ?? ""}:${s.attendance?.absenceReason ?? ""}`
        )
        .join("|"),
    [students]
  );

  const [attendanceData, setAttendanceData] = useState<Record<string, {
    status: MarkableAttendanceStatus;
    lateArrivalTime?: string;
    absenceReason?: string;
  }>>({});

  useEffect(() => {
    setAttendanceData(() => {
      const next: Record<string, {
        status: MarkableAttendanceStatus;
        lateArrivalTime?: string;
        absenceReason?: string;
      }> = {};
      students.forEach((student) => {
        next[student.id] = student.attendance
          ? {
              status: student.attendance.status,
              lateArrivalTime: student.attendance.lateArrivalTime || undefined,
              absenceReason: student.attendance.absenceReason || undefined,
            }
          : { status: "PRESENT" };
      });
      return next;
    });
  }, [studentsSyncKey, students]);

  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  const handleStatusChange = (studentId: string, status: MarkableAttendanceStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        lateArrivalTime: status === "LATE" ? prev[studentId]?.lateArrivalTime : undefined,
        absenceReason: status === "ABSENT" ? prev[studentId]?.absenceReason : undefined,
      },
    }));
  };

  const handleLateTimeChange = (studentId: string, time: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        lateArrivalTime: time,
      },
    }));
  };

  const handleAbsenceReasonChange = (studentId: string, reason: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        absenceReason: reason,
      },
    }));
  };

  const handleSave = (studentId: string) => {
    if (isDateLocked) return;
    const data = attendanceData[studentId];
    if (data) {
      onMarkAttendance({
        studentId,
        ...data,
      });
    }
  };

  const handleBulkMarkSelection = (status: MarkableAttendanceStatus) => {
    if (isDateLocked) return;
    const ids = Array.from(selectedStudents);
    setAttendanceData((prev) => {
      const next = { ...prev };
      ids.forEach((studentId) => {
        next[studentId] = {
          ...next[studentId],
          status,
          lateArrivalTime:
            status === "LATE" ? next[studentId]?.lateArrivalTime : undefined,
          absenceReason:
            status === "ABSENT" ? next[studentId]?.absenceReason : undefined,
        };
      });
      return next;
    });
    onBulkMarkSelected(status, ids);
  };

  const handleBulkMarkEntireClass = (status: MarkableAttendanceStatus) => {
    if (isDateLocked) return;
    onBulkMark(status);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map((s) => s.id)));
    }
  };

  const disableActions = isLoading || isDateLocked;

  return (
    <div className="space-y-4">
      {/* Whole class — always visible */}
      {sortedStudents.length > 0 && (
        <div className="bg-schooliat-tint/50 rounded-lg p-4 border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-700 font-medium">Class-wide actions</div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkMarkEntireClass("PRESENT")}
              disabled={disableActions}
              className="border-green-300 text-green-800 hover:bg-green-50"
            >
              Mark all present
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkMarkEntireClass("ABSENT")}
              disabled={disableActions}
              className="border-red-300 text-red-800 hover:bg-red-50"
            >
              Mark all absent
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkMarkEntireClass("LATE")}
              disabled={disableActions}
            >
              Mark all late
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkMarkEntireClass("HALF_DAY")}
              disabled={disableActions}
            >
              Mark all half day
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedStudents.size > 0 && (
        <div className="bg-white rounded-lg p-4 border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedStudents.size} selected</Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkMarkSelection("PRESENT")}
              disabled={disableActions}
            >
              Mark selected present
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkMarkSelection("ABSENT")}
              disabled={disableActions}
            >
              Mark selected absent
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkMarkSelection("LATE")}
              disabled={disableActions}
            >
              Mark selected late
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkMarkSelection("HALF_DAY")}
              disabled={disableActions}
            >
              Mark selected half day
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
                <TableRow className="bg-schooliat-tint">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedStudents.size === students.length && students.length > 0}
                    onCheckedChange={toggleSelectAll}
                    disabled={disableActions}
                  />
                </TableHead>
                <TableHead className="w-16">No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead className="w-24">Roll No</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-40">Late Time</TableHead>
                <TableHead>Absence Reason</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                sortedStudents.map((student, index) => {
                  const attendance = attendanceData[student.id] || { status: "PRESENT" as const };
                  const persisted = !!student.attendance;
                  const saved = persisted && !rowNeedsSave(attendance, student.attendance);
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStudents.has(student.id)}
                          onCheckedChange={() => toggleStudentSelection(student.id)}
                          disabled={disableActions}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {String(index + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <User className="h-4 w-4 text-gray-400 shrink-0" />
                            <span>
                              {student.firstName} {student.lastName}
                            </span>
                            {persisted && saved ? (
                              <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                Already marked
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.rollNumber || "N/A"}</TableCell>
                      <TableCell>
                        <Select
                          value={attendance.status}
                          onValueChange={(value: MarkableAttendanceStatus) =>
                            handleStatusChange(student.id, value)
                          }
                          disabled={disableActions}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRESENT">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                Present
                              </div>
                            </SelectItem>
                            <SelectItem value="ABSENT">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                Absent
                              </div>
                            </SelectItem>
                            <SelectItem value="LATE">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                Late
                              </div>
                            </SelectItem>
                            <SelectItem value="HALF_DAY">
                              <div className="flex items-center gap-2">
                                <Minus className="h-4 w-4 text-amber-700" />
                                Half day
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {attendance.status === "LATE" ? (
                          <Input
                            type="time"
                            value={attendance.lateArrivalTime || ""}
                            onChange={(e) => handleLateTimeChange(student.id, e.target.value)}
                            className="w-full"
                            disabled={disableActions}
                          />
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {attendance.status === "ABSENT" ? (
                          <Input
                            placeholder="Reason for absence"
                            value={attendance.absenceReason || ""}
                            onChange={(e) => handleAbsenceReasonChange(student.id, e.target.value)}
                            className="w-full"
                            disabled={disableActions}
                          />
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSave(student.id)}
                          disabled={isLoading || disableActions || saved}
                          variant={saved ? "outline" : "default"}
                          className={
                            saved
                              ? "border-green-600 text-green-800 bg-green-50 hover:bg-green-50"
                              : "bg-[#4CAF50] hover:bg-[#45a049]"
                          }
                        >
                          {isDateLocked
                            ? persisted
                              ? "Saved"
                              : "Locked"
                            : saved
                              ? "Saved"
                              : "Save"}
                        </Button>
                      </TableCell>
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

