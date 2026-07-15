"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api/client";

export interface FeeDiscount {
  id: string;
  schoolId: string;
  name: string;
  description?: string;
  type: string;
  value: number;
  isPercentage: boolean;
  classId?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  _count?: { applications: number };
}

export interface FeeDiscountApplication {
  id: string;
  discountId: string;
  studentId: string;
  installmentId?: string;
  amount: number;
  reason?: string;
  appliedBy: string;
  appliedAt: string;
}

export interface LateFeeRule {
  id: string;
  schoolId: string;
  name: string;
  description?: string;
  calculationType: string;
  fixedAmount?: number;
  percentage?: number;
  amountPerDay?: number;
  gracePeriodDays: number;
  maxLateFee?: number;
  isActive: boolean;
}

export interface DiscountStats {
  totalDiscounts: number;
  activeDiscounts: number;
  totalApplications: number;
  totalDiscountAmount: number;
}

// ─── Discount Hooks ─────────────────────────────────────────────────────

export function useDiscounts(params?: { page?: number; limit?: number; isActive?: boolean; type?: string; classId?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.type) query.set("type", params.type);
  if (params?.classId) query.set("classId", params.classId);
  const qs = query.toString();
  return useQuery({
    queryKey: ["feeDiscounts", params],
    queryFn: () => get(`/fee-management/discounts${qs ? "?" + qs : ""}`),
    staleTime: 30_000,
  });
}

export function useDiscount(id: string) {
  return useQuery({
    queryKey: ["feeDiscount", id],
    queryFn: () => get(`/fee-management/discounts/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useDiscountStats() {
  return useQuery({
    queryKey: ["feeDiscountStats"],
    queryFn: () => get("/fee-management/discounts/stats"),
    staleTime: 30_000,
  });
}

export function useCreateDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; type: string; value: number; isPercentage?: boolean; classId?: string }) =>
      post("/fee-management/discounts", { request: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feeDiscounts"] });
      qc.invalidateQueries({ queryKey: ["feeDiscountStats"] });
    },
  });
}

export function useUpdateDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string; type?: string; value?: number; isPercentage?: boolean; classId?: string; isActive?: boolean }) =>
      put(`/fee-management/discounts/${id}`, { request: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feeDiscounts"] });
      qc.invalidateQueries({ queryKey: ["feeDiscountStats"] });
    },
  });
}

export function useDeleteDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/fee-management/discounts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feeDiscounts"] });
      qc.invalidateQueries({ queryKey: ["feeDiscountStats"] });
    },
  });
}

export function useApplyDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { discountId: string; studentId: string; installmentId: string; reason?: string }) =>
      post("/fee-management/discounts/apply", { request: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feeDiscounts"] });
      qc.invalidateQueries({ queryKey: ["feeDiscountStats"] });
    },
  });
}

// ─── Late Fee Rule Hooks ────────────────────────────────────────────────

export function useLateFeeRule() {
  return useQuery({
    queryKey: ["lateFeeRule"],
    queryFn: () => get("/fee-management/late-fee-rules"),
    staleTime: 30_000,
  });
}

export function useSaveLateFeeRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      calculationType: string;
      fixedAmount?: number;
      percentage?: number;
      amountPerDay?: number;
      gracePeriodDays?: number;
      maxLateFee?: number;
      isActive?: boolean;
    }) => post("/fee-management/late-fee-rules", { request: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lateFeeRule"] });
    },
  });
}

export function useCalculateLateFees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => post("/fee-management/late-fee-rules/calculate", {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lateFeeRule"] });
    },
  });
}
