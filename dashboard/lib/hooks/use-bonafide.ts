"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";

interface BonafideCertificate {
  id: string;
  studentId: string;
  purpose: string;
  certificateNumber: string;
  issueDate: string;
  student?: { id: string; firstName: string; lastName?: string; publicUserId?: string };
  creator?: { id: string; firstName: string; lastName?: string };
  createdAt: string;
}

interface BonafideFilters {
  page?: number;
  limit?: number;
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
    mutationFn: async ({ studentId, purpose }: { studentId: string; purpose: string }) => {
      const response = await fetch("/api/v1/bonafide/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify({ request: { studentId, purpose } }),
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

export type { BonafideCertificate, BonafideFilters };
