"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

function fetchNotices({ page = 1, limit = 15 }: { page?: number; limit?: number } = {}) {
  return get("/calendar/notices", { page, limit });
}

function fetchNotice(noticeId: string) {
  return get(`/calendar/notices/${noticeId}`);
}

function createNoticeApi(form: any) {
  const payload = {
    request: {
      title: form.title?.trim(),
      content: form.content?.trim(),
      visibleFrom: form.visibleFrom,
      visibleTill: form.visibleTill,
    },
  };
  return post("/calendar/notices", payload);
}

function updateNoticeApi(noticeId: string, form: any) {
  const payload = {
    request: {
      title: form.title?.trim(),
      content: form.content?.trim(),
      visibleFrom: form.visibleFrom,
      visibleTill: form.visibleTill,
    },
  };
  return patch(`/calendar/notices/${noticeId}`, payload);
}

function deleteNoticeApi(noticeId: string, otp: string) {
  return del(`/calendar/notices/${noticeId}`, { request: { otp } });
}

function bulkDeleteNoticesApi(noticeIds: string[], otp: string) {
  return post("/calendar/notices/bulk-delete", {
    request: { noticeIds, otp },
  });
}

export function useNoticesPage(page: number, limit = 15) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notices", page, limit],
    queryFn: () => fetchNotices({ page, limit }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  // Prefetch next page
  if (!query.isPlaceholderData && query.data?.hasNext) {
    const nextPage = page + 1;
    queryClient.prefetchQuery({
      queryKey: ["notices", nextPage, limit],
      queryFn: () => fetchNotices({ page: nextPage, limit }),
    });
  }

  return query;
}

export function useNotice(noticeId: string) {
  return useQuery({
    queryKey: ["notice", noticeId],
    queryFn: () => fetchNotice(noticeId),
    enabled: !!noticeId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: any) => createNoticeApi(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...formData }: { id: string; [key: string]: any }) =>
      updateNoticeApi(id, formData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notice", variables.id] });
    },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteNoticeApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
}

export function useBulkDeleteNotices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noticeIds, otp }: { noticeIds: string[]; otp: string }) =>
      bulkDeleteNoticesApi(noticeIds, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
}

