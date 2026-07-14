"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMyGrievances } from "@/lib/hooks/use-grievances";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const STATUS_CONFIG = {
  OPEN: { label: "Open", color: "#3b82f6", bgColor: "#eff6ff", icon: Clock },
  IN_PROGRESS: { label: "In Progress", color: "#f59e0b", bgColor: "#fffbeb", icon: AlertCircle },
  RESOLVED: { label: "Resolved", color: "#10b981", bgColor: "#ecfdf5", icon: CheckCircle },
  CLOSED: { label: "Closed", color: "#6b7280", bgColor: "#f3f4f6", icon: XCircle },
};

const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "#6b7280" },
  MEDIUM: { label: "Medium", color: "#3b82f6" },
  HIGH: { label: "High", color: "#f59e0b" },
  URGENT: { label: "Urgent", color: "#ef4444" },
};

export function ContactSchooliat() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading } = useMyGrievances({
    status: statusFilter || undefined,
  });

  const grievances = data?.data ?? [];

  const filteredGrievances = useMemo(() => {
    if (!searchQuery.trim()) return grievances;
    const q = searchQuery.toLowerCase();
    return grievances.filter(
      (g: any) =>
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q)
    );
  }, [grievances, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: grievances.length,
      open: grievances.filter((g: any) => g.status === "OPEN").length,
      inProgress: grievances.filter((g: any) => g.status === "IN_PROGRESS").length,
      resolved: grievances.filter((g: any) => g.status === "RESOLVED").length,
    };
  }, [grievances]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grievances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Contact Schooliat</h1>
          <p className="text-gray-600 mt-1">
            Submit and track your grievances with the Schooliat team
          </p>
        </div>
        <Button onClick={() => router.push("/admin/contact/create")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Grievance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          const count =
            status === "OPEN"
              ? stats.open
              : status === "IN_PROGRESS"
              ? stats.inProgress
              : status === "RESOLVED"
              ? stats.resolved
              : 0;
          return (
            <div
              key={status}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                statusFilter === status ? "border-primary" : ""
              }`}
              style={{ backgroundColor: config.bgColor }}
              onClick={() => setStatusFilter(statusFilter === status ? null : status)}
            >
              <Icon className="w-6 h-6 mb-2" style={{ color: config.color }} />
              <p className="text-2xl font-bold" style={{ color: config.color }}>
                {count}
              </p>
              <p className="text-sm" style={{ color: config.color }}>
                {config.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search grievances..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Grievances List */}
      {filteredGrievances.length === 0 ? (
        <div className="border rounded-lg p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No grievances found</p>
          <Button onClick={() => router.push("/admin/contact/create")} className="mt-4">
            Submit Your First Grievance
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGrievances.map((grievance: any) => {
            const statusConfig =
              STATUS_CONFIG[grievance.status as keyof typeof STATUS_CONFIG] ||
              STATUS_CONFIG.OPEN;
            const priorityConfig =
              PRIORITY_CONFIG[grievance.priority as keyof typeof PRIORITY_CONFIG] ||
              PRIORITY_CONFIG.MEDIUM;

            return (
              <div
                key={grievance.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/admin/contact/${grievance.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{grievance.title}</h3>
                  <div className="flex items-center gap-2">
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
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {grievance.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatDate(grievance.createdAt)}</span>
                  {grievance.comments?.length > 0 && (
                    <span className="text-primary">
                      {grievance.comments.length} replies
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

