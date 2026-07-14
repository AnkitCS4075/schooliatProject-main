"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

// Fetch circulars
function fetchCirculars(params: {
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  return get("/circulars", params);
}

// Fetch single circular
function fetchCircularById(circularId: string) {
  return get(`/circulars/${circularId}`);
}

// Create circular
function createCircularApi(data: {
  title: string;
  content: string;
  targetAudience: string[];
  attachments?: string[];
  scheduledPublishDate?: string;
}) {
  return post("/circulars", { request: data });
}

// Update circular
function updateCircularApi(circularId: string, data: {
  title?: string;
  content?: string;
  targetAudience?: string[];
  attachments?: string[];
  scheduledPublishDate?: string;
}) {
  return put(`/circulars/${circularId}`, { request: data });
}

// Publish circular
function publishCircularApi(circularId: string) {
  return post(`/circulars/${circularId}/publish`);
}

// Delete circular
function deleteCircularApi(circularId: string, otp: string) {
  return del(`/circulars/${circularId}`, { request: { otp } });
}

// Hooks
export function useCirculars(params: {
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ["circulars", params],
    queryFn: () => fetchCirculars(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useCircularById(circularId: string) {
  return useQuery({
    queryKey: ["circular", circularId],
    queryFn: () => fetchCircularById(circularId),
    enabled: !!circularId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCircular() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      targetAudience: string[];
      attachments?: string[];
      scheduledPublishDate?: string;
    }) => createCircularApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulars"] });
    },
  });
}

export function useUpdateCircular() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      updateCircularApi(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["circulars"] });
      queryClient.invalidateQueries({ queryKey: ["circular", id] });
    },
  });
}

export function usePublishCircular() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (circularId: string) => publishCircularApi(circularId),
    onSuccess: (_data, circularId) => {
      queryClient.invalidateQueries({ queryKey: ["circulars"] });
      queryClient.invalidateQueries({ queryKey: ["circular", circularId] });
    },
  });
}

export function useDeleteCircular() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteCircularApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulars"] });
    },
  });
}

