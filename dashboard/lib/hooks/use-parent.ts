"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";

// Fetch children
function fetchChildren() {
  return get("/parent/children");
}

// Fetch child data
function fetchChildData(childId: string) {
  return get(`/parent/children/${childId}`);
}

// Fetch consolidated dashboard
function fetchParentDashboard() {
  return get("/parent/dashboard");
}

// Fetch children attendance
function fetchChildrenAttendance(params: {
  startDate?: string;
  endDate?: string;
}) {
  return get("/parent/children/attendance", params);
}

// Fetch children fees
function fetchChildrenFees() {
  return get("/parent/children/fees");
}

// Link child to parent
function linkChildApi(childId: string, data: {
  relationship: string;
  isPrimary?: boolean;
}) {
  return post(`/parent/children/${childId}/link`, { request: data });
}

// Hooks
export function useChildren() {
  return useQuery({
    queryKey: ["parent-children"],
    queryFn: () => fetchChildren(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useChildData(childId: string) {
  return useQuery({
    queryKey: ["parent-child", childId],
    queryFn: () => fetchChildData(childId),
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useParentDashboard() {
  return useQuery({
    queryKey: ["parent-dashboard"],
    queryFn: () => fetchParentDashboard(),
    staleTime: 60 * 1000,
  });
}

export function useChildrenAttendance(params: {
  startDate?: string;
  endDate?: string;
} = {}) {
  return useQuery({
    queryKey: ["parent-children-attendance", params],
    queryFn: () => fetchChildrenAttendance(params),
    staleTime: 60 * 1000,
  });
}

export function useChildrenFees() {
  return useQuery({
    queryKey: ["parent-children-fees"],
    queryFn: () => fetchChildrenFees(),
    staleTime: 60 * 1000,
  });
}

export function useLinkChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ childId, ...data }: { childId: string; relationship: string; isPrimary?: boolean }) =>
      linkChildApi(childId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-children"] });
      queryClient.invalidateQueries({ queryKey: ["parent-dashboard"] });
    },
  });
}

