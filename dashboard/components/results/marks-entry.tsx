"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { useClassFilters } from "@/lib/hooks/use-class-filters";
import { useExams, useMarks, useEnterBulkMarks } from "@/lib/hooks/use-marks";
import { useSubjects } from "@/lib/hooks/use-subjects";
import { useStudents } from "@/lib/hooks/use-students";
import { toast } from "sonner";

export function MarksEntry() {
    const { classFilter, divisionFilter, classes } = useClassFilters();
    const [classFilterValue, setClassFilterValue] = useState(classFilter.defaultValue);
    const [divisionFilterValue, setDivisionFilterValue] = useState(divisionFilter.defaultValue);
    const [examId, setExamId] = useState<string>("");
    const [subjectId, setSubjectId] = useState<string>("");
    const [maxMarks, setMaxMarks] = useState<number>(100);
    const [marksInput, setMarksInput] = useState<Record<string, number>>({});

    // Fetch exams
    const { data: examsData, isLoading: examsLoading } = useExams({ pageSize: 100 });
    const exams = examsData?.data || [];

    // Derive classId
    const selectedClassId = useMemo(() => {
        if (!classFilterValue || classFilterValue === classFilter.defaultValue) return undefined;
        const parts = classFilterValue.split("-");
        const grade = parts[0];
        let div = parts[1] || "";
        if (divisionFilterValue !== divisionFilter.defaultValue) {
            div = divisionFilterValue;
        }
        const matched = classes.find(c => c.grade === grade && (!div || c.division === div));
        return matched?.id;
    }, [classFilterValue, divisionFilterValue, classes, classFilter.defaultValue, divisionFilter.defaultValue]);

    // Fetch subjects for selected class
    const { data: subjectsData } = useSubjects({
        classId: selectedClassId,
        limit: 100,
    });
    const subjects = subjectsData?.data || [];

    // Fetch students for selected class
    const { data: studentsData, isLoading: studentsLoading } = useStudents({
        page: 1,
        limit: 200,
    });

    // Filter students by selected class
    const filteredStudents = useMemo(() => {
        const allStudents = studentsData?.data || [];
        if (!selectedClassId) return [];
        return allStudents.filter((s: any) =>
            s.studentProfile?.classId === selectedClassId || s.studentProfile?.class?.id === selectedClassId
        );
    }, [studentsData, selectedClassId]);

    // Fetch existing marks
    const { data: existingMarksData } = useMarks({
        examId: examId || undefined,
        classId: selectedClassId,
    });

    // Pre-fill existing marks
    useEffect(() => {
        const existing = existingMarksData?.data || [];
        if (existing.length > 0 && subjectId) {
            const prefill: Record<string, number> = {};
            existing.forEach((m: any) => {
                if (m.subjectId === subjectId) {
                    prefill[m.studentId] = m.marksObtained;
                }
            });
            setMarksInput(prefill);
        }
    }, [existingMarksData, subjectId]);

    const enterBulkMarks = useEnterBulkMarks();

    const handleSave = async () => {
        if (!examId) {
            toast.error("Please select an exam");
            return;
        }
        if (!subjectId) {
            toast.error("Please select a subject");
            return;
        }
        if (!selectedClassId) {
            toast.error("Please select a class");
            return;
        }

        const marksArray = Object.entries(marksInput)
            .filter(([_, val]) => val !== undefined && val !== null && !isNaN(val))
            .map(([studentId, marksObtained]) => ({
                examId,
                studentId,
                subjectId,
                classId: selectedClassId,
                marksObtained: Number(marksObtained),
                maxMarks,
            }));

        if (marksArray.length === 0) {
            toast.error("Please enter marks for at least one student");
            return;
        }

        try {
            await enterBulkMarks.mutateAsync({ marks: marksArray });
            toast.success(`Marks saved for ${marksArray.length} students!`);
        } catch (error: any) {
            toast.error(error?.message || "Failed to save marks");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-semibold">Enter marks (by subject)</h2>
                <Button
                    onClick={handleSave}
                    disabled={enterBulkMarks.isPending || !examId || !subjectId || !selectedClassId}
                    className="gap-2"
                >
                    {enterBulkMarks.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Marks
                </Button>
            </div>

            {/* Selectors */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Select Exam, Class & Subject</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Select value={examId} onValueChange={setExamId}>
                            <SelectTrigger>
                                <SelectValue placeholder={examsLoading ? "Loading..." : "Select Exam"} />
                            </SelectTrigger>
                            <SelectContent>
                                {exams.map((e: any) => (
                                    <SelectItem key={e.id} value={e.id}>
                                        {e.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={classFilterValue} onValueChange={setClassFilterValue}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classFilter.options.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={divisionFilterValue} onValueChange={setDivisionFilterValue}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Division" />
                            </SelectTrigger>
                            <SelectContent>
                                {divisionFilter.options.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={subjectId} onValueChange={setSubjectId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((s: any) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div>
                            <Input
                                type="number"
                                value={maxMarks}
                                onChange={(e) => setMaxMarks(parseInt(e.target.value) || 100)}
                                placeholder="Max Marks"
                                min={1}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Student Marks Table */}
            <div className="border rounded-lg overflow-hidden relative">
                {studentsLoading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-schooliat-primary" />
                    </div>
                )}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-schooliat-tint">
                                <TableHead className="w-16">No</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Roll No</TableHead>
                                <TableHead className="w-40">Marks Obtained</TableHead>
                                <TableHead className="w-32">Max Marks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!selectedClassId || !examId || !subjectId ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Please select an exam, class, and subject to enter marks.
                                    </TableCell>
                                </TableRow>
                            ) : filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        No students found for the selected class.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student: any, index: number) => (
                                    <TableRow key={student.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">
                                            {String(index + 1).padStart(2, "0")}
                                        </TableCell>
                                        <TableCell>
                                            {student.firstName} {student.lastName}
                                        </TableCell>
                                        <TableCell>
                                            {student.studentProfile?.rollNumber || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={maxMarks}
                                                value={marksInput[student.id] ?? ""}
                                                onChange={(e) =>
                                                    setMarksInput((prev) => ({
                                                        ...prev,
                                                        [student.id]: parseFloat(e.target.value),
                                                    }))
                                                }
                                                placeholder="0"
                                                className="w-24"
                                            />
                                        </TableCell>
                                        <TableCell className="text-gray-500">{maxMarks}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
