import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { get, post, patch } from "@/lib/api/client";

export function useGrievances(
  params?: {
    status?: string;
    priority?: string;
    schoolId?: string;
    platformOnly?: boolean;
    /** Distinguishes list intent for cache keys (e.g. all vs school picker idle). */
    scope?: "all" | "platform" | "school";
  },
  options?: { enabled?: boolean },
) {
  const { status, priority, schoolId, platformOnly, scope } = params || {};
  const query: Record<string, string> = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (schoolId) query.schoolId = schoolId;
  if (platformOnly) query.platformOnly = "true";

  return useQuery({
    queryKey: [
      "grievances",
      scope ?? "all",
      status,
      priority,
      schoolId,
      platformOnly,
    ],
    queryFn: () => get("/grievances", query),
    staleTime: 30 * 1000,
    enabled: options?.enabled !== false,
  });
}

export function useMyGrievances(params?: { status?: string; priority?: string }) {
  const { status, priority } = params || {};
  return useQuery({
    queryKey: ["myGrievances", status, priority],
    queryFn: () => get("/grievances/my", { status, priority }),
    staleTime: 30 * 1000,
  });
}

export function useGrievance(id: string) {
  return useQuery({
    queryKey: ["grievance", id],
    queryFn: () => get(`/grievances/${id}`),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateGrievance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: CreateGrievanceData) =>
      post("/grievances", { request: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGrievances"] });
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
    },
  });
}

export function useUpdateGrievance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...formData }: { id: string } & Partial<Grievance>) =>
      patch(`/grievances/${id}`, { request: formData }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
      queryClient.invalidateQueries({ queryKey: ["myGrievances"] });
      queryClient.invalidateQueries({ queryKey: ["grievance", variables.id] });
    },
  });
}

export function useAddGrievanceComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ grievanceId, content }: { grievanceId: string; content: string }) =>
      post(`/grievances/${grievanceId}/comments`, {
        request: { content },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["grievance", variables.grievanceId],
      });
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
      queryClient.invalidateQueries({ queryKey: ["myGrievances"] });
    },
  });
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    role?: {
      name: string;
    };
  };
  school?: {
    id: string;
    name: string;
  };
  comments?: GrievanceComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGrievanceData {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export interface GrievanceComment {
  id: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

