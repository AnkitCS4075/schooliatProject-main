"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";

function fetchEmergencyContacts(studentId: string) {
  return get(`/emergency-contacts/student/${studentId}`);
}

export function useEmergencyContacts(studentId: string) {
  return useQuery({
    queryKey: ["emergency-contacts", studentId],
    queryFn: () => fetchEmergencyContacts(studentId),
    enabled: !!studentId,
    staleTime: 60 * 1000,
  });
}
