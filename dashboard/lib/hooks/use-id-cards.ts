"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";

function fetchIdCardsStatus() {
  return get("/id-cards/status");
}

function generateClassIdCardsApi(classId: string) {
  return post(`/id-cards/classes/${classId}/generate`);
}

function fetchIdCardConfig() {
  return get("/id-cards/config");
}

function saveIdCardConfigApi(data: { templateId: string; config: any }) {
  return post("/id-cards/config", { request: data });
}

export interface IdCardStatus {
  id: string;
  grade: string;
  division?: string;
  status: "Generated" | "Not generated";
  generatedOn?: string;
  collectionId?: string;
  fileUrl?: string;
  idCardCollection?: {
    id: string;
    status: string;
    fileUrl?: string;
    generatedAt?: string;
  } | null;
}

export interface IdCardsStatusResponse {
  message: string;
  data: IdCardStatus[];
}

export function useIdCardsStatus() {
  return useQuery<IdCardsStatusResponse>({
    queryKey: ["id-cards", "status"],
    queryFn: fetchIdCardsStatus,
    staleTime: 30 * 1000,
  });
}

export function useGenerateClassIdCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: string) => generateClassIdCardsApi(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["id-cards"] });
    },
  });
}

export { useTemplates } from "./use-templates";

export function useSaveIdCardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { templateId: string; config: any }) =>
      saveIdCardConfigApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["id-cards"] });
      queryClient.invalidateQueries({ queryKey: ["id-cards", "config"] });
    },
  });
}

export function useIdCardConfig() {
  return useQuery({
    queryKey: ["id-cards", "config"],
    queryFn: fetchIdCardConfig,
    staleTime: 30 * 1000,
  });
}

