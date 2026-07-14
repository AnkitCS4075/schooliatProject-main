"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Edit, Trash2, Key, SlidersHorizontal, UserCheck, UserX } from "lucide-react";
import { useClassFilters } from "@/lib/hooks/use-class-filters";
import {
  searchTeachersByName,
  sortUsersByClassThenName,
  getTeacherClassDisplayLabel,
} from "@/lib/utils/search-utils";
import { useToggleTeacherAccountActive } from "@/lib/hooks/use-teachers";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PasswordResetModal } from "../students/password-reset-modal";
import { cn } from "@/lib/utils";

const TEACHER_COLUMNS = [
  { key: "teacher", title: "Teachers", width: "w-48" },
  { key: "employeeId", title: "Employee ID", width: "w-32" },
  { key: "class", title: "Class", width: "w-28" },
  { key: "subject", title: "Subject", width: "w-40" },
  { key: "attendance", title: "Attendance", width: "w-28" },
  { key: "transport", title: "Transport", width: "w-28" },
  { key: "salary", title: "Salary", width: "w-24" },
  { key: "contact", title: "Contact", width: "w-40" },
  { key: "action", title: "Action", width: "w-32" },
];

const SUBJECT_OPTIONS = [
  "All Subjects",
  "English",
  "Science",
  "Math",
  "History",
];

interface TeachersTableProps {
  teachers: any[];
  onEdit: (teacher: any) => void;
  onDelete: (teacherId: string) => void;
  onBulkDelete: (ids: string[]) => void;
  page: number;
  onPageChange: (page: number) => void;
  serverTotalPages: number;
  loading: boolean;
  onRefresh: () => void;
}

// Format phone number for display
const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return "N/A";
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  // Format as Indian phone number: XXXXX XXXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

// Get initials for avatar fallback
const getInitials = (firstName: string, lastName?: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return `${first}${last}` || "T";
};

