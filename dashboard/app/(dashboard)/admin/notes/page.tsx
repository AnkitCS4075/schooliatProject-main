"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotes, useDeleteNote } from "@/lib/hooks/use-notes";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, FileText, Eye, Edit, Trash2, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSyllabus } from "@/lib/hooks/use-notes";

export default function NotesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"notes" | "syllabus">("notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [noteOtpId, setNoteOtpId] = useState<string | null>(null);
  const limit = 15;

  /** Open correct tab when linked from e.g. /admin/syllabus/add redirect (?tab=syllabus) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "syllabus" || tab === "notes") {
      setActiveTab(tab);
    }
  }, []);

  const { data: notesData, isLoading: notesLoading, refetch: refetchNotes } = useNotes({
    page,
    limit,
  });

  const { data: syllabusData, isLoading: syllabusLoading } = useSyllabus({});

  const deleteNote = useDeleteNote();

  const notes = notesData?.data || [];
  const syllabus = syllabusData?.data || [];
  const totalPages = notesData?.pagination?.totalPages || 1;

  const handleView = useCallback(
    (item: any) => {
      if (activeTab === "notes") {
        router.push(`/admin/notes/${item.id}`);
      } else {
        router.push(`/admin/syllabus/${item.id}`);
      }
    },
    [router, activeTab]
  );

  const handleEdit = useCallback(
    (item: any) => {
      if (activeTab === "notes") {
        router.push(`/admin/notes/${item.id}/edit`);
      } else {
        router.push(`/admin/syllabus/${item.id}/edit`);
      }
    },
    [router, activeTab]
  );

  const handleDelete = useCallback((noteId: string) => {
    setNoteOtpId(noteId);
  }, []);

  const handleAddNew = useCallback(() => {
    if (activeTab === "notes") {
      router.push("/admin/notes/add");
    } else {
      router.push("/admin/syllabus/add");
    }
  }, [router, activeTab]);

  const filteredNotes = notes.filter((note: any) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const title = String(note.title ?? "").toLowerCase();
    const desc = String(note.description ?? "").toLowerCase();
    return title.includes(q) || desc.includes(q);
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notes & Syllabus</h1>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "notes" | "syllabus")}
      >
        <TabsList>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <Input
                placeholder="Search notes by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </CardContent>
          </Card>

          {/* Notes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Study Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {notesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-schooliat-tint">
                        <TableHead className="w-16">No</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Chapter</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNotes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No notes found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredNotes.map((note: any, index: number) => (
                          <TableRow key={note.id}>
                            <TableCell className="font-medium">
                              {String((page - 1) * limit + index + 1).padStart(2, "0")}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                {note.title}
                              </div>
                            </TableCell>
                            <TableCell>{note.subject?.name || "N/A"}</TableCell>
                            <TableCell>
                              {note.class?.grade || "N/A"}
                              {note.class?.division ? `-${note.class.division}` : ""}
                            </TableCell>
                            <TableCell>{note.chapter || "N/A"}</TableCell>
                            <TableCell>{note.topic || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleView(note)}
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(note)}
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(note.id)}
                                  disabled={deleteNote.isPending}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Syllabus Tab */}
        <TabsContent value="syllabus" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Syllabus</CardTitle>
            </CardHeader>
            <CardContent>
              {syllabusLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-schooliat-tint">
                        <TableHead>Subject</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Chapters</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syllabus.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No syllabus found
                          </TableCell>
                        </TableRow>
                      ) : (
                        syllabus.map((syl: any) => (
                          <TableRow key={syl.id}>
                            <TableCell className="font-medium">
                              {syl.subject?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              {syl.class?.grade || "N/A"}
                              {syl.class?.division ? `-${syl.class.division}` : ""}
                            </TableCell>
                            <TableCell>{syl.academicYear || "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {Array.isArray(syl.chapters) ? syl.chapters.length : 0}{" "}
                                chapters
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleView(syl)}
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(syl)}
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeletionOtpDialog
        open={!!noteOtpId}
        onOpenChange={(open) => !open && setNoteOtpId(null)}
        audience="school-admin"
        title="Delete note"
        description="This permanently removes the note. Confirm with the code sent to your deletion email."
        entityType={SCHOOL_DELETION_ENTITY.NOTE}
        entityId={noteOtpId ?? ""}
        isDeleting={deleteNote.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!noteOtpId) return;
          await deleteNote.mutateAsync({ id: noteOtpId, otp });
          toast.success("Note deleted successfully!");
          refetchNotes();
        }}
      />
    </div>
  );
}

