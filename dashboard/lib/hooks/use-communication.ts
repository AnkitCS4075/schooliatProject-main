"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";

export interface Conversation {
  id: string;
  participants: string[];
  type: "DIRECT" | "GROUP" | "CLASS" | "SCHOOL";
  title?: string;
  lastMessage?: {
    content: string;
    senderFirstName?: string;
    senderLastName?: string;
    sentAt: string;
  };
  unreadCount: number;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderFirstName?: string;
  senderLastName?: string;
  content: string;
  attachments: string[];
  readBy: string[];
  sentAt: string;
}

function fetchConversations() {
  return get("/communication/conversations");
}

function fetchMessages(conversationId: string, page = 1, limit = 50) {
  return get(`/communication/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
}

function sendMessage(data: { conversationId: string; content: string; attachments?: string[] }) {
  return post("/communication/messages", { request: data });
}

function createConversation(data: {
  participants: string[];
  type: string;
  title?: string;
}) {
  return post("/communication/conversations", { request: data });
}

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 30 * 1000,
  });
}

export function useMessages(conversationId: string, page = 1) {
  return useQuery({
    queryKey: ["messages", conversationId, page],
    queryFn: () => fetchMessages(conversationId, page),
    enabled: !!conversationId,
    staleTime: 10 * 1000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
