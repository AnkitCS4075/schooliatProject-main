"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clipboard, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useGrievances } from "@/lib/hooks/use-grievances";
import { useSchools } from "@/lib/hooks/use-super-admin";

const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    icon: AlertCircle,
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

const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "#6b7280" },
  MEDIUM: { label: "Medium", color: "#3b82f6" },
  HIGH: { label: "High", color: "#f59e0b" },
  URGENT: { label: "Urgent", color: "#ef4444" },
};

type ScopeFilter = "all" | "platform" | "school";

export function GrievancesManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [filterSchoolId, setFilterSchoolId] = useState<string>("");

  const { data: schoolsRes } = useSchools();
  const schools = (schoolsRes?.data ?? []) as { id: string; name: string; code: string }[];

  const listEnabled = scope !== "school" || !!filterSchoolId;

  const { data, isLoading, error } = useGrievances(
    {
      scope,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      platformOnly: scope === "platform",
      schoolId:
        scope === "school" && filterSchoolId ? filterSchoolId : undefined,
    },
    { enabled: listEnabled },
  );

  const grievances = listEnabled ? (data?.data ?? []) : [];

  const filteredGrievances = useMemo(() => {
    if (!searchQuery.trim()) return grievances;
    const q = searchQuery.toLowerCase();
    return grievances.filter(
      (g: any) =>
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.createdBy?.firstName?.toLowerCase().includes(q) ||
        g.createdBy?.lastName?.toLowerCase().includes(q) ||
        g.school?.name?.toLowerCase().includes(q)
    );
  }, [grievances, searchQuery]);

  const stats = useMemo(() => {
    const all = grievances;
    return {
      total: all.length,
      open: all.filter((g: any) => g.status === "OPEN").length,
      inProgress: all.filter((g: any) => g.status === "IN_PROGRESS").length,
      resolved: all.filter((g: any) => g.status === "RESOLVED").length,
      urgent: all.filter(
        (g: any) =>
          g.priority === "URGENT" &&
          g.status !== "RESOLVED" &&
          g.status !== "CLOSED"
      ).length,
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

  if (isLoading && listEnabled) {
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
      <div>
        <h1 className="text-2xl font-semibold">Grievance Management</h1>
        <p className="text-gray-600 mt-1">
          Review and respond to grievances from schools and employees
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-blue-50">
          <Clipboard className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
          <p className="text-sm text-primary">Total</p>
        </div>
        {Object.entries(STATUS_CONFIG).slice(0, 3).map(([status, config]) => {
          const Icon = config.icon;
          const count =
            status === "OPEN"
              ? stats.open
              : status === "IN_PROGRESS"
              ? stats.inProgress
              : stats.resolved;
          return (
            <div
              key={status}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                statusFilter === status ? "border-blue-500" : ""
              }`}
              style={{ backgroundColor: config.bgColor }}
              onClick={() =>
                setStatusFilter(statusFilter === status ? null : status)
              }
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Scope</p>
          <Select
            value={scope}
            onValueChange={(v: ScopeFilter) => {
              setScope(v);
              if (v !== "school") setFilterSchoolId("");
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All schools</SelectItem>
              <SelectItem value="platform">Platform (no school)</SelectItem>
              <SelectItem value="school">Single school</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {scope === "school" ? (
          <div className="space-y-2 flex-1 min-w-[200px]">
            <p className="text-sm font-medium text-gray-700">School</p>
            <Select value={filterSchoolId} onValueChange={setFilterSchoolId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a school…" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <div className="space-y-2 flex-1 min-w-[200px]">
          <p className="text-sm font-medium text-gray-700">Search</p>
          <Input
            placeholder="Search title, school, author…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Status Chips */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!statusFilter ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter(null)}
        >
          All Status
        </Button>
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setStatusFilter(statusFilter === status ? null : status)
            }
            style={
              statusFilter === status
                ? { backgroundColor: config.bgColor, color: config.color }
                : {}
            }
          >
            {config.label}
          </Button>
        ))}
      </div>

      {/* Grievances List */}
      {scope === "school" && !filterSchoolId ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-600">
            Choose a school in the filter row above to load its grievances.
          </p>
        </div>
      ) : filteredGrievances.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No grievances found</p>
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
            const isSchoolAdmin =
              grievance.createdBy?.role?.name === "SCHOOL_ADMIN";

            return (
              <div
                key={grievance.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/super-admin/grievances/${grievance.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
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
                <h3 className="font-semibold mb-2">{grievance.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>
                    {grievance.createdBy?.firstName}{" "}
                    {grievance.createdBy?.lastName}
                  </span>
                  <span>•</span>
                  <span>{isSchoolAdmin ? "School Admin" : "Employee"}</span>
                  {grievance.school?.name && (
                    <>
                      <span>•</span>
                      <span>{grievance.school.name}</span>
                    </>
                  )}
                </div>
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

