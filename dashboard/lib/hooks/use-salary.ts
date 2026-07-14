"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";

function fetchSalaryPayments(month?: string) {
  const params: any = {};
  if (month) params.month = month;
  return get("/salary-payments", params);
}

function generateSalaryPayments(month: string) {
  return post("/salary-payments/generate", {
    request: { month },
  });
}

function fetchSalaryStructures() {
  return get("/salary-structures");
}

function fetchSalaryAssignments() {
  return get("/salaries");
}

export function useSalaryPayments(month?: string) {
  return useQuery({
    queryKey: ["salary-payments", month],
    queryFn: () => fetchSalaryPayments(month),
    staleTime: 60 * 1000,
  });
}

export function useGenerateSalaryPayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (month: string) => generateSalaryPayments(month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-payments"] });
    },
  });
}

export function useSalaryStructures() {
  return useQuery({
    queryKey: ["salary-structures"],
    queryFn: fetchSalaryStructures,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSalaryAssignments() {
  return useQuery({
    queryKey: ["salary-assignments"],
    queryFn: fetchSalaryAssignments,
    staleTime: 5 * 60 * 1000,
  });
}

