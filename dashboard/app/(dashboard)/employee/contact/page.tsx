"use client";

import { useState } from "react";
import { useMyGrievances } from "@/lib/hooks/use-grievances";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateGrievanceForm } from "@/components/contact/create-grievance-form";
import { GrievanceDetailView } from "@/components/contact/grievance-detail-view";
import { MessageSquare, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_CONFIG = {
  OPEN: { label: "Open", color: "#3b82f6", bgColor: "#eff6ff", icon: Clock },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    icon: Clock,
  },
  RESOLVED: {
    label: "Resolved",
    color: "#10b981",
    bgColor: "#ecfdf5",
    icon: CheckCircle,
  },
  CLOSED: {
    label: "Closed",
    color: "#6b7280",
    bgColor: "#f3f4f6",
    icon: XCircle,
  },
};

export default function EmployeeContactPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data, isLoading, refetch } = useMyGrievances();
  const grievances = data?.data ?? [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewGrievance = (grievanceId: string) => {
    setSelectedGrievanceId(grievanceId);
    setShowDetailModal(true);
  };

  const stats = {
    open: grievances.filter((g: { status: string }) => g.status === "OPEN").length,
    inProgress: grievances.filter((g: { status: string }) => g.status === "IN_PROGRESS").length,
    resolved: grievances.filter(
      (g: { status: string }) => g.status === "RESOLVED" || g.status === "CLOSED"
    ).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Contact Schooliat</h1>
            <p className="text-sm opacity-90">
              Submit and track your grievances
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-primary hover:bg-gray-100"
            size="icon"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 bg-white/20 rounded-xl p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.open}</p>
            <p className="text-xs opacity-90">Open</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.inProgress}</p>
            <p className="text-xs opacity-90">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.resolved}</p>
            <p className="text-xs opacity-90">Resolved</p>
          </div>
        </div>
      </div>

      {/* Grievances List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Your Grievances</h2>

        {grievances.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No grievances yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Tap the + button to submit your first grievance
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 hover:-translate-y-0.5 transition-all duration-300 ease-in-out"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Grievance
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {grievances.map((grievance: { id: string; status: string; title: string; createdAt: string; comments?: Array<{ author?: { role?: { name: string } } }> }) => {
              const statusConfig =
                STATUS_CONFIG[
                  grievance.status as keyof typeof STATUS_CONFIG
                ] || STATUS_CONFIG.OPEN;
              const hasNewReplies = grievance.comments?.some(
                (c: { author?: { role?: { name: string } } }) => c.author?.role?.name === "SUPER_ADMIN"
              );

              return (
                <Card
                  key={grievance.id}
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handleViewGrievance(grievance.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            style={{
                              backgroundColor: statusConfig.bgColor,
                              color: statusConfig.color,
                            }}
                          >
                            {statusConfig.label}
                          </Badge>
                          {hasNewReplies && (
                            <Badge className="bg-green-600 text-white">
                              Reply
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {grievance.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(grievance.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Grievance Modal */}
      <Dialog
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) refetch();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Grievance</DialogTitle>
          </DialogHeader>
          <CreateGrievanceForm />
        </DialogContent>
      </Dialog>

      {/* Grievance Detail Modal */}
      {selectedGrievanceId && (
        <Dialog
          open={showDetailModal}
          onOpenChange={(open) => {
            setShowDetailModal(open);
            if (!open) {
              setSelectedGrievanceId(null);
              refetch();
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <GrievanceDetailView grievanceId={selectedGrievanceId} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

