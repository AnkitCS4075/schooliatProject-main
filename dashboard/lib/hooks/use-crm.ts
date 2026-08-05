"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";

interface CrmLead {
  id: string;
  name: string;
  phone: string;
  source: string;
  stage: string;
  category?: string;
  assignedToId?: string;
  nextFollowUpAt?: string;
  assignedTo?: { id: string; firstName: string; lastName?: string };
  _count?: { remarks: number };
  remarks?: LeadRemark[];
  gateEntries?: { id: string; serialNo: number; inTime: string }[];
  createdAt: string;
}

interface LeadRemark {
  id: string;
  content: string;
  authorId: string;
  author?: { id: string; firstName: string; lastName?: string };
  createdAt: string;
}

interface CrmFunnelStats {
  total: number;
  stages: {
    NEW: number;
    CONTACTABLE: number;
    CONTACTED: number;
    CONNECTED: number;
    FOLLOW_UP_SCHEDULED: number;
    ADMISSION_DONE: number;
    LOST: number;
  };
}

interface CrmLeadFilters {
  stage?: string;
  source?: string;
  assignedToId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useCrmLeads(filters?: CrmLeadFilters) {
  return useQuery({
    queryKey: ["crmLeads", filters],
    queryFn: () => get("/crm", filters),
    staleTime: 30 * 1000,
  });
}

export function useCrmLead(id: string) {
  return useQuery({
    queryKey: ["crmLead", id],
    queryFn: () => get(`/crm/${id}`),
    enabled: !!id,
  });
}

export function useCrmFunnel() {
  return useQuery({
    queryKey: ["crmFunnel"],
    queryFn: () => get("/crm/funnel"),
    staleTime: 30 * 1000,
  });
}

export interface AssignableUser {
  id: string;
  firstName: string;
  lastName?: string;
  designation?: string | null;
}

export function useCrmAssignableUsers() {
  return useQuery({
    queryKey: ["crmAssignableUsers"],
    queryFn: async (): Promise<AssignableUser[]> => {
      const [teachersRes, staffRes] = await Promise.all([
        get("/users/teachers"),
        get("/users/staff"),
      ]);
      const teachers = (teachersRes as any)?.data ?? [];
      const staff = (staffRes as any)?.data ?? [];
      return [...teachers, ...staff].map((u: any) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        designation: u.teacherProfile?.designation ?? u.staffProfile?.designation ?? null,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCrmLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; phone: string; source: string; category?: string; assignedToId?: string; remarks?: string }) =>
      post("/crm", { request: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crmLeads"] });
      queryClient.invalidateQueries({ queryKey: ["crmFunnel"] });
    },
  });
}

export function useUpdateCrmLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ stage: string; name: string; phone: string; category: string; assignedToId: string | null; nextFollowUpAt: string }> }) =>
      patch(`/crm/${id}`, { request: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crmLeads"] });
      queryClient.invalidateQueries({ queryKey: ["crmFunnel"] });
    },
  });
}

export function useAddCrmRemark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, content }: { leadId: string; content: string }) =>
      post(`/crm/${leadId}/remarks`, { request: { content } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crmLeads"] });
    },
  });
}

export function useDeleteCrmLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/crm/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crmLeads"] });
      queryClient.invalidateQueries({ queryKey: ["crmFunnel"] });
    },
  });
}

export type { CrmLead, LeadRemark, CrmFunnelStats, CrmLeadFilters };
