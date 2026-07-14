"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useGrievance, useAddGrievanceComment } from "@/lib/hooks/use-grievances";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, Calendar, User } from "lucide-react";

const STATUS_CONFIG = {
  OPEN: { label: "Open", color: "#3b82f6", bgColor: "#eff6ff" },
  IN_PROGRESS: { label: "In Progress", color: "#f59e0b", bgColor: "#fffbeb" },
  RESOLVED: { label: "Resolved", color: "#10b981", bgColor: "#ecfdf5" },
  CLOSED: { label: "Closed", color: "#6b7280", bgColor: "#f3f4f6" },
};

const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "#6b7280" },
  MEDIUM: { label: "Medium", color: "#3b82f6" },
  HIGH: { label: "High", color: "#f59e0b" },
  URGENT: { label: "Urgent", color: "#ef4444" },
};

export function GrievanceDetailView({ grievanceId }: { grievanceId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const { data, isLoading, error } = useGrievance(grievanceId);
  const addComment = useAddGrievanceComment();

  const grievance = data?.data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    try {
      await addComment.mutateAsync({
        grievanceId,
        content: newComment.trim(),
      });
      setNewComment("");
      toast({
        title: "Success",
        description: "Reply sent successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grievance...</p>
        </div>
      </div>
    );
  }

  if (error || !grievance) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600">Grievance Not Found</p>
          <p className="text-sm text-gray-600 mt-2">
            {(error as Error)?.message || "The grievance you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[grievance.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.OPEN;
  const priorityConfig = PRIORITY_CONFIG[grievance.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.MEDIUM;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{grievance.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge
              variant="outline"
              style={{
                backgroundColor: statusConfig.bgColor,
                color: statusConfig.color,
                borderColor: statusConfig.color,
              }}
            >
              {statusConfig.label}
            </Badge>
            <Badge
              variant="outline"
              style={{
                borderColor: priorityConfig.color,
                color: priorityConfig.color,
              }}
            >
              {priorityConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{grievance.description}</p>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Comments & Replies</h2>
            {grievance.comments && grievance.comments.length > 0 ? (
              <div className="space-y-4">
                {grievance.comments.map((comment: any) => (
                  <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {comment.createdBy.firstName} {comment.createdBy.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No comments yet</p>
            )}

            <div className="mt-6 space-y-2">
              <Textarea
                placeholder="Add a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleAddComment}
                disabled={addComment.isPending || !newComment.trim()}
                className="w-full"
              >
                {addComment.isPending ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Created:</span>
                <span>{formatDate(grievance.createdAt)}</span>
              </div>
              {grievance.createdBy && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Submitted by:</span>
                  <span>
                    {grievance.createdBy.firstName} {grievance.createdBy.lastName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


