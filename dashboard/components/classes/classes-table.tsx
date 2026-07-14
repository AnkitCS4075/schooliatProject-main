"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Plus, Download, Loader2, FilterX, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth/storage";
import { BASE_URL } from "@/lib/api/config";
import type {
  ClassesListFilters,
  ClassesListMeta,
} from "@/lib/hooks/use-classes";
import { getClassAnnualFeeDisplay } from "@/lib/class-fee-structure";

interface ClassesTableProps {
  classes: any[];
  meta?: ClassesListMeta;
  teachers?: Array<{ id: string; firstName?: string; lastName?: string | null }>;
  filters: ClassesListFilters;
  onFiltersChange: (patch: Partial<ClassesListFilters>) => void;
  onClearFilters: () => void;
  onAddNew: () => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  serverTotalPages: number;
  loading: boolean;
}

const SORT_FIELDS: { value: NonNullable<ClassesListFilters["sortBy"]>; label: string }[] = [
  { value: "grade", label: "Grade" },
  { value: "division", label: "Division" },
  { value: "defaultAnnualFee", label: "Default annual fee" },
  { value: "defaultMonthlyFee", label: "Default monthly fee" },
  { value: "createdAt", label: "Date added" },
];

export function ClassesTable({
  classes,
  meta,
  teachers = [],
  filters,
  onFiltersChange,
  onClearFilters,
  onAddNew,
  page,
  pageSize,
  onPageChange,
  serverTotalPages,
  loading,
}: ClassesTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkExporting, setBulkExporting] = useState(false);

  const searchValue = filters.search ?? "";

  const allFilteredSelected =
    classes.length > 0 && classes.every((c) => selectedIds.has(c.id));

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAllFiltered = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        classes.forEach((c) => next.add(c.id));
      } else {
        classes.forEach((c) => next.delete(c.id));
      }
      return next;
    });
  };

  const teacherOptions = useMemo(() => {
    return [...teachers].sort((a, b) => {
      const an = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim();
      const bn = `${b.firstName ?? ""} ${b.lastName ?? ""}`.trim();
      return an.localeCompare(bn);
    });
  }, [teachers]);

  const divisionOptions = useMemo(() => {
    const raw = meta?.divisions ?? [];
    const seen = new Set<string>();
    const out: { value: string; label: string }[] = [];
    for (const d of raw) {
      const isEmpty = d === null || d === "";
      const value = isEmpty ? "__NULL__" : String(d);
      if (seen.has(value)) continue;
      seen.add(value);
      out.push({ value, label: isEmpty ? "No division" : String(d) });
    }
    return out;
  }, [meta?.divisions]);

  const downloadOne = async (classId: string, className: string) => {
    const token = await getAuthToken();
    const baseUrl = BASE_URL;
    const response = await fetch(`${baseUrl}/schools/classes/${classId}/students/export`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to download file");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `class_${className.replace(/\s+/g, "_")}_students.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownload = async (classId: string, className: string) => {
    try {
      await downloadOne(classId, className);
      toast.success("Download started");
    } catch (error: any) {
      toast.error(error?.message || "Failed to download class data");
    }
  };

  const handleBulkExport = async () => {
    const ids = classes.filter((c) => selectedIds.has(c.id)).map((c) => c.id);
    if (ids.length === 0) {
      toast.error("Select at least one class");
      return;
    }
    setBulkExporting(true);
    try {
      for (const id of ids) {
        const cls = classes.find((c) => c.id === id);
        if (!cls) continue;
        const name = `${cls.grade}${cls.division ? "_" + cls.division : ""}`;
        await downloadOne(id, name);
      }
      toast.success(`Exported ${ids.length} class list(s)`);
    } catch (error: any) {
      toast.error(error?.message || "Bulk export failed");
    } finally {
      setBulkExporting(false);
    }
  };

  const gradeSelectValue = filters.grade ?? "__all__";
  const divisionSelectValue =
    filters.division === "__NULL__" ? "__NULL__" : filters.division ?? "__all__";
  const teacherSelectValue = filters.classTeacherId ?? "__all__";
  const hasTeacherValue = filters.hasClassTeacher ?? "all";
  const sortByValue = filters.sortBy ?? "grade";
  const sortOrderValue = filters.sortOrder ?? "asc";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Classes</h1>
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Add/Update
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Filters & sort</h2>
          <Button type="button" variant="ghost" size="sm" className="gap-1 shrink-0" onClick={onClearFilters}>
            <FilterX className="h-4 w-4" />
            Clear filters
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="classes-search">Search</Label>
            <Input
              id="classes-search"
              placeholder="Grade, division, or teacher name"
              value={searchValue}
              onChange={(e) => onFiltersChange({ search: e.target.value || undefined })}
            />
            <p className="text-xs text-muted-foreground">Matches grade, division, or class teacher name (short delay).</p>
          </div>

          <div className="space-y-2">
            <Label>Grade</Label>
            <Select
              value={gradeSelectValue}
              onValueChange={(v: string) =>
                onFiltersChange({ grade: v === "__all__" ? undefined : v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All grades</SelectItem>
                {(meta?.grades ?? []).map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Division</Label>
            <Select
              value={divisionSelectValue}
              onValueChange={(v: string) => {
                if (v === "__all__") onFiltersChange({ division: undefined });
                else if (v === "__NULL__") onFiltersChange({ division: "__NULL__" });
                else onFiltersChange({ division: v });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All divisions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All divisions</SelectItem>
                {divisionOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Class teacher</Label>
            <Select
              value={teacherSelectValue}
              onValueChange={(v: string) =>
                onFiltersChange({
                  classTeacherId: v === "__all__" ? undefined : v,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any teacher" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="__all__">Any teacher</SelectItem>
                {teacherOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {[t.firstName, t.lastName].filter(Boolean).join(" ") || t.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Teacher assigned</Label>
            <Select
              value={hasTeacherValue}
              onValueChange={(v: string) =>
                onFiltersChange({
                  hasClassTeacher: v as ClassesListFilters["hasClassTeacher"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                <SelectItem value="assigned">With class teacher</SelectItem>
                <SelectItem value="unassigned">No class teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sort by</Label>
            <Select
              value={sortByValue}
              onValueChange={(v: string) => {
                const next = v as NonNullable<ClassesListFilters["sortBy"]>;
                const orderDefault = next === "createdAt" ? "desc" : "asc";
                onFiltersChange({ sortBy: next, sortOrder: orderDefault });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_FIELDS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Order</Label>
            <Select
              value={sortOrderValue}
              onValueChange={(v: string) =>
                onFiltersChange({ sortOrder: v as ClassesListFilters["sortOrder"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-end">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all-classes"
              checked={allFilteredSelected}
              onCheckedChange={(v: boolean | "indeterminate") => toggleAllFiltered(v === true)}
              disabled={classes.length === 0 || loading}
            />
            <label htmlFor="select-all-classes" className="text-sm text-muted-foreground cursor-pointer">
              Select page
            </label>
          </div>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={handleBulkExport}
            disabled={bulkExporting || selectedIds.size === 0}
          >
            {bulkExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export selected
          </Button>
        </div>
      </div>

      {loading && classes.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">Loading…</div>
      ) : classes.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          No classes match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map((cls, index) => {
            const teacher = cls.classTeacher
              ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}`
              : "—";
            const label = `${cls.grade}${cls.division ? ` ${cls.division}` : ""}`;
            const annualInfo = getClassAnnualFeeDisplay(cls);
            const annual = annualInfo.primary;
            const monthly =
              cls.defaultMonthlyFee != null ? `₹${Number(cls.defaultMonthlyFee).toLocaleString("en-IN")}` : "—";
            const rowNumber = page * pageSize + index + 1;
            return (
              <Card key={cls.id} className="overflow-hidden border-schooliat-tint/40">
                <CardHeader className="pb-2 flex flex-row items-start gap-3 space-y-0">
                  <Checkbox
                    checked={selectedIds.has(cls.id)}
                    onCheckedChange={(v: boolean | "indeterminate") => toggleOne(cls.id, v === true)}
                    className="mt-1"
                    aria-label={`Select class ${label}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-lg leading-tight">{label}</div>
                    <p className="text-sm text-muted-foreground mt-1">Teacher: {teacher}</p>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">#{String(rowNumber).padStart(2, "0")}</span>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Default annual</span>
                      <div className="font-medium">{annual}</div>
                      {annualInfo.lines && annualInfo.lines.length > 0 ? (
                        <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground list-disc pl-3">
                          {annualInfo.lines.slice(0, 4).map((line, li) => (
                            <li key={li}>{line}</li>
                          ))}
                          {annualInfo.lines.length > 4 ? (
                            <li>+{annualInfo.lines.length - 4} more</li>
                          ) : null}
                        </ul>
                      ) : null}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Default monthly</span>
                      <div className="font-medium">{monthly}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="default" size="sm" className="w-full gap-2" asChild>
                      <Link href={`/admin/classes/${cls.id}`}>
                        View class & students
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() =>
                        handleDownload(cls.id, `${cls.grade}${cls.division ? "_" + cls.division : ""}`)
                      }
                    >
                      <Download className="h-4 w-4" />
                      Student list (CSV)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
    </div>
  );
}
