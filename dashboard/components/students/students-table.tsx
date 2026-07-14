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
import { Eye, Edit, Trash2, Key, Plus, UserCheck, UserX } from "lucide-react";
import { useClassFilters } from "@/lib/hooks/use-class-filters";
import {
  searchStudentsByName,
  sortUsersByClassThenName,
  getStudentClassDisplayLabel,
} from "@/lib/utils/search-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentDetailModal } from "./student-detail-modal";
import { PasswordResetModal } from "./password-reset-modal";
import { useBulkAssignClass, useToggleStudentAccountActive } from "@/lib/hooks/use-students";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { useAllClasses } from "@/lib/hooks/use-classes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STUDENT_COLUMNS = [
  { key: "student", title: "Student", width: "w-48" },
  { key: "rollNo", title: "Roll No", width: "w-32" },
  { key: "class", title: "Class", width: "w-28" },
  { key: "fatherName", title: "Father Name", width: "w-40" },
  { key: "attendance", title: "Attendance", width: "w-28" },
  { key: "transport", title: "Transport", width: "w-28" },
  { key: "fees", title: "Fees", width: "w-24" },
  { key: "contact", title: "Contact", width: "w-40" },
  { key: "action", title: "Action", width: "w-32" },
];

interface StudentsTableProps {
  students: any[];
  onAddNew: () => void;
  onEdit: (student: any) => void;
  onDelete: (studentId: string) => void;
  onBulkDelete: (ids: string[]) => void;
  /** 0-based index of the current server page (matches paginator state). */
  page: number;
  /** Rows per page from the server (used to compute global S.No. across pages). */
  pageSize: number;
  onPageChange: (page: number) => void;
  serverTotalPages: number;
  loading: boolean;
  onRefresh: () => void;
  /** Active server-side class filter (GET /users/students?classId=). */
  serverClassId?: string;
  onServerClassFilterChange?: (classId: string | undefined) => void;
}

function resolveSchoolClassId(
  schoolClasses: { id: string; grade: string; division?: string | null }[],
  selectedLabel: string,
  allLabel: string,
): string | undefined {
  if (!selectedLabel || selectedLabel === allLabel) return undefined;
  const found = schoolClasses.find((cls) => {
    const label = cls.division ? `${cls.grade}-${cls.division}` : cls.grade;
    return label === selectedLabel;
  });
  return found?.id;
}