export function TeachersTable({
  teachers,
  onEdit,
  onDelete,
  onBulkDelete,
  page,
  onPageChange,
  serverTotalPages,
  loading,
}: TeachersTableProps) {
  const { classFilter, divisionFilter } = useClassFilters();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState(classFilter.defaultValue);
  const [selectedDivision, setSelectedDivision] = useState(divisionFilter.defaultValue);
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [passwordResetVisible, setPasswordResetVisible] = useState(false);
  const [resetTeacher, setResetTeacher] = useState<any>(null);
  const [accountDialog, setAccountDialog] = useState<{
    id: string;
    name: string;
    nextActive: boolean;
  } | null>(null);

  const toggleTeacherActive = useToggleTeacherAccountActive();

  const filteredTeachers = useMemo(() => {
    let list = teachers;

    if (searchQuery.trim()) {
      list = searchTeachersByName(list, searchQuery);
    }

    if (selectedClass !== classFilter.defaultValue) {
      list = list.filter((teacher) => {
        const teacherClass = teacher.class || "";
        if (!teacherClass) return false;
        const classStr = teacherClass.toLowerCase();
        const selectedClassStr = selectedClass.toLowerCase();
        return (
          classStr.includes(selectedClassStr) ||
          classStr.includes(selectedClassStr.split("-")[0] || "")
        );
      });
    }

    if (selectedDivision !== divisionFilter.defaultValue) {
      list = list.filter((teacher) => {
        const teacherClass = teacher.class || "";
        if (!teacherClass) return false;
        return teacherClass.toLowerCase().includes(selectedDivision.toLowerCase());
      });
    }

    if (selectedSubject !== "All Subjects") {
      list = list.filter((teacher) =>
        (teacher.subjects ?? teacher.teacherProfile?.subjects ?? "")
          .toLowerCase()
          .includes(selectedSubject.toLowerCase()),
      );
    }

    return sortUsersByClassThenName(list, getTeacherClassDisplayLabel);
  }, [
    teachers,
    searchQuery,
    selectedClass,
    selectedDivision,
    selectedSubject,
    classFilter,
    divisionFilter,
  ]);

  const handlePasswordReset = (teacher: any) => {
    setResetTeacher(teacher);
    setPasswordResetVisible(true);
  };

  const handlePasswordResetClose = () => {
    setResetTeacher(null);
    setPasswordResetVisible(false);
  };

  const handleAllClasses = () => {
    setSelectedClass(classFilter.defaultValue);
    setSelectedDivision(divisionFilter.defaultValue);
  };

  const toggleRowSelection = (teacherId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(teacherId)) {
      newSelected.delete(teacherId);
    } else {
      newSelected.add(teacherId);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredTeachers.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredTeachers.map((t) => t.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.size > 0) {
      onBulkDelete(Array.from(selectedRows));
      setSelectedRows(new Set());
    }
  };

  const allSelected = filteredTeachers.length > 0 && selectedRows.size === filteredTeachers.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < filteredTeachers.length;

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-gray-500" />
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {classFilter.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDivision} onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              {divisionFilter.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_OPTIONS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAllClasses}
            className="whitespace-nowrap"
          >
            All Classes
          </Button>
        </div>
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            {selectedRows.size} teacher(s) selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={loading}
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                {TEACHER_COLUMNS.map((column) => (
                  <TableHead key={column.key} className={cn(column.width, "font-semibold")}>
                    {column.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={TEACHER_COLUMNS.length + 1} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={TEACHER_COLUMNS.length + 1} className="text-center py-8">
                    No teachers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher) => {
                  const isSelected = selectedRows.has(teacher.id);
                  const registrationPhotoUrl = teacher.registrationPhotoUrl || null;
                  const attendancePercentage = teacher.attendance?.percentage;
                  const attendanceDisplay = attendancePercentage !== null && attendancePercentage !== undefined
                    ? `${attendancePercentage}%`
                    : "N/A";
                  
                  return (
                    <TableRow
                      key={teacher.id}
                      className={cn(
                        isSelected && "bg-blue-50",
                        "hover:bg-gray-50",
                        teacher.isAccountActive === false && "opacity-70",
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRowSelection(teacher.id)}
                          aria-label={`Select ${teacher.firstName} ${teacher.lastName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/teachers/${teacher.id}`}
                          className="flex items-center gap-3 font-medium text-foreground hover:text-primary hover:underline"
                        >
                          <Avatar size="sm">
                            {registrationPhotoUrl ? (
                              <AvatarImage src={registrationPhotoUrl} alt={`${teacher.firstName} ${teacher.lastName}`} />
                            ) : null}
                            <AvatarFallback className="bg-schooliat-tint text-primary">
                              {getInitials(teacher.firstName, teacher.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex flex-wrap items-center gap-2">
                            {teacher.firstName} {teacher.lastName}
                            {teacher.isAccountActive === false ? (
                              <Badge variant="secondary" className="text-xs">
                                Inactive
                              </Badge>
                            ) : null}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>{teacher.publicUserId || "N/A"}</TableCell>
                      <TableCell>
                        {teacher.class ||
                          (teacher.assignedClasses?.length
                            ? teacher.assignedClasses.join(", ")
                            : "N/A")}
                      </TableCell>
                      <TableCell>
                        {teacher.subjects ?? teacher.teacherProfile?.subjects ?? "N/A"}
                      </TableCell>
                      <TableCell>{attendanceDisplay}</TableCell>
                      <TableCell>{teacher.transport || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            teacher.salary === "DUE"
                              ? "destructive"
                              : "default"
                          }
                          className={
                            teacher.salary === "PAID"
                              ? "bg-primary hover:bg-schooliat-primary-dark"
                              : ""
                          }
                        >
                          {teacher.salary || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatPhoneNumber(teacher.contact)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/admin/teachers/${teacher.id}`} aria-label="View teacher profile">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(teacher)}
                            className="h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(teacher.id)}
                            disabled={loading}
                            className="h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={
                              teacher.isAccountActive === false
                                ? "Reactivate login"
                                : "Deactivate login"
                            }
                            onClick={() =>
                              setAccountDialog({
                                id: teacher.id,
                                name: `${teacher.firstName} ${teacher.lastName ?? ""}`.trim(),
                                nextActive: teacher.isAccountActive === false,
                              })
                            }
                            className="h-8 w-8"
                          >
                            {teacher.isAccountActive === false ? (
                              <UserCheck className="w-4 h-4 text-primary" />
                            ) : (
                              <UserX className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePasswordReset(teacher)}
                            className="h-8 w-8"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {serverTotalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page + 1} of {serverTotalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(serverTotalPages - 1, page + 1))}
              disabled={page >= serverTotalPages - 1 || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <PasswordResetModal
        visible={passwordResetVisible}
        onClose={handlePasswordResetClose}
        userId={resetTeacher?.id}
        userName={`${resetTeacher?.firstName || ""} ${resetTeacher?.lastName || ""}`}
        onSuccess={() => {
          // Toast will be handled by the modal
        }}
      />

      <ConfirmActionDialog
        open={!!accountDialog}
        onOpenChange={(open) => !open && setAccountDialog(null)}
        title={accountDialog?.nextActive ? "Reactivate account?" : "Deactivate account?"}
        description={
          accountDialog?.nextActive
            ? `Allow ${accountDialog.name} to sign in to the app and dashboard again?`
            : `${accountDialog?.name ?? "This user"} will not be able to sign in until you reactivate their account.`
        }
        confirmLabel={accountDialog?.nextActive ? "Reactivate" : "Deactivate"}
        variant={accountDialog?.nextActive ? "default" : "destructive"}
        isLoading={toggleTeacherActive.isPending}
        onConfirm={async () => {
          if (!accountDialog) return;
          try {
            await toggleTeacherActive.mutateAsync({
              id: accountDialog.id,
              active: accountDialog.nextActive,
            });
            toast.success(
              accountDialog.nextActive ? "Account reactivated." : "Account deactivated.",
            );
            setAccountDialog(null);
          } catch (e: any) {
            toast.error(e?.message || "Could not update account status.");
          }
        }}
      />
    </div>
  );
}
