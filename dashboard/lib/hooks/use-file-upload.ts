"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { uploadFile, getFile } from "@/lib/api/client";
import { get } from "@/lib/api/client";
import { resolvePublicFileUrl } from "@/lib/utils/resolve-public-file-url";

// File response type
export interface FileResponse {
  id: string;
  url: string;
  name?: string;
  size?: number;
  type?: string;
}

export function useFileUpload() {
  return useMutation({
    mutationFn: async (file: File | { uri: string; name: string; type: string }) => {
      if (file instanceof File) {
        return uploadFile("/files", file);
      } else {
        // For React Native web compatibility
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const fileObj = new File([blob], file.name, { type: file.type });
        return uploadFile("/files", fileObj);
      }
    },
  });
}

export function useFile(fileId: string | null | undefined, options: { enabled?: boolean } = {}) {
  return useQuery<FileResponse | string>({
    queryKey: ["file", fileId],
    queryFn: async () => {
      if (!fileId) throw new Error("File ID is required");
      
      // Try to fetch file metadata from API
      try {
        const fileData = await get(`/files/${fileId}`);
        // If API returns file object with url, return it
        if (fileData?.data && typeof fileData.data === 'object' && 'url' in fileData.data) {
          return fileData.data as FileResponse;
        }
        // If API returns url directly
        if (fileData?.data?.url) {
          return fileData.data as FileResponse;
        }
      } catch (error) {
        // If API call fails, fall back to getFile which returns URL string
        // This is expected for file URLs
      }
      
      // Fallback: getFile returns a URL string
      const fileUrl = getFile(fileId);
      return fileUrl;
    },
    enabled: !!fileId && (options.enabled !== false),
    staleTime: 5 * 60 * 1000,
  });
}

// Helper function to extract URL from file data
export function getFileUrl(fileData: FileResponse | string | undefined | null): string | null {
  if (!fileData) return null;
  if (typeof fileData === "string") return resolvePublicFileUrl(fileData);
  return fileData.url ? resolvePublicFileUrl(fileData.url) : null;
}

