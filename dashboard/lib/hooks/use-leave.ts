"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

// Fetch leave balance (optional calendar year — same contract as mobile GET /leave/balance?year=)
function fetchLeaveBalance(year?: number) {
  return get("/leave/balance", year != null ? { year } : undefined);
}

// Fetch leave history (optionally for a specific user - school admin can pass userId)
function fetchLeaveHistory(params: {
  userId?: string;
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  return get("/leave/history", params);
}

// Fetch leave types
function fetchLeaveTypes() {
  return get("/leave/types");
}

// Fetch leave calendar
function fetchLeaveCalendar(params: {
  startDate: string;
  endDate: string;
  userId?: string;
}) {
  return get("/leave/calendar", params);
}

// Create leave request
function createLeaveRequestApi(data: {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  return post("/leave/request", { request: data });
}

// Approve leave request (backend: POST /leave/approve, body.request.leaveRequestId)
function approveLeaveApi(leaveRequestId: string) {
  return post("/leave/approve", { request: { leaveRequestId } });
}

// Reject leave request (backend: POST /leave/reject, body.request.leaveRequestId, rejectionReason)
function rejectLeaveApi(leaveRequestId: string, data: { rejectionReason?: string }) {
  return post("/leave/reject", {
    request: { leaveRequestId, rejectionReason: data.rejectionReason ?? null },
  });
}

// Cancel leave request
function cancelLeaveApi(leaveRequestId: string) {
  return post(`/leave/${leaveRequestId}/cancel`);
}

// Hooks
export function useLeaveBalance(options?: { year?: number }) {
  const year = options?.year;
  return useQuery({
    queryKey: ["leave-balance", year ?? "current"],
    queryFn: () => fetchLeaveBalance(year),
    staleTime: 60 * 1000,
  });
}

/** One-shot fetch for CSV export (school-wide history with filters). */
export async function fetchLeaveHistoryExport(params: {
  status?: string;
  startDate?: string;
  endDate?: string;
  classId?: string;
  limit?: number;
}) {
  return get("/leave/history", {
    userId: "all",
    page: 1,
    limit: params.limit ?? 5000,
    ...(params.status ? { status: params.status } : {}),
    ...(params.startDate ? { startDate: params.startDate } : {}),
    ...(params.endDate ? { endDate: params.endDate } : {}),
    ...(params.classId ? { classId: params.classId } : {}),
  });
}

export function useLeaveHistory(params: {
  userId?: string;
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  return useQuery({
    queryKey: ["leave-history", params],
    queryFn: () => fetchLeaveHistory(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetches all pending leave requests for the school by using the updated global endpoint.
 */
async function fetchPendingLeaveRequestsForApproval(classId: string | null): Promise<any[]> {
  const query: Record<string, string> = { userId: "all", status: "PENDING", limit: "200" };
  if (classId) query.classId = classId;
  const res = await get("/leave/history", query);
  const allLeaves = res?.data ?? [];
  allLeaves.sort(
    (a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  return allLeaves;
}

export function usePendingLeaveRequestsForApproval(classId: string | null = null) {
  return useQuery({
    queryKey: ["leave-pending-approvals", classId],
    queryFn: () => fetchPendingLeaveRequestsForApproval(classId),
    staleTime: 30 * 1000,
  });
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: ["leave-types"],
    queryFn: () => fetchLeaveTypes(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; maxLeaves?: number | null }) =>
      post("/leave/types", { request: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
    },
  });
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; maxLeaves?: number | null | "" } }) =>
      patch(`/leave/types/${id}`, { request: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
    },
  });
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) =>
      del(`/leave/types/${id}`, { request: { otp } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
    },
  });
}

export function useLeaveCalendar(params: {
  startDate: string;
  endDate: string;
  userId?: string;
}) {
  return useQuery({
    queryKey: ["leave-calendar", params],
    queryFn: () => fetchLeaveCalendar(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 60 * 1000,
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason: string;
    }) => createLeaveRequestApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
      queryClient.invalidateQueries({ queryKey: ["leave-history"] });
      queryClient.invalidateQueries({ queryKey: ["leave-calendar"] });
      /** New pending requests should appear on Approvals without a manual refresh. */
      queryClient.invalidateQueries({ queryKey: ["leave-pending-approvals"] });
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leaveRequestId: string) => approveLeaveApi(leaveRequestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
      queryClient.invalidateQueries({ queryKey: ["leave-history"] });
      queryClient.invalidateQueries({ queryKey: ["leave-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["leave-pending-approvals"] });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leaveRequestId, rejectionReason }: { leaveRequestId: string; rejectionReason?: string }) =>
      rejectLeaveApi(leaveRequestId, { rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
      queryClient.invalidateQueries({ queryKey: ["leave-history"] });
      queryClient.invalidateQueries({ queryKey: ["leave-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["leave-pending-approvals"] });
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leaveRequestId: string) => cancelLeaveApi(leaveRequestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
      queryClient.invalidateQueries({ queryKey: ["leave-history"] });
      queryClient.invalidateQueries({ queryKey: ["leave-calendar"] });
    },
  });
}

