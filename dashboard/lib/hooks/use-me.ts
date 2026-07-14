"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, patch } from "@/lib/api/client";

export interface MeProfile {
  id: string;
  email: string;
  userType: string;
  firstName: string;
  lastName: string | null;
  contact: string;
  roleId: string;
  schoolId: string | null;
  role: { id: string; name: string; permissions?: string[] } | null;
  school?: { id: string; name: string; code: string } | null;
}

export type UpdateMePayload = Partial<{
  firstName: string;
  lastName: string | null;
  contact: string;
}>;

function fetchMe(): Promise<{ data: MeProfile }> {
  return get("/auth/me");
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetchMe();
      return res?.data ?? null;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { request: UpdateMePayload }) =>
      patch("/auth/me", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
