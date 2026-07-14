"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateSyllabus } from "@/lib/hooks/use-notes";
import { useSubjects } from "@/lib/hooks/use-subjects";
import { useAllClasses } from "@/lib/hooks/use-classes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddSyllabusPage() {
    const router = useRouter();
    const createSyllabus = useCreateSyllabus();
    const { data: subjectsData } = useSubjects({ limit: 1000 });
    const { data: classesData } = useAllClasses();

    const [formData, setFormData] = useState({
        subjectId: "",
        classId: "",
        academicYear: new Date().getFullYear().toString() + "-" + (new Date().getFullYear() + 1).toString().slice(-2),
        chapters: [
            { chapterNumber: 1, chapterName: "", topics: [""] }
        ]
    });

    const subjects = subjectsData?.data || [];
    const classes = classesData?.data || [];

    const handleAddChapter = () => {
        setFormData({
            ...formData,
            chapters: [...formData.chapters, { chapterNumber: formData.chapters.length + 1, chapterName: "", topics: [""] }]
        });
    };

    const handleRemoveChapter = (index: number) => {
        const newChapters = formData.chapters.filter((_, i) => i !== index);
        setFormData({ ...formData, chapters: newChapters });
    };

    const handleAddTopic = (chapterIndex: number) => {
        const newChapters = [...formData.chapters];
        newChapters[chapterIndex].topics.push("");
        setFormData({ ...formData, chapters: newChapters });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subjectId || !formData.classId) {
            toast.error("Please select both subject and class");
            return;
        }

        try {
            await createSyllabus.mutateAsync(formData);
            toast.success("Syllabus created successfully!");
            router.push("/admin/notes?tab=syllabus");
        } catch (error: any) {
            toast.error(error?.message || "Failed to create syllabus");
        }
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-semibold">Add New Syllabus</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Syllabus Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Select
                                    value={formData.subjectId || undefined}
                                    onValueChange={(v) => setFormData({ ...formData, subjectId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((sub: any) => (
                                            <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Select
                                    value={formData.classId || undefined}
                                    onValueChange={(v) => setFormData({ ...formData, classId: v })}
                                >
                                    <SelectTrigger>
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
                            <div className="space-y-2">
                                <Label>Academic Year</Label>
                                <Input
                                    value={formData.academicYear}
                                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                    placeholder="e.g. 2024-25"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Chapters</h3>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddChapter} className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Chapter
                                </Button>
                            </div>

                            {formData.chapters.map((chapter, cIndex) => (
                                <Card key={cIndex} className="bg-gray-50 border-dashed">
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 grid grid-cols-4 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Ch No.</Label>
                                                    <Input
                                                        type="number"
                                                        value={chapter.chapterNumber}
                                                        onChange={(e) => {
                                                            const newChapters = [...formData.chapters];
                                                            const n = parseInt(e.target.value, 10);
                                                            newChapters[cIndex].chapterNumber =
                                                                Number.isFinite(n) ? n : cIndex + 1;
                                                            setFormData({ ...formData, chapters: newChapters });
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-3 space-y-2">
                                                    <Label>Chapter Name</Label>
                                                    <Input
                                                        required
                                                        value={chapter.chapterName}
                                                        onChange={(e) => {
                                                            const newChapters = [...formData.chapters];
                                                            newChapters[cIndex].chapterName = e.target.value;
                                                            setFormData({ ...formData, chapters: newChapters });
                                                        }}
                                                        placeholder="Enter chapter name"
                                                    />
                                                </div>
                                            </div>
                                            {formData.chapters.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500"
                                                    onClick={() => handleRemoveChapter(cIndex)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Topics</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {chapter.topics.map((topic, tIndex) => (
                                                    <div key={tIndex} className="flex gap-2">
                                                        <Input
                                                            value={topic}
                                                            onChange={(e) => {
                                                                const newChapters = [...formData.chapters];
                                                                newChapters[cIndex].topics[tIndex] = e.target.value;
                                                                setFormData({ ...formData, chapters: newChapters });
                                                            }}
                                                            placeholder={`Topic ${tIndex + 1}`}
                                                        />
                                                        {chapter.topics.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    const newChapters = [...formData.chapters];
                                                                    newChapters[cIndex].topics = newChapters[cIndex].topics.filter((_, i) => i !== tIndex);
                                                                    setFormData({ ...formData, chapters: newChapters });
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAddTopic(cIndex)}
                                                    className="w-full"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" /> Add Topic
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createSyllabus.isPending}>
                                {createSyllabus.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Syllabus
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
