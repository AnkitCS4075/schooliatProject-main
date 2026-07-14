"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Plus } from "lucide-react";

const CIRCULAR_COLUMNS = [
  { key: "no", title: "No", width: "w-16" },
  { key: "title", title: "Title", width: "w-64" },
  { key: "content", title: "Content", width: "w-96" },
  { key: "visibleFrom", title: "Visible From", width: "w-40" },
  { key: "visibleTill", title: "Visible Till", width: "w-40" },
  { key: "action", title: "Action", width: "w-32" },
];

interface CircularsTableProps {
  notices: any[];
  onAddNew: () => void;
  onEdit: (notice: any) => void;
  onDelete: (noticeId: string) => void;
  onBulkDelete: (ids: string[]) => void;
  page: number;
  onPageChange: (page: number) => void;
  serverTotalPages: number;
  loading: boolean;
  onRefresh: () => void;
}

export function CircularsTable({
  notices,
  onAddNew,
  onEdit,
  onDelete,
  onBulkDelete,
  page,
  onPageChange,
  serverTotalPages,
  loading,
}: CircularsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const filteredNotices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notices;

    return notices.filter((notice) => {
      const titleMatch = notice.title?.toLowerCase().includes(q);
      const contentMatch = notice.content?.toLowerCase().includes(q);
      return titleMatch || contentMatch;
    });
  }, [notices, searchQuery]);

  const toggleRowSelection = (noticeId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(noticeId)) {
      newSelected.delete(noticeId);
    } else {
      newSelected.add(noticeId);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredNotices.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredNotices.map((n) => n.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.size > 0) {
      onBulkDelete(Array.from(selectedRows));
      setSelectedRows(new Set());
    }
  };

  const allSelected = filteredNotices.length > 0 && selectedRows.size === filteredNotices.length;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Circulars/Notices</h1>
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by Title or Content"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            {selectedRows.size} notice(s) selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={loading}
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                {CIRCULAR_COLUMNS.map((column) => (
                  <TableHead key={column.key} className={column.width}>
                    {column.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && filteredNotices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={CIRCULAR_COLUMNS.length + 1} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredNotices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={CIRCULAR_COLUMNS.length + 1} className="text-center py-8">
                    No notices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotices.map((notice, index) => {
                  const isSelected = selectedRows.has(notice.id);
                  return (
                    <TableRow
                      key={notice.id}
                      className={isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRowSelection(notice.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {String(index + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell className="font-semibold">{notice.title || "-"}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate">{notice.content || "-"}</p>
                      </TableCell>
                      <TableCell>{formatDate(notice.visibleFrom)}</TableCell>
                      <TableCell>{formatDate(notice.visibleTill)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(notice)}
                            className="h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(notice.id)}
                            disabled={loading}
                            className="h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {serverTotalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page + 1} of {serverTotalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(serverTotalPages - 1, page + 1))}
              disabled={page >= serverTotalPages - 1 || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

