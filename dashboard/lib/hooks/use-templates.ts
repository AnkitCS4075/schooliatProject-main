"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";

/** Document template record (ID cards, receipts, results, etc.) synced from disk / DB */
export interface Template {
  id: string;
  title: string;
  type: string;
  description?: string;
  imageId?: string;
  imageUrl?: string;
  sampleId?: string;
  sampleUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
}

/**
 * List templates, optionally filtered by type (e.g. "ID_CARD").
 * Omit `typeFilter` to load all types (school template catalog).
 */
export function useTemplates(typeFilter?: string) {
  return useQuery({
    queryKey: ["templates", typeFilter ?? "__all__"],
    queryFn: () =>
      get("/templates", typeFilter ? { type: typeFilter } : {}),
    staleTime: 5 * 60 * 1000,
  });
}

/** JSON defaults from a template's schema.json (for preview / config tooling) */
export function useTemplateDefaults(templateId: string) {
  return useQuery({
    queryKey: ["templates", templateId, "defaults"],
    queryFn: () => get(`/templates/${templateId}/default`),
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000,
  });
}
