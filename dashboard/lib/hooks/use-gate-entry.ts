"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";

interface GateEntry {
  id: string;
  serialNo: number;
  category: string;
  name: string;
  phone: string;
  reason?: string;
  classInterestedIn?: string;
  personToMeet?: string;
  photoFileId?: string;
  inTime: string;
  outTime?: string;
  linkedLeadId?: string;
  schoolId?: string;
  school?: { id: string; name: string; code: string };
  linkedLead?: { id: string; name: string; stage: string; followUpStatus: string; source: string };
  creator?: { id: string; firstName: string; lastName?: string };
  createdAt: string;
}

interface GateEntryStats {
  totalToday: number;
  byCategory: { category: string; _count: number }[];
  currentlyInside: number;
  crmLeadsToday: number;
}

interface GateEntryListResponse {
  data: GateEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GateEntryFilters {
  schoolId?: string;
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export function useGateEntries(filters?: GateEntryFilters) {
  return useQuery({
    queryKey: ["gateEntries", filters],
    queryFn: () => get("/gate-entries", filters),
    staleTime: 30 * 1000,
  });
}

export function useGateEntryStats() {
  return useQuery({
    queryKey: ["gateEntryStats"],
    queryFn: () => get("/gate-entries/stats"),
    staleTime: 30 * 1000,
  });
}

export function useGateEntry(id: string) {
  return useQuery({
    queryKey: ["gateEntry", id],
    queryFn: () => get(`/gate-entries/${id}`),
    enabled: !!id,
  });
}

export function useCreateGateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { schoolId?: string; category: string; name: string; phone: string; reason?: string; classInterestedIn?: string; personToMeet?: string }) =>
      post("/gate-entries", { request: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateEntries"] });
      queryClient.invalidateQueries({ queryKey: ["gateEntryStats"] });
    },
  });
}

export function useUpdateGateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { outTime?: string; reason?: string; personToMeet?: string } }) =>
      patch(`/gate-entries/${id}`, { request: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateEntries"] });
      queryClient.invalidateQueries({ queryKey: ["gateEntryStats"] });
    },
  });
}

export function useDeleteGateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/gate-entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateEntries"] });
      queryClient.invalidateQueries({ queryKey: ["gateEntryStats"] });
    },
  });
}

export interface GateCrmConversionReport {
  totalEntries: number;
  totalLeads: number;
  overallConversionRate: number;
  status: { PENDING: number; INTERESTED: number; NOT_INTERESTED: number; CONVERTED: number; LOST: number };
  schools: {
    schoolId: string;
    schoolName: string;
    schoolCode?: string;
    entries: number;
    leads: number;
    conversionRate: number;
    status: { PENDING: number; INTERESTED: number; NOT_INTERESTED: number; CONVERTED: number; LOST: number };
  }[];
  daily: { date: string; entries: number; leads: number }[];
}

export function useGateCrmConversionReport(filters?: { schoolId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["gateCrmConversionReport", filters],
    queryFn: () => get("/gate-entries/report/conversion", filters),
    staleTime: 60 * 1000,
  });
}

export type { GateEntry, GateEntryStats, GateEntryListResponse, GateEntryFilters };
