"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { get } from "@/lib/api/client";

interface ResultViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classId: string | null;
    className: string;
    divisionName: string;
    examId: string;
    examName: string;
}

interface StudentResult {
    name: string;
    rollNumber: string;
    subjects: Record<string, { obtained: number; max: number }>;
    total: number;
    maxTotal: number;
    percentage: number;
}

export function ResultViewModal({
    open,
    onOpenChange,
    classId,
    className,
    divisionName,
    examId,
    examName,
}: ResultViewModalProps) {
    const [loading, setLoading] = useState(false);
    const [marks, setMarks] = useState<any[]>([]);

    useEffect(() => {
        if (open && classId && examId) {
            setLoading(true);
            get("/marks", { examId, classId })
                .then((res) => setMarks(res?.data || []))
                .catch(() => setMarks([]))
                .finally(() => setLoading(false));
        }
    }, [open, classId, examId]);

    const { subjects, students } = useMemo(() => {
        const subjectsSet = new Set<string>();
        const studentMap: Record<string, StudentResult> = {};

        marks.forEach((m: any) => {
            const subjectName = m.subject?.name || m.subjectId || "Unknown";
            subjectsSet.add(subjectName);

            const studentId = m.studentId;
            if (!studentMap[studentId]) {
                studentMap[studentId] = {
                    name: `${m.student?.firstName || ""} ${m.student?.lastName || ""}`.trim() || "Unknown",
                    rollNumber: String(m.student?.studentProfile?.rollNumber || "-"),
                    subjects: {},
                    total: 0,
                    maxTotal: 0,
                    percentage: 0,
                };
            }
            studentMap[studentId].subjects[subjectName] = {
                obtained: m.marksObtained,
                max: m.maxMarks,
            };
        });

        const subjects = Array.from(subjectsSet).sort();
        const students = Object.values(studentMap)
            .map((s) => {
                const total = subjects.reduce((sum, sub) => sum + (s.subjects[sub]?.obtained || 0), 0);
                const maxTotal = subjects.reduce((sum, sub) => sum + (s.subjects[sub]?.max || 0), 0);
                const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                return { ...s, total, maxTotal, percentage };
            })
            .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));

        return { subjects, students };
    }, [marks]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Results — Class {className}{divisionName !== "-" ? ` (${divisionName})` : ""} — {examName}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p className="font-medium">No marks found</p>
                        <p className="text-sm mt-1">Enter marks first, then view results here.</p>
                    </div>
                ) : (
                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-schooliat-tint">
                                    <TableHead className="w-16">Roll</TableHead>
                                    <TableHead>Student</TableHead>
                                    {subjects.map((s) => (
                                        <TableHead key={s} className="text-center w-20">{s}</TableHead>
                                    ))}
                                    <TableHead className="text-center w-20">Total</TableHead>
                                    <TableHead className="text-center w-20">%</TableHead>
                                    <TableHead className="text-center w-24">Result</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student, idx) => (
                                    <TableRow key={idx} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{student.rollNumber}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        {subjects.map((sub) => {
                                            const mark = student.subjects[sub];
                                            const failed = mark && mark.max > 0 && (mark.obtained / mark.max) < 0.33;
                                            return (
                                                <TableCell key={sub} className={`text-center ${failed ? "text-red-600 font-medium" : ""}`}>
                                                    {mark ? `${mark.obtained}/${mark.max}` : "-"}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell className="text-center font-semibold">
                                            {student.total}/{student.maxTotal}
                                        </TableCell>
                                        <TableCell className="text-center font-semibold">
                                            {student.percentage.toFixed(1)}%
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    student.percentage >= 60
                                                        ? "bg-schooliat-tint text-primary border-primary/30"
                                                        : student.percentage >= 33
                                                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                                            : "bg-red-100 text-red-800 border-red-300"
                                                }
                                            >
                                                {student.percentage >= 33 ? "Pass" : "Fail"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
