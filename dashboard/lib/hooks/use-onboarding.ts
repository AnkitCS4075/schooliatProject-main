"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, del } from "@/lib/api/client";

function fetchOnboardings(params: { status?: string; search?: string; page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  return get(`/school-onboardings?${qs.toString()}`);
}

function fetchOnboarding(id: string) {
  return get(`/school-onboardings/${id}`);
}

function createOnboarding(data: any) {
  return post("/school-onboardings", { request: data });
}

function generateContract(id: string) {
  return post(`/school-onboardings/${id}/generate-contract`, {});
}

function confirmContract(id: string) {
  return post(`/school-onboardings/${id}/confirm`, {});
}

function activateOnboarding(id: string) {
  return post(`/school-onboardings/${id}/activate`, {});
}

function fetchContractHtml(id: string) {
  return get(`/school-onboardings/${id}/contract`);
}

function completeOnboarding(id: string) {
  return post(`/school-onboardings/${id}/complete`, {});
}

function cancelOnboarding(id: string) {
  return post(`/school-onboardings/${id}/cancel`, {});
}

function deleteOnboarding(id: string) {
  return del(`/school-onboardings/${id}`);
}

function fetchOnboardingStats() {
  return get("/school-onboardings/stats");
}

export function useOnboardings(params: { status?: string; search?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["onboardings", params],
    queryFn: () => fetchOnboardings(params),
    staleTime: 30 * 1000,
  });
}

export function useOnboarding(id: string) {
  return useQuery({
    queryKey: ["onboardings", id],
    queryFn: () => fetchOnboarding(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOnboarding,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["onboardings"] }),
  });
}

export function useGenerateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: generateContract,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["onboardings"] });
      qc.invalidateQueries({ queryKey: ["onboardings", id] });
    },
  });
}

export function useConfirmContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: confirmContract,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["onboardings"] });
      qc.invalidateQueries({ queryKey: ["onboardings", id] });
    },
  });
}

export function useActivateOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: activateOnboarding,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["onboardings"] });
      qc.invalidateQueries({ queryKey: ["onboardings", id] });
      qc.invalidateQueries({ queryKey: ["schools"] });
    },
  });
}

export function useContractHtml(id: string) {
  return useQuery({
    queryKey: ["onboardings", id, "contract"],
    queryFn: () => fetchContractHtml(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompleteOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["onboardings"] });
      qc.invalidateQueries({ queryKey: ["onboardings", id] });
    },
  });
}

export function useCancelOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelOnboarding,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["onboardings"] });
      qc.invalidateQueries({ queryKey: ["onboardings", id] });
    },
  });
}

export function useDeleteOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOnboarding,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["onboardings"] }),
  });
}

export function useOnboardingStats() {
  return useQuery({
    queryKey: ["onboardings", "stats"],
    queryFn: fetchOnboardingStats,
    staleTime: 30 * 1000,
  });
}
