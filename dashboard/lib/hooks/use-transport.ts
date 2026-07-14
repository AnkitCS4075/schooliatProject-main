"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

function fetchVehicles({ page = 1, limit = 15 }: { page?: number; limit?: number } = {}) {
  return get("/transports", { page, limit });
}

function fetchAllTransports() {
  return get("/transports");
}

function fetchVehicle(vehicleId: string) {
  return get(`/transports/${vehicleId}`);
}

function createVehicleApi(form: any) {
  const payload = {
    request: {
      type: "BUS",
      ownerFirstName: form.ownerfirstName?.trim() ?? "",
      ownerLastName: form.ownerlastName?.trim() ?? "",
      driverFirstName: form.driverfirstName?.trim() ?? "",
      driverLastName: form.driverlastName?.trim() ?? "",
      driverDateOfBirth: form.driverDateOfBirth || "",
      driverContact: form.driverContact?.trim() ?? "",
      driverGender: form.driverGender ?? "MALE",
      driverPhotoLink: form.driverPhotoId || null,
      conductorFirstName: form.conductorfirstName?.trim() ?? null,
      conductorLastName: form.conductorlastName?.trim() ?? null,
      conductorDateOfBirth: form.conductorDateOfBirth || "",
      conductorContact: form.conductorContact?.trim() ?? null,
      conductorGender: form.conductorGender ?? null,
      conductorPhotoLink: form.conductorPhotoId || null,
      licenseNumber: form.licenseNumber?.trim() ?? "",
      vehicleNumber: form.vehicleNumber?.trim() ?? null,
    },
  };
  return post("/transports", payload);
}

function updateVehicleApi(id: string, form: any) {
  const payload = {
    request: {
      type: "BUS",
      ownerFirstName: form.ownerfirstName?.trim(),
      ownerLastName: form.ownerlastName?.trim(),
      driverFirstName: form.driverfirstName?.trim(),
      driverLastName: form.driverlastName?.trim(),
      driverDateOfBirth: form.driverDateOfBirth || "",
      driverContact: form.driverContact?.trim(),
      driverGender: form.driverGender,
      driverPhotoLink: form.driverPhotoId || null,
      conductorFirstName: form.conductorfirstName?.trim() ?? null,
      conductorLastName: form.conductorlastName?.trim() ?? null,
      conductorDateOfBirth: form.conductorDateOfBirth || "",
      conductorContact: form.conductorContact?.trim() ?? null,
      conductorGender: form.conductorGender ?? null,
      conductorPhotoLink: form.conductorPhotoId || null,
      licenseNumber: form.licenseNumber?.trim(),
      vehicleNumber: form.vehicleNumber?.trim().toUpperCase() ?? null,
    },
  };
  return patch(`/transports/${id}`, payload);
}

function deleteVehicleApi(vehicleId: string, otp: string) {
  return del(`/transports/${vehicleId}`, { request: { otp } });
}

function bulkDeleteTransportsApi(transportIds: string[], otp: string) {
  return post("/transports/bulk-delete", { request: { transportIds, otp } });
}

export function useVehiclesPage(page: number, limit = 15) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["transports", page, limit],
    queryFn: () => fetchVehicles({ page, limit }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  // Prefetch next page
  if (!query.isPlaceholderData && query.data?.hasNext) {
    const nextPage = page + 1;
    queryClient.prefetchQuery({
      queryKey: ["transports", nextPage, limit],
      queryFn: () => fetchVehicles({ page: nextPage, limit }),
    });
  }

  return query;
}

export function useVehicle(vehicleId: string) {
  return useQuery({
    queryKey: ["transport", vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
    enabled: !!vehicleId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: any) => createVehicleApi(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transports"] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...form }: { id: string; [key: string]: any }) =>
      updateVehicleApi(id, form),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["transports"] });
      queryClient.invalidateQueries({ queryKey: ["transport", id] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteVehicleApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transports"] });
    },
  });
}

export function useBulkDeleteTransports() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transportIds, otp }: { transportIds: string[]; otp: string }) =>
      bulkDeleteTransportsApi(transportIds, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transports"] });
    },
  });
}

export function useTransports() {
  return useQuery({
    queryKey: ["transports", "all"],
    queryFn: fetchAllTransports,
    staleTime: 5 * 60 * 1000,
  });
}
