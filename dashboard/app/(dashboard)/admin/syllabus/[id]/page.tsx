"use client";

import { useParams, useRouter } from "next/navigation";
import { useSyllabusById } from "@/lib/hooks/use-notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calendar, User, ListChecks } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ViewSyllabusPage() {
    const params = useParams();
    const router = useRouter();
    const syllabusId = params.id as string;

    const { data: syllabusRes, isLoading } = useSyllabusById(syllabusId);
    const syllabus = syllabusRes?.data;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!syllabus) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <h2 className="text-xl font-semibold">Syllabus not found</h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-semibold">View Syllabus</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-schooliat-main" />
                            Syllabus: {syllabus.subject?.name}
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/syllabus/${syllabusId}/edit`)}>
                            Edit Syllabus
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span className="font-medium text-gray-900">Class:</span> {syllabus.class?.grade}{syllabus.class?.division ? `-${syllabus.class.division}` : ""}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium text-gray-900">Academic Year:</span> {syllabus.academicYear}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <ListChecks className="h-5 w-5" />
                            Chapters & Topics
                        </h3>
                        <div className="space-y-4">
                            {syllabus.chapters?.map((chapter: any, index: number) => (
                                <Card key={index} className="bg-gray-50 border-none">
                                    <CardContent className="p-4">
                                        <div className="font-semibold text-gray-900 mb-2">
                                            Chapter {chapter.chapterNumber}: {chapter.chapterName}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {chapter.topics?.map((topic: string, tIndex: number) => (
                                                <Badge key={tIndex} variant="secondary" className="bg-white border text-gray-600">
                                                    {topic}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
