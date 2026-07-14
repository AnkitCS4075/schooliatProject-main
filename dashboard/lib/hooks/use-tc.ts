"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, patch } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

// Create TC
function createTC(data: {
  studentId: string;
  reason: string;
  transferDate: string;
  destinationSchool?: string;
  remarks?: string;
}) {
  return post("/transfer-certificates", { request: data });
}

function fetchTCs(params: {
  studentId?: string;
  status?: "ISSUED" | "COLLECTED" | "CANCELLED";
  tcNumber?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  return get("/transfer-certificates", params);
}

// Get TC by ID
function fetchTCById(tcId: string) {
  return get(`/transfer-certificates/${tcId}`);
}

// Update TC status
function updateTCStatus(tcId: string, data: { status: "ISSUED" | "COLLECTED" | "CANCELLED" }) {
  return patch(`/transfer-certificates/${tcId}/status`, { request: data });
}

// Hooks
export function useTCs(params: {
  studentId?: string;
  status?: "ISSUED" | "COLLECTED" | "CANCELLED";
  tcNumber?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ["transfer-certificates", params],
    queryFn: () => fetchTCs(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useTCById(tcId: string) {
  return useQuery({
    queryKey: ["transfer-certificate", tcId],
    queryFn: () => fetchTCById(tcId),
    enabled: !!tcId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      studentId: string;
      reason: string;
      transferDate: string;
      destinationSchool?: string;
      remarks?: string;
    }) => createTC(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfer-certificates"] });
    },
  });
}

export function useUpdateTCStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status: "ISSUED" | "COLLECTED" | "CANCELLED" }) =>
      updateTCStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfer-certificates"] });
    },
  });
}

