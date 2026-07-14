"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, put } from "@/lib/api/client";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  actionUrl: string | null;
  schoolId: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const NOTIFICATIONS_QUERY_KEY = ["notifications"];
const UNREAD_COUNT_QUERY_KEY = ["notifications", "unread-count"];

function fetchNotifications(params: {
  page?: number;
  limit?: number;
  isRead?: boolean | null;
  type?: string | null;
}): Promise<{ data: NotificationsResponse }> {
  return get("/communication/notifications", {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    ...(params.isRead !== undefined && params.isRead !== null && { isRead: String(params.isRead) }),
    ...(params.type && { type: params.type }),
  });
}

function fetchUnreadCount(): Promise<{ data: { count: number } }> {
  return get("/communication/notifications/unread-count");
}

export function useNotifications(params: {
  page?: number;
  limit?: number;
  isRead?: boolean | null;
  type?: string | null;
} = {}) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, params],
    queryFn: () => fetchNotifications(params),
    staleTime: 60 * 1000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: async () => {
      const res = await fetchUnreadCount();
      return res?.data?.count ?? 0;
    },
    staleTime: 30 * 1000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      put(`/communication/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => put("/communication/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
}
