"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";

export function usePendingApprovals() {
  return useQuery({
    queryKey: ["approvalsPending"],
    queryFn: () => get("/approvals/pending"),
    staleTime: 30_000,
  });
}

export function useApprovalHistory(options?: { status?: string; module?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["approvalsHistory", options?.status ?? "all", options?.module ?? "all", options?.page ?? 1],
    queryFn: () =>
      get("/approvals/history", {
        status: options?.status || undefined,
        module: options?.module || undefined,
        page: options?.page || 1,
        limit: options?.limit || 20,
      }),
    staleTime: 30_000,
  });
}

export function useDecideApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, remarks }: { id: string; action: "APPROVE" | "REJECT"; remarks?: string }) =>
      post(`/approvals/${id}/decide`, { request: { action, remarks } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvalsPending"] });
      qc.invalidateQueries({ queryKey: ["approvalsHistory"] });
      qc.invalidateQueries({ queryKey: ["calendarEvents"] });
      qc.invalidateQueries({ queryKey: ["galleries"] });
      qc.invalidateQueries({ queryKey: ["leaveRequests"] });
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["transferCertificates"] });
    },
  });
}
