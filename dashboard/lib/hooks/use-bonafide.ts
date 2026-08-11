"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";

interface BonafideCertificate {
  id: string;
  studentId: string;
  purpose: string;
  certificateNumber: string;
  isDuplicate: boolean;
  issueDate: string;
  createdAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName?: string;
    publicUserId?: string;
    studentProfile?: {
      rollNumber?: number;
      class?: { grade: string; division?: string | null };
    };
  };
  creator?: { id: string; firstName: string; lastName?: string };
  file?: { id: string; extension?: string };
}

interface BonafideFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  purpose?: string;
  isDuplicate?: string;
}

interface BonafideRequest {
  studentId: string;
  purpose: string;
  isDuplicate?: boolean;
}

export interface BonafidePreviewData {
  html: string;
  certificateNumber: string;
}

function getAccessToken(): string {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem("accessToken") || "";
}

function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-platform": "web",
    Authorization: `Bearer ${getAccessToken()}`,
  };
}

async function downloadBonafide(path: string): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(`/api/v1${path}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to download certificate");
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");
  const filename = disposition?.match(/filename="(.+?)"/)?.[1] || "bonafide.pdf";
  return { blob, filename };
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useBonafideCertificates(filters?: BonafideFilters) {
  return useQuery({
    queryKey: ["bonafideCertificates", filters],
    queryFn: () => get("/bonafide", filters),
    staleTime: 30 * 1000,
  });
}

export function useGenerateBonafide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: BonafideRequest) => {
      const response = await fetch("/api/v1/bonafide/generate", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ request: req }),
      });
      if (!response.ok) throw new Error("Failed to generate certificate");
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filename = disposition?.match(/filename="(.+?)"/)?.[1] || "bonafide.pdf";
      return { blob, filename };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonafideCertificates"] });
    },
  });
}

export function useBonafidePreview() {
  return useMutation({
    mutationFn: async (req: BonafideRequest): Promise<BonafidePreviewData> => {
      const res = await post("/bonafide/preview", { request: req });
      return res?.data as BonafidePreviewData;
    },
  });
}

export function useDownloadBonafide() {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) =>
      downloadBonafide(`/bonafide/${id}/pdf`),
  });
}

export type { BonafideCertificate, BonafideFilters, BonafideRequest };
