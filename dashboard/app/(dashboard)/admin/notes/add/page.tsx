"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateNote } from "@/lib/hooks/use-notes";
import { useSubjects } from "@/lib/hooks/use-subjects";
import { useAllClasses } from "@/lib/hooks/use-classes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddNotePage() {
    const router = useRouter();
    const createNote = useCreateNote();
    const { data: subjectsData } = useSubjects({ limit: 1000 });
    const { data: classesData } = useAllClasses();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subjectId: "",
        classId: "",
        chapter: "",
        topic: "",
    });

    const subjects = subjectsData?.data || [];
    const classes = classesData?.data || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subjectId || !formData.classId) {
            toast.error("Please select both subject and class");
            return;
        }

        try {
            await createNote.mutateAsync(formData);
            toast.success("Note created successfully!");
            router.push("/admin/notes");
        } catch (error: any) {
            toast.error(error?.message || "Failed to create note");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-semibold">Add New Note</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Note Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter note title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Select
                                    value={formData.subjectId || undefined}
                                    onValueChange={(v) => setFormData({ ...formData, subjectId: v })}
                                >
                                    <SelectTrigger id="subject">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((sub: any) => (
                                            <SelectItem key={sub.id} value={sub.id}>
                                                {sub.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="class">Class</Label>
                                <Select
                                    value={formData.classId || undefined}
                                    onValueChange={(v) => setFormData({ ...formData, classId: v })}
                                >
                                    <SelectTrigger id="class">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls: any) => (
                                            <SelectItem key={cls.id} value={cls.id}>
                                                {cls.grade}{cls.division ? `-${cls.division}` : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="chapter">Chapter</Label>
                                    <Input
                                        id="chapter"
                                        value={formData.chapter}
                                        onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                                        placeholder="e.g. Ch 1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="topic">Topic</Label>
                                    <Input
                                        id="topic"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        placeholder="e.g. Algebra"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                required
                                rows={5}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter note content or instructions"
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createNote.isPending}>
                                {createNote.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Note
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