export function StudentsTable({
  students,
  onAddNew,
  onEdit,
  onDelete,
  onBulkDelete,
  page,
  pageSize,
  onPageChange,
  serverTotalPages,
  loading,
  serverClassId,
  onServerClassFilterChange,
}: StudentsTableProps) {
  const { classFilter, divisionFilter, classes: schoolClasses } = useClassFilters();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState(classFilter.defaultValue);
  const [selectedDivision, setSelectedDivision] = useState(divisionFilter.defaultValue);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [passwordResetVisible, setPasswordResetVisible] = useState(false);
  const [resetStudent, setResetStudent] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [accountDialog, setAccountDialog] = useState<{
    id: string;
    name: string;
    nextActive: boolean;
  } | null>(null);
  const bulkAssign = useBulkAssignClass();
  const toggleStudentActive = useToggleStudentAccountActive();
  const { data: classesData } = useAllClasses();
  const classesList = classesData?.data || [];

  const filteredStudents = useMemo(() => {
    let list = students;

    if (searchQuery.trim()) {
      list = searchStudentsByName(list, searchQuery);
    }

    const classFilteredOnServer = Boolean(serverClassId);
    if (!classFilteredOnServer && selectedClass !== classFilter.defaultValue) {
      list = classFilter.onFilter(list, selectedClass);
    }

    if (!serverClassId && selectedDivision !== divisionFilter.defaultValue) {
      list = divisionFilter.onFilter(list, selectedDivision);
    }

    const touchedClientFilters =
      Boolean(searchQuery.trim()) ||
      (!classFilteredOnServer && selectedClass !== classFilter.defaultValue) ||
      (!serverClassId && selectedDivision !== divisionFilter.defaultValue);

    if (touchedClientFilters) {
      return sortUsersByClassThenName(list, getStudentClassDisplayLabel);
    }

    return list;
  }, [
    students,
    searchQuery,
    selectedClass,
    selectedDivision,
    classFilter,
    divisionFilter,
    serverClassId,
  ]);

  const handleViewDetails = (student: any) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  const handlePasswordReset = (student: any) => {
    setResetStudent(student);
    setPasswordResetVisible(true);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredStudents.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const isAllSelected = filteredStudents.length > 0 && selectedRows.size === filteredStudents.length;

  return (
    <div className="space-y-4">
      {/* Toolbar: list title lives on parent page; primary action here for quick access */}
      <div className="flex items-center justify-end">
        <Button onClick={onAddNew} className="gap-2 font-semibold" title="New admission">
          <Plus className="h-5 w-5" aria-hidden />
          <span>New admission</span>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-4 space-y-4 border">
        <div className="flex items-center gap-4 flex-wrap">
          <Select
            value={selectedClass}
            onValueChange={(v) => {
              setSelectedClass(v);
              const id = resolveSchoolClassId(schoolClasses, v, classFilter.defaultValue);
              onServerClassFilterChange?.(id);
              if (id) setSelectedDivision(divisionFilter.defaultValue);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Class" />
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
              <SelectValue placeholder="Select Division" />
            </SelectTrigger>
            <SelectContent>
              {divisionFilter.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1 min-w-[200px] max-w-[280px]">
            <Input
              placeholder="Search by Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {selectedRows.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedRows.size} selected</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAssignDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Assign to Class
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onBulkDelete(Array.from(selectedRows))}
            >
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                {STUDENT_COLUMNS.map((column) => (
                  <TableHead key={column.key} className={column.width}>
                    {column.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={STUDENT_COLUMNS.length + 1} className="text-center py-8">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={STUDENT_COLUMNS.length + 1} className="text-center py-8">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  return (
                  <TableRow
                    key={student.id}
                    className={cn(
                      selectedRows.has(student.id) && "bg-blue-50",
                      student.isAccountActive === false && "opacity-70",
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(student.id)}
                        onCheckedChange={() => toggleRowSelection(student.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="text-primary hover:underline inline-flex flex-wrap items-center gap-2"
                      >
                        {student.firstName} {student.lastName}
                        {student.isAccountActive === false ? (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        ) : null}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {student.studentProfile?.rollNumber || "N/A"}
                    </TableCell>
                    <TableCell>
                      {getStudentClassDisplayLabel(student) || "N/A"}
                    </TableCell>
                    <TableCell>
                      {student.studentProfile?.fatherName || "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      {student.attendance?.percentage != null
                        ? `${student.attendance.percentage}%`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{student.transport || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.fees === "DUE" ? "destructive" : "default"
                        }
                        className={
                          student.fees === "PAID"
                            ? "bg-primary hover:bg-schooliat-primary-dark"
                            : ""
                        }
                      >
                        {student.fees || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.contact || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(student)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(student)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(student.id)}
                          disabled={loading}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={
                            student.isAccountActive === false
                              ? "Reactivate login"
                              : "Deactivate login"
                          }
                          onClick={() =>
                            setAccountDialog({
                              id: student.id,
                              name: `${student.firstName} ${student.lastName ?? ""}`.trim(),
                              nextActive: student.isAccountActive === false,
                            })
                          }
                          className="h-8 w-8"
                        >
                          {student.isAccountActive === false ? (
                            <UserCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <UserX className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePasswordReset(student)}
                          className="h-8 w-8"
                        >
                          <Key className="h-4 w-4" />
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

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {serverTotalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page + 1 >= (serverTotalPages || 1) || loading}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      <StudentDetailModal
        visible={modalVisible && !!selectedStudent}
        onClose={() => {
          setModalVisible(false);
          setTimeout(() => setSelectedStudent(null), 300);
        }}
        student={selectedStudent}
      />

      <PasswordResetModal
        visible={passwordResetVisible}
        onClose={() => {
          setPasswordResetVisible(false);
          setResetStudent(null);
        }}
        userId={resetStudent?.id}
        userName={`${resetStudent?.firstName || ""} ${resetStudent?.lastName || ""}`}
      />

      <AssignClassDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        selectedIds={Array.from(selectedRows)}
        classes={classesList}
        onSuccess={() => {
          setSelectedRows(new Set());
          setIsAssignDialogOpen(false);
        }}
        bulkAssignMutation={bulkAssign}
      />

      <ConfirmActionDialog
        open={!!accountDialog}
        onOpenChange={(open) => !open && setAccountDialog(null)}
        title={accountDialog?.nextActive ? "Reactivate account?" : "Deactivate account?"}
        description={
          accountDialog?.nextActive
            ? `Allow ${accountDialog.name} to sign in to the app again?`
            : `${accountDialog?.name ?? "This student"} will not be able to sign in until you reactivate their account.`
        }
        confirmLabel={accountDialog?.nextActive ? "Reactivate" : "Deactivate"}
        variant={accountDialog?.nextActive ? "default" : "destructive"}
        isLoading={toggleStudentActive.isPending}
        onConfirm={async () => {
          if (!accountDialog) return;
          try {
            await toggleStudentActive.mutateAsync({
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

interface AssignClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  classes: any[];
  onSuccess: () => void;
  bulkAssignMutation: any;
}

function AssignClassDialog({
  isOpen,
  onClose,
  selectedIds,
  classes,
  onSuccess,
  bulkAssignMutation,
}: AssignClassDialogProps) {
  const [selectedClassId, setSelectedClassId] = useState("");

  const handleAssign = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class");
      return;
    }

    try {
      await bulkAssignMutation.mutateAsync({
        studentIds: selectedIds,
        classId: selectedClassId,
      });
      toast.success("Students assigned successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || "Failed to assign students");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Students to Class</DialogTitle>
          <DialogDescription>
            Assign {selectedIds.length} selected students to a new class.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Target Class</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={bulkAssignMutation.isLoading}>
            {bulkAssignMutation.isLoading ? "Assigning..." : "Assign to Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

