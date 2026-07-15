"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";

export function usePendingGalleryApprovals() {
  return useQuery({
    queryKey: ["galleryPendingApprovals"],
    queryFn: () => get("/gallery/pending-approvals"),
    staleTime: 30_000,
  });
}

export function useApproveGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => post(`/gallery/${id}/approve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["galleryPendingApprovals"] });
      qc.invalidateQueries({ queryKey: ["galleries"] });
    },
  });
}

export function useRejectGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      post(`/gallery/${id}/reject`, { request: { reason } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["galleryPendingApprovals"] });
      qc.invalidateQueries({ queryKey: ["galleries"] });
    },
  });
}

export function usePendingEventApprovals() {
  return useQuery({
    queryKey: ["eventPendingApprovals"],
    queryFn: () => get("/calendar/events/pending-approvals"),
    staleTime: 30_000,
  });
}

export function useApproveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => post(`/calendar/events/${id}/approve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eventPendingApprovals"] });
      qc.invalidateQueries({ queryKey: ["calendarEvents"] });
    },
  });
}

export function useRejectEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      post(`/calendar/events/${id}/reject`, { request: { reason } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eventPendingApprovals"] });
      qc.invalidateQueries({ queryKey: ["calendarEvents"] });
    },
  });
}
