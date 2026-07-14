"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";

// Create emergency contact
function createEmergencyContact(data: {
  studentId: string;
  name: string;
  relationship: "FATHER" | "MOTHER" | "GUARDIAN" | "RELATIVE" | "OTHER";
  contact: string;
  alternateContact?: string;
  address?: string;
  isPrimary?: boolean;
}) {
  return post("/emergency-contacts", { request: data });
}

// Get emergency contacts for a student
function fetchEmergencyContacts(studentId: string) {
  return get(`/emergency-contacts/student/${studentId}`);
}

// Get emergency contact by ID
function fetchEmergencyContactById(contactId: string) {
  return get(`/emergency-contacts/${contactId}`);
}

// Update emergency contact
function updateEmergencyContact(contactId: string, data: {
  name?: string;
  relationship?: "FATHER" | "MOTHER" | "GUARDIAN" | "RELATIVE" | "OTHER";
  contact?: string;
  alternateContact?: string;
  address?: string;
  isPrimary?: boolean;
}) {
  return patch(`/emergency-contacts/${contactId}`, { request: data });
}

// Delete emergency contact
function deleteEmergencyContact(contactId: string, otp: string) {
  return del(`/emergency-contacts/${contactId}`, { request: { otp } });
}

// Hooks
export function useEmergencyContacts(studentId: string) {
  return useQuery({
    queryKey: ["emergency-contacts", studentId],
    queryFn: () => fetchEmergencyContacts(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmergencyContactById(contactId: string) {
  return useQuery({
    queryKey: ["emergency-contact", contactId],
    queryFn: () => fetchEmergencyContactById(contactId),
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      studentId: string;
      name: string;
      relationship: "FATHER" | "MOTHER" | "GUARDIAN" | "RELATIVE" | "OTHER";
      contact: string;
      alternateContact?: string;
      address?: string;
      isPrimary?: boolean;
    }) => createEmergencyContact(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts", variables.studentId] });
    },
  });
}

export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      updateEmergencyContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
    },
  });
}

export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteEmergencyContact(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
    },
  });
}

