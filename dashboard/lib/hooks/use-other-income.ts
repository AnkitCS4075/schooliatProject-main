"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";

export interface OtherIncomeFilters {
  page?: number;
  limit?: number;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

function buildQuery(filters: OtherIncomeFilters): string {
  const p = new URLSearchParams();
  if (filters.page) p.set("page", String(filters.page));
  if (filters.limit) p.set("limit", String(filters.limit));
  if (filters.category) p.set("category", filters.category);
  if (filters.dateFrom) p.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) p.set("dateTo", filters.dateTo);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

function fetchOtherIncomes(filters: OtherIncomeFilters) {
  return get(`/other-incomes${buildQuery(filters)}`);
}

function fetchOtherIncomeSummary(dateFrom?: string, dateTo?: string) {
  const p = new URLSearchParams();
  if (dateFrom) p.set("dateFrom", dateFrom);
  if (dateTo) p.set("dateTo", dateTo);
  const qs = p.toString();
  return get(`/other-incomes/summary${qs ? `?${qs}` : ""}`);
}

function createOtherIncome(data: any) {
  return post("/other-incomes", { request: data });
}

function updateOtherIncome(id: string, data: any) {
  return patch(`/other-incomes/${id}`, { request: data });
}

function deleteOtherIncome(id: string) {
  return del(`/other-incomes/${id}`);
}

export function useOtherIncomes(filters: OtherIncomeFilters = {}) {
  return useQuery({
    queryKey: ["other-incomes", filters],
    queryFn: () => fetchOtherIncomes(filters),
    staleTime: 30 * 1000,
  });
}

export function useOtherIncomeSummary(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ["other-incomes", "summary", dateFrom, dateTo],
    queryFn: () => fetchOtherIncomeSummary(dateFrom, dateTo),
    staleTime: 30 * 1000,
  });
}

export function useCreateOtherIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOtherIncome,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["other-incomes"] });
    },
  });
}

export function useUpdateOtherIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) => updateOtherIncome(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["other-incomes"] });
    },
  });
}

export function useDeleteOtherIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOtherIncome,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["other-incomes"] });
    },
  });
}
