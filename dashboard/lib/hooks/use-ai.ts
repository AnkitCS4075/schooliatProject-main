"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api/client";

// Send chat message
function sendChatMessage(data: { query: string }) {
  return post("/ai/chat", { request: data });
}

// Get conversation history
function fetchConversations(params: { page?: number; limit?: number } = {}) {
  return get("/ai/conversations", params);
}

// Get conversation by ID
function fetchConversationById(conversationId: string) {
  return get(`/ai/conversations/${conversationId}`);
}

// Get FAQs
function fetchFAQs(params: { category?: string; search?: string; page?: number; limit?: number } = {}) {
  return get("/ai/faqs", params);
}

// Create FAQ
function createFAQ(data: {
  question: string;
  answer: string;
  category?: string;
  keywords?: string[];
}) {
  return post("/ai/faqs", { request: data });
}

// Update FAQ
function updateFAQ(faqId: string, data: {
  question?: string;
  answer?: string;
  category?: string;
  keywords?: string[];
  isActive?: boolean;
}) {
  return put(`/ai/faqs/${faqId}`, { request: data });
}

// Delete FAQ
function deleteFAQ(faqId: string, otp: string) {
  return del(`/ai/faqs/${faqId}`, { request: { otp } });
}

// Hooks
export function useChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { query: string }) => sendChatMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
    },
  });
}

// Shape matching API response so chatbot does not break when user has no chatbot permission (403)
const emptyConversationsResult = {
  data: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

export function useConversations(
  params: { page?: number; limit?: number } = {},
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: ["ai", "conversations", params],
    queryFn: async () => {
      try {
        return await fetchConversations(params);
      } catch (err: unknown) {
        // 403 when role lacks GET_CHATBOT_HISTORY - return empty so layout/chatbot does not break
        const status = (err as { status?: number })?.status;
        if (status === 403) return emptyConversationsResult;
        throw err;
      }
    },
    staleTime: 30 * 1000,
    enabled,
    ...options,
  });
}

export function useConversationById(conversationId: string) {
  return useQuery({
    queryKey: ["ai", "conversation", conversationId],
    queryFn: () => fetchConversationById(conversationId),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFAQs(params: { category?: string; search?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["ai", "faqs", params],
    queryFn: () => fetchFAQs(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      question: string;
      answer: string;
      category?: string;
      keywords?: string[];
    }) => createFAQ(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai", "faqs"] });
    },
  });
}

export function useUpdateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      updateFAQ(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai", "faqs"] });
    },
  });
}

export function useDeleteFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteFAQ(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai", "faqs"] });
    },
  });
}

