"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  GraduationCap,
  BookOpen,
  Calendar,
  Users,
  MessageSquare,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { useHomework, useDeleteHomework, useGradeHomework, useHomeworkById } from "@/lib/hooks/use-homework";
import { useAllClasses } from "@/lib/hooks/use-classes";
import { useSubjects } from "@/lib/hooks/use-subjects";
import { cn } from "@/lib/utils";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";

export default function HomeworkPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [homeworkOtpId, setHomeworkOtpId] = useState<string | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradingData, setGradingData] = useState({
    marksObtained: "",
    feedback: "",
  });
  const limit = 15;

  // Fetch classes and subjects
  const { data: classesData } = useAllClasses();
  const classes = classesData?.data || [];

  const { data: subjectsData } = useSubjects({
    classId: selectedClassId && selectedClassId !== "all" ? selectedClassId : undefined,
    limit: 1000,
  });
  const subjects = subjectsData?.data || [];

  // Fetch homeworks
  const { data: homeworkData, isLoading: homeworkLoading, refetch } = useHomework({
    classId: selectedClassId && selectedClassId !== "all" ? selectedClassId : undefined,
    subjectId: selectedSubjectId && selectedSubjectId !== "all" ? selectedSubjectId : undefined,
    page,
    limit,
  });

  const deleteHomework = useDeleteHomework();
  const gradeHomework = useGradeHomework();

  const homeworks = homeworkData?.data?.homeworks || [];
  const pagination = homeworkData?.data?.pagination || { page: 1, limit, total: 0, totalPages: 0 };

  // Filter homeworks by search query, type, and status
  const filteredHomeworks = homeworks.filter((hw: any) => {
    const matchesSearch = 
      hw.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hw.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "all" || 
      (selectedType === "mcq" && hw.isMCQ) ||
      (selectedType === "assignment" && !hw.isMCQ);
    
    const dueDate = new Date(hw.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now;
    const submissionCount = hw._count?.submissions || 0;
    // Calculate total students from classIds if not provided
    const totalStudents = hw.totalStudents || (hw.classIds?.length || 0) * 30; // Estimate if not available
    const allSubmitted = submissionCount === totalStudents && totalStudents > 0;
    
    let matchesStatus = true;
    if (selectedStatus === "overdue") {
      matchesStatus = isOverdue;
    } else if (selectedStatus === "pending") {
      matchesStatus = !isOverdue && !allSubmitted;
    } else if (selectedStatus === "completed") {
      matchesStatus = allSubmitted;
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);
  const { data: homeworkDetailData, refetch: refetchHomeworkDetail } = useHomeworkById(selectedHomeworkId || "");

  const handleView = (homework: any) => {
    setSelectedHomeworkId(homework.id);
    setSelectedHomework(homework);
    setIsDetailDialogOpen(true);
    // Refetch to get full details with submissions
    setTimeout(() => {
      if (homework.id) {
        refetchHomeworkDetail();
      }
    }, 100);
  };

  // Update selected homework when detail data loads
  useEffect(() => {
    if (homeworkDetailData?.data && selectedHomeworkId) {
      setSelectedHomework(homeworkDetailData.data);
    }
  }, [homeworkDetailData, selectedHomeworkId]);

  const handleEdit = (homework: any) => {
    router.push(`/admin/homework/${homework.id}/edit`);
  };

  const handleDelete = (homework: any) => {
    setHomeworkOtpId(homework.id);
  };

  const handleGrade = (submission: any) => {
    setSelectedSubmission(submission);
    setGradingData({
      marksObtained: submission.marksObtained?.toString() || "",
      feedback: submission.feedback || "",
    });
    setIsGradeDialogOpen(true);
  };

  const confirmGrade = async () => {
    if (!selectedSubmission || !selectedHomework) return;

    try {
      await gradeHomework.mutateAsync({
        submissionId: selectedSubmission.id,
        marksObtained: parseFloat(gradingData.marksObtained) || 0,
        feedback: gradingData.feedback || undefined,
      });
      toast.success("Homework graded successfully");
      setIsGradeDialogOpen(false);
      setSelectedSubmission(null);
      // Refresh homework details
      handleView(selectedHomework);
    } catch (error: any) {
      toast.error(error?.message || "Failed to grade homework");
    }
  };

  const getStatusBadge = (homework: any) => {
    const dueDate = new Date(homework.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now;
    const submissionCount = homework._count?.submissions || 0;
    const totalStudents = homework.totalStudents || 0;
    const allSubmitted = submissionCount === totalStudents && totalStudents > 0;

    if (isOverdue) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </Badge>
      );
    }
    if (allSubmitted) {
      return (
        <Badge className="bg-primary hover:bg-schooliat-primary-dark gap-1">
          <CheckCircle2 className="h-3 w-3" />
          All Submitted
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500 hover:bg-yellow-600 gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <Badge className="bg-primary/80 hover:bg-primary">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Submitted
          </Badge>
        );
      case "GRADED":
        return (
          <Badge className="bg-primary hover:bg-schooliat-primary-dark">
            <Star className="h-3 w-3 mr-1" />
            Graded
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Homework & Assignments</h1>
          <p className="text-gray-600 mt-1">Manage and track homework assignments</p>
        </div>
        <Button onClick={() => router.push("/admin/homework/add")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Homework
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger id="class">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.grade}
                      {cls.division ? `-${cls.division}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((sub: any) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mcq">MCQ Assessment</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Homeworks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-3xl font-bold">{pagination.total || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="text-3xl font-bold">
                {homeworks.reduce((acc: number, hw: any) => {
                  const total = hw.totalStudents || (hw.classIds?.length || 0) * 30;
                  const submitted = hw._count?.submissions || 0;
                  return acc + Math.max(0, total - submitted);
                }, 0)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="text-3xl font-bold">
                {homeworks.filter((hw: any) => new Date(hw.dueDate) < new Date()).length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">MCQ Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-purple-600" />
              <div className="text-3xl font-bold">
                {homeworks.filter((hw: any) => hw.isMCQ).length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Homework Table */}
      <Card>
        <CardContent className="p-0">
          {homeworkLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredHomeworks.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No homework found</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchQuery || selectedClassId !== "all" || selectedSubjectId !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first homework assignment"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-schooliat-tint">
                      <TableHead className="w-16">No</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Classes</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHomeworks.map((homework: any, index: number) => (
                      <TableRow key={homework.id}>
                        <TableCell className="font-medium">
                          {String((page - 1) * limit + index + 1).padStart(2, "0")}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-semibold">{homework.title}</div>
                              {homework.description && (
                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                  {homework.description.substring(0, 50)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 text-gray-400" />
                            {homework.subject?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={homework.isMCQ ? "default" : "secondary"}>
                            {homework.isMCQ ? "MCQ" : "Assignment"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {homework.classIds?.length || 0} class(es)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {format(new Date(homework.dueDate), "MMM dd, yyyy HH:mm")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {homework._count?.submissions || 0} / {homework.totalStudents || 0}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(homework)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(homework)}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(homework)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(homework)}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
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
                      disabled={page >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Homework Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Homework Details
            </DialogTitle>
            <DialogDescription>
              View homework details and manage submissions
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedHomework && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Title</Label>
                    <p className="text-lg font-semibold mt-1">{selectedHomework.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Description</Label>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {selectedHomework.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Subject</Label>
                      <p className="text-sm mt-1">{selectedHomework.subject?.name || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Due Date</Label>
                      <p className="text-sm mt-1">
                        {format(new Date(selectedHomework.dueDate), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Type</Label>
                      <Badge variant={selectedHomework.isMCQ ? "default" : "secondary"} className="mt-1">
                        {selectedHomework.isMCQ ? "MCQ Assessment" : "Assignment"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Teacher</Label>
                      <p className="text-sm mt-1">
                        {selectedHomework.teacher?.firstName} {selectedHomework.teacher?.lastName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submissions */}
                {selectedHomework.submissions && selectedHomework.submissions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Submissions</Label>
                      <Badge variant="outline">
                        {selectedHomework.submissions.length} submission(s)
                      </Badge>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Marks</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedHomework.submissions.map((submission: any) => (
                            <TableRow key={submission.id}>
                              <TableCell className="font-medium">
                                {submission.student?.firstName} {submission.student?.lastName}
                              </TableCell>
                              <TableCell>
                                {submission.student?.studentProfile?.rollNumber || "N/A"}
                              </TableCell>
                              <TableCell>
                                {submission.student?.studentProfile?.class?.grade}
                                {submission.student?.studentProfile?.class?.division
                                  ? `-${submission.student.studentProfile.class.division}`
                                  : ""}
                              </TableCell>
                              <TableCell>
                                {submission.submittedAt
                                  ? format(new Date(submission.submittedAt), "MMM dd, yyyy HH:mm")
                                  : "Not submitted"}
                              </TableCell>
                              <TableCell>{getSubmissionStatusBadge(submission.status)}</TableCell>
                              <TableCell>
                                {submission.marksObtained !== null && submission.totalMarks !== null
                                  ? `${submission.marksObtained} / ${submission.totalMarks}`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {submission.status === "SUBMITTED" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleGrade(submission)}
                                  >
                                    Grade
                                  </Button>
                                )}
                                {submission.status === "GRADED" && submission.feedback && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      toast.info(submission.feedback);
                                    }}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeletionOtpDialog
        open={!!homeworkOtpId}
        onOpenChange={(open) => !open && setHomeworkOtpId(null)}
        audience="school-admin"
        title="Delete homework"
        description="This removes the homework assignment. Confirm with the code sent to your deletion email."
        entityType={SCHOOL_DELETION_ENTITY.HOMEWORK}
        entityId={homeworkOtpId ?? ""}
        isDeleting={deleteHomework.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!homeworkOtpId) return;
          await deleteHomework.mutateAsync({ id: homeworkOtpId, otp });
          toast.success("Homework deleted successfully");
          refetch();
        }}
      />

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Homework</DialogTitle>
            <DialogDescription>
              Provide marks and feedback for this submission
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="marks">Marks Obtained</Label>
              <Input
                id="marks"
                type="number"
                min="0"
                step="0.5"
                value={gradingData.marksObtained}
                onChange={(e) =>
                  setGradingData({ ...gradingData, marksObtained: e.target.value })
                }
                placeholder="Enter marks"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={gradingData.feedback}
                onChange={(e) =>
                  setGradingData({ ...gradingData, feedback: e.target.value })
                }
                placeholder="Enter feedback (optional)"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmGrade} disabled={gradeHomework.isPending}>
              {gradeHomework.isPending ? "Grading..." : "Submit Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

