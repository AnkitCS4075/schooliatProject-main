"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";

export type CourierApiStatus =
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "RETURNED";

export interface SchoolCourierRow {
  id: string;
  schoolId: string;
  trackingNumber: string;
  provider: string;
  recipient: string;
  destination: string;
  contents: string;
  status: CourierApiStatus;
  dispatchDate: string;
  deliveryDate: string | null;
  createdAt: string;
}

export interface CouriersListResponse {
  message?: string;
  data: SchoolCourierRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  aggregates: {
    total: number;
    byStatus: Record<CourierApiStatus, number>;
  };
}

export interface CourierListFilters {
  status?: CourierApiStatus;
  search?: string;
  page?: number;
  limit?: number;
}

function fetchCouriers(filters: CourierListFilters) {
  return get("/couriers", filters) as Promise<CouriersListResponse>;
}

export function useCouriers(filters: CourierListFilters = {}) {
  return useQuery({
    queryKey: ["couriers", filters],
    queryFn: () => fetchCouriers(filters),
    staleTime: 15 * 1000,
  });
}

export function useCreateCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      trackingNumber: string;
      provider: string;
      recipient: string;
      destination: string;
      contents?: string;
      status?: CourierApiStatus;
      dispatchDate?: string;
    }) => post("/couriers", { request: body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["couriers"] });
    },
  });
}

export function useUpdateCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      trackingNumber?: string;
      provider?: string;
      recipient?: string;
      destination?: string;
      contents?: string;
      status?: CourierApiStatus;
      dispatchDate?: string;
    }) => patch(`/couriers/${id}`, { request: body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["couriers"] });
    },
  });
}

export function useDeleteCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) =>
      del(`/couriers/${id}`, { request: { otp } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["couriers"] });
    },
  });
}
