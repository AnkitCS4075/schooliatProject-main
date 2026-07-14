"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, Edit, Trash2, Plus, FileText, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Homework {
  id: string;
  title: string;
  description: string;
  subject?: { name: string };
  dueDate: string;
  isMCQ: boolean;
  submissionCount?: number;
  totalStudents?: number;
  status?: string;
}

interface HomeworkTableProps {
  homeworks: Homework[];
  onView: (homework: Homework) => void;
  onEdit: (homework: Homework) => void;
  onDelete: (homeworkId: string) => void;
  onAddNew: () => void;
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  loading: boolean;
}

export function HomeworkTable({
  homeworks,
  onView,
  onEdit,
  onDelete,
  onAddNew,
  page,
  onPageChange,
  totalPages,
  loading,
}: HomeworkTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHomeworks = homeworks.filter((hw) =>
    hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hw.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (homework: Homework) => {
    const dueDate = new Date(homework.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now;

    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (homework.submissionCount === homework.totalStudents) {
      return <Badge className="bg-primary hover:bg-schooliat-primary-dark">All Submitted</Badge>;
    }
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Homework & Assignments</h1>
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg p-4 border">
        <Input
          placeholder="Search homework by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead className="w-16">No</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHomeworks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No homework found
                  </TableCell>
                </TableRow>
              ) : (
                filteredHomeworks.map((homework, index) => (
                  <TableRow key={homework.id}>
                    <TableCell className="font-medium">
                      {String((page - 1) * 10 + index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {homework.title}
                      </div>
                    </TableCell>
                    <TableCell>{homework.subject?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={homework.isMCQ ? "default" : "secondary"}>
                        {homework.isMCQ ? "MCQ" : "Assignment"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(homework.dueDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {homework.submissionCount || 0} / {homework.totalStudents || 0}
                    </TableCell>
                    <TableCell>{getStatusBadge(homework)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(homework)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(homework)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(homework.id)}
                          disabled={loading}
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

