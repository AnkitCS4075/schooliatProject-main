"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNote } from "@/lib/hooks/use-notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Calendar, User, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViewNotePage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params.id as string;

    const { data: noteRes, isLoading } = useNote(noteId);
    const note = noteRes?.data;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!note) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <h2 className="text-xl font-semibold">Note not found</h2>
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
                <h1 className="text-2xl font-semibold">View Note</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <FileText className="h-5 w-5 text-schooliat-main" />
                            {note.title}
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/notes/${noteId}/edit`)}>
                            Edit Note
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <BookOpen className="h-4 w-4" />
                                <span className="font-medium text-gray-900">Subject:</span> {note.subject?.name || "N/A"}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span className="font-medium text-gray-900">Class:</span> {note.class?.grade}{note.class?.division ? `-${note.class.division}` : ""}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium text-gray-900">Created:</span> {new Date(note.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FileText className="h-4 w-4" />
                                <span className="font-medium text-gray-900">Topic:</span> {note.topic || "N/A"}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium mb-2">Description</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{note.description}</p>
                    </div>

                    {note.file && (
                        <div className="pt-4 border-t">
                            <h3 className="text-lg font-medium mb-2">Attachment</h3>
                            <a
                                href={note.file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-schooliat-main hover:underline"
                            >
                                <FileText className="h-4 w-4" />
                                Download Attachment
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
