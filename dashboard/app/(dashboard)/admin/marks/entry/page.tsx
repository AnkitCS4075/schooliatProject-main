"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useExams, useMarks, useEnterBulkMarks } from "@/lib/hooks/use-marks";
import { useAllClasses } from "@/lib/hooks/use-classes";
import { useSubjects } from "@/lib/hooks/use-subjects";
import { useStudentsPage } from "@/lib/hooks/use-students";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, ClipboardList } from "lucide-react";

const STUDENTS_PAGE_SIZE = 500;

export default function MarksEntryPage() {
  const [examId, setExamId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [defaultMaxMarks, setDefaultMaxMarks] = useState<number>(100);
  const [grid, setGrid] = useState<Record<string, Record<string, { obtained: string; max: number }>>>({});

  const { data: examsRes } = useExams({ pageNumber: 1, pageSize: 100 });
  const { data: classesRes } = useAllClasses();
  const { data: studentsRes } = useStudentsPage(1, STUDENTS_PAGE_SIZE);
  const { data: subjectsRes } = useSubjects({
    classId: classId || undefined,
    limit: 100,
  });
  const { data: marksRes, isLoading: marksLoading } = useMarks(
    examId && classId ? { examId, classId } : {}
  );
  const enterBulk = useEnterBulkMarks();

  const exams = examsRes?.data ?? [];
  const classesList = classesRes?.data ?? [];
  const studentsList = studentsRes?.data ?? [];
  const subjectsList = subjectsRes?.data ?? [];
  const existingMarks = marksRes?.data ?? [];

  const studentsInClass = useMemo(() => {
    if (!classId) return [];
    return studentsList
      .filter((s: any) => s.studentProfile?.classId === classId)
      .sort((a: any, b: any) => {
        const rA = a.studentProfile?.rollNumber ?? 0;
        const rB = b.studentProfile?.rollNumber ?? 0;
        return Number(rA) - Number(rB);
      });
  }, [classId, studentsList]);

  const gridWithExisting = useMemo(() => {
    const next: Record<string, Record<string, { obtained: string; max: number }>> = {};
    studentsInClass.forEach((s: any) => {
      next[s.id] = {};
      subjectsList.forEach((sub: any) => {
        const existing = existingMarks.find(
          (m: any) => m.studentId === s.id && m.subjectId === sub.id
        );
        const fromGrid = grid[s.id]?.[sub.id];
        const obtained =
          fromGrid?.obtained !== undefined && fromGrid.obtained !== ""
            ? fromGrid.obtained
            : existing != null
              ? String(existing.marksObtained)
              : "";
        const max = fromGrid?.max ?? existing?.maxMarks ?? defaultMaxMarks;
        next[s.id][sub.id] = { obtained, max };
      });
    });
    return next;
  }, [studentsInClass, subjectsList, existingMarks, defaultMaxMarks, grid]);

  const setCell = (studentId: string, subjectId: string, obtained: string, maxMarks: number) => {
    setGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: { obtained, max: maxMarks },
      },
    }));
  };

  const handleSave = async () => {
    if (!examId || !classId) {
      toast.error("Select exam and class");
      return;
    }
    const payload: Array<{
      examId: string;
      studentId: string;
      subjectId: string;
      classId: string;
      marksObtained: number;
      maxMarks: number;
    }> = [];
    Object.entries(gridWithExisting).forEach(([studentId, bySubject]) => {
      Object.entries(bySubject).forEach(([subjectId, { obtained, max }]) => {
        const trimmed = obtained.trim();
        if (trimmed === "") return;
        const num = parseFloat(trimmed);
        if (Number.isNaN(num) || num < 0) return;
        const maxM = max || defaultMaxMarks;
        if (num > maxM) {
          toast.error(`Marks obtained cannot exceed ${maxM} for student/subject`);
          return;
        }
        payload.push({
          examId,
          studentId,
          subjectId,
          classId,
          marksObtained: num,
          maxMarks: maxM,
        });
      });
    });
    if (payload.length === 0) {
      toast.error("Enter at least one mark");
      return;
    }
    try {
      const res = (await enterBulk.mutateAsync({ marks: payload })) as any;
      const data = res?.data ?? res ?? {};
      const created = data.created ?? 0;
      const updated = data.updated ?? 0;
      const errors = data.errors ?? [];
      if (created + updated > 0) {
        toast.success(`Saved: ${created} created, ${updated} updated`);
      }
      if (errors.length > 0) {
        toast.error(`${errors.length} mark(s) failed to save. Check student/subject assignments.`);
      }
      if (created + updated === 0 && errors.length === 0) {
        toast.info("No changes detected. Marks are already up to date.");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save marks");
    }
  };

  const canShowGrid = examId && classId && studentsInClass.length > 0 && subjectsList.length > 0;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/results">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Marks Entry</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Enter or update exam marks by class and subject
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Select exam and class
          </CardTitle>
          <CardDescription>
            Choose an exam and class to load or enter marks. Then fill the grid and save.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Exam</Label>
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam: any) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name ?? exam.type ?? exam.id} {exam.year != null ? `(${exam.year})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classesList.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.division ? `${cls.grade}-${cls.division}` : cls.grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default max marks</Label>
              <Input
                type="number"
                min={1}
                value={defaultMaxMarks}
                onChange={(e) => setDefaultMaxMarks(Number(e.target.value) || 100)}
              />
            </div>
          </div>

          {!classId && (
            <p className="text-sm text-gray-500">Select a class to load students and subjects.</p>
          )}
          {classId && studentsInClass.length === 0 && (
            <p className="text-sm text-amber-600">No students found in this class.</p>
          )}
          {classId && subjectsList.length === 0 && (
            <p className="text-sm text-amber-600">No subjects configured for this class.</p>
          )}
        </CardContent>
      </Card>

      {canShowGrid && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Marks grid</CardTitle>
              <Button onClick={handleSave} disabled={enterBulk.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {enterBulk.isPending ? "Saving..." : "Save marks"}
              </Button>
            </div>
            <CardDescription>
              Enter marks obtained per student and subject. Leave blank to skip. Max marks: {defaultMaxMarks} (change above for new cells).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {marksLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-schooliat-tint">
                      <th className="border p-2 text-left font-medium sticky left-0 bg-schooliat-tint min-w-[120px]">
                        Student
                      </th>
                      <th className="border p-2 text-left font-medium w-16">Roll</th>
                      {subjectsList.map((sub: any) => (
                        <th key={sub.id} className="border p-2 font-medium min-w-[80px]">
                          {sub.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentsInClass.map((student: any) => (
                      <tr key={student.id}>
                        <td className="border p-2 sticky left-0 bg-white font-medium">
                          {student.firstName} {student.lastName || ""}
                        </td>
                        <td className="border p-2">
                          {student.studentProfile?.rollNumber ?? "—"}
                        </td>
                        {subjectsList.map((sub: any) => {
                          const cell = gridWithExisting[student.id]?.[sub.id] ?? {
                            obtained: "",
                            max: defaultMaxMarks,
                          };
                          return (
                            <td key={sub.id} className="border p-1">
                              <Input
                                type="number"
                                min={0}
                                max={cell.max}
                                step={0.5}
                                className="h-8 w-16 text-center"
                                value={cell.obtained}
                                onChange={(e) =>
                                  setCell(student.id, sub.id, e.target.value, cell.max)
                                }
                                placeholder="—"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
