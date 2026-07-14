"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useClass,
  useClassStudents,
  type ClassStudentsSortBy,
} from "@/lib/hooks/use-classes";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Download,
  Pencil,
  Users,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth/storage";
import { BASE_URL } from "@/lib/api/config";

const STUDENT_PAGE_SIZE = 25;

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.id as string;

  const [studentPage, setStudentPage] = useState(1);
  const [sortBy, setSortBy] = useState<ClassStudentsSortBy>("rollNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchDraft, setSearchDraft] = useState("");
  const debouncedSearch = useDebouncedValue(searchDraft, 350);

  const searchApplied = useMemo(() => debouncedSearch.trim(), [debouncedSearch]);

  const { data: classRes, isLoading: classLoading, isError: classError, error: classErr } =
    useClass(classId);

  const classDetail = classRes?.data;

  const {
    data: studentsRes,
    isLoading: studentsLoading,
    isFetching: studentsFetching,
    isError: studentsError,
    error: studentsErr,
  } = useClassStudents(classId, {
    page: studentPage,
    limit: STUDENT_PAGE_SIZE,
    sortBy,
    sortOrder,
    search: searchApplied || undefined,
  });

  const students = studentsRes?.data ?? [];
  const totalPages = studentsRes?.totalPages ?? 1;
  const totalCount = studentsRes?.totalCount ?? 0;

  const resetStudentQuery = useCallback(() => {
    setStudentPage(1);
  }, []);

  const handleSortByChange = (v: string) => {
    const next = v as ClassStudentsSortBy;
    setSortBy(next);
    setSortOrder(next === "createdAt" ? "desc" : "asc");
    resetStudentQuery();
  };

  const handleSortOrderChange = (v: string) => {
    setSortOrder(v as "asc" | "desc");
    resetStudentQuery();
  };

  const orderOptions = useMemo(() => {
    if (sortBy === "rollNumber") {
      return [
        { value: "asc" as const, label: "Low to high (1, 2, 3…)" },
        { value: "desc" as const, label: "High to low (…3, 2, 1)" },
      ];
    }
    if (sortBy === "name") {
      return [
        { value: "asc" as const, label: "A to Z" },
        { value: "desc" as const, label: "Z to A" },
      ];
    }
    return [
      { value: "asc" as const, label: "Oldest first" },
      { value: "desc" as const, label: "Newest first" },
    ];
  }, [sortBy]);

  const formatRollDisplay = (roll: number | null | undefined) => {
    if (roll == null || roll === 0) return "—";
    return String(roll);
  };

  const downloadClassCsv = async () => {
    try {
      const token = await getAuthToken();
      const baseUrl = BASE_URL;
      const label = classDetail
        ? `${classDetail.grade}${classDetail.division ? "_" + classDetail.division : ""}`
        : "class";
      const response = await fetch(`${baseUrl}/schools/classes/${classId}/students/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to download file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `class_${label.replace(/\s+/g, "_")}_students.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download started");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  };

  if (classLoading && !classDetail) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (classError || !classDetail) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-4">
        <p className="text-destructive">
          {classErr instanceof Error ? classErr.message : "Class not found."}
        </p>
        <Button variant="outline" asChild>
          <Link href="/admin/classes">Back to classes</Link>
        </Button>
      </div>
    );
  }

  const teacherName = classDetail.classTeacher
    ? `${classDetail.classTeacher.firstName} ${classDetail.classTeacher.lastName ?? ""}`.trim()
    : "—";
  const classLabel = `${classDetail.grade}${classDetail.division ? ` ${classDetail.division}` : ""}`;

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/admin/classes" aria-label="Back to classes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{classLabel}</h1>
            <p className="text-sm text-muted-foreground">Class overview and student roster</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={downloadClassCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/admin/classes/update">
              <Pencil className="h-4 w-4" />
              Edit classes
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Class details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Class teacher</p>
            <p className="font-medium">{teacherName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Students enrolled</p>
            <p className="font-medium tabular-nums">{classDetail.studentCount ?? 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Default annual fee</p>
            <p className="font-medium">
              {(() => {
                const comps = classDetail.defaultFeeComponents;
                if (Array.isArray(comps) && comps.length > 0) {
                  const sum = comps.reduce(
                    (s: number, c: { amount?: number }) => s + (Number(c.amount) || 0),
                    0,
                  );
                  return (
                    <span>
                      ₹{sum.toLocaleString("en-IN")}{" "}
                      <span className="text-muted-foreground font-normal text-sm">
                        ({comps.length} line{comps.length === 1 ? "" : "s"})
                      </span>
                    </span>
                  );
                }
                return classDetail.defaultAnnualFee != null
                  ? `₹${Number(classDetail.defaultAnnualFee).toLocaleString("en-IN")}`
                  : "School default";
              })()}
            </p>
            {Array.isArray(classDetail.defaultFeeComponents) &&
            classDetail.defaultFeeComponents.length > 0 ? (
              <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc pl-4">
                {classDetail.defaultFeeComponents.map(
                  (row: { label?: string; amount?: number }, i: number) => (
                    <li key={i}>
                      {String(row.label ?? "—")}: ₹
                      {Number(row.amount ?? 0).toLocaleString("en-IN")}
                    </li>
                  ),
                )}
              </ul>
            ) : null}
          </div>
          <div>
            <p className="text-muted-foreground">Default monthly fee</p>
            <p className="font-medium">
              {classDetail.defaultMonthlyFee != null
                ? `₹${Number(classDetail.defaultMonthlyFee).toLocaleString("en-IN")}`
                : "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 space-y-0">
          <CardTitle className="text-lg">Students in this class</CardTitle>
          <p className="text-sm text-muted-foreground tabular-nums">
            {totalCount} student{totalCount !== 1 ? "s" : ""}
            {studentsFetching ? " · Updating…" : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="class-student-search">Search students</Label>
              <Input
                id="class-student-search"
                placeholder="Name, student ID, or roll number"
                value={searchDraft}
                onChange={(e) => {
                  setSearchDraft(e.target.value);
                  setStudentPage(1);
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2 w-full sm:min-w-[220px] sm:max-w-sm">
                <Label>Sort by</Label>
                <Select value={sortBy} onValueChange={handleSortByChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rollNumber">Roll number (numerical)</SelectItem>
                    <SelectItem value="name">Name (alphabetical)</SelectItem>
                    <SelectItem value="createdAt">Date added</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-full sm:min-w-[200px] sm:max-w-xs">
                <Label>Order</Label>
                <Select value={sortOrder} onValueChange={handleSortOrderChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {studentsError ? (
            <p className="text-destructive text-sm">
              {studentsErr instanceof Error ? studentsErr.message : "Failed to load students."}
            </p>
          ) : studentsLoading && students.length === 0 ? (
            <div className="space-y-2 py-8">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No students match your search in this class.
            </p>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Roll</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Student ID</TableHead>
                    <TableHead className="hidden lg:table-cell">Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="w-28 text-right">Profile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((row: any) => {
                    const name = [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || "—";
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="tabular-nums font-medium">
                          {formatRollDisplay(row.studentProfile?.rollNumber)}
                        </TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {row.publicUserId ?? "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{row.contact ?? "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm max-w-[200px] truncate">
                          {row.email ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-1" asChild>
                            <Link href={`/admin/students/${row.id}`}>
                              Open
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Page {studentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={studentPage <= 1 || studentsFetching}
                  onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={studentPage >= totalPages || studentsFetching}
                  onClick={() => setStudentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
