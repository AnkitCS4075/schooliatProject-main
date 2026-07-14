"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, patch } from "@/lib/api/client";

export interface MySchool {
  id: string;
  name: string;
  code: string;
  address: string[];
  email: string;
  phone: string;
  certificateLink?: string | null;
  logoId?: string | null;
  gstNumber?: string | null;
  principalName?: string | null;
  principalEmail?: string | null;
  principalPhone?: string | null;
  establishedYear?: number | null;
  boardAffiliation?: string | null;
  studentStrength?: number | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  bankBranchName?: string | null;
  upiId?: string | null;
  emergencyContacts?: string[] | null;
}

export type UpdateMySchoolPayload = Partial<{
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string[];
  certificateLink: string | null;
  gstNumber: string | null;
  principalName: string | null;
  principalEmail: string | null;
  principalPhone: string | null;
  establishedYear: number | null;
  boardAffiliation: string | null;
  studentStrength: number | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankIfscCode: string | null;
  bankBranchName: string | null;
  upiId: string | null;
  emergencyContacts: string[] | null;
}>;

function fetchMySchool(): Promise<{ data: MySchool | null }> {
  return get("/schools/my-school");
}

export function useMySchool() {
  return useQuery({
    queryKey: ["my-school"],
    queryFn: async () => {
      const res = await fetchMySchool();
      return res?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateMySchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { request: UpdateMySchoolPayload }) =>
      patch("/schools/my-school", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-school"] });
    },
  });
}
