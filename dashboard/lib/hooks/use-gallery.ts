"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

// Fetch galleries
function fetchGalleries(params: {
  eventId?: string;
  classId?: string;
  privacy?: string;
  page?: number;
  limit?: number;
}) {
  return get("/gallery", params);
}

// Fetch single gallery
function fetchGalleryById(galleryId: string) {
  return get(`/gallery/${galleryId}`);
}

// Create gallery
function createGalleryApi(data: {
  title: string;
  description?: string;
  eventId?: string;
  classId?: string;
  privacy: "PUBLIC" | "PRIVATE" | "CLASS_ONLY";
}) {
  return post("/gallery", { request: data });
}

// Update gallery
function updateGalleryApi(galleryId: string, data: {
  title?: string;
  description?: string;
  privacy?: "PUBLIC" | "PRIVATE" | "CLASS_ONLY";
}) {
  return put(`/gallery/${galleryId}`, { request: data });
}

// Delete gallery
function deleteGalleryApi(galleryId: string, otp: string) {
  return del(`/gallery/${galleryId}`, { request: { otp } });
}

// Upload image to gallery (backend: POST /gallery/images with body { request: { galleryId, fileId, caption?, ... } })
function uploadImageApi(galleryId: string, data: { imageId: string; caption?: string }) {
  return post("/gallery/images", {
    request: {
      galleryId,
      fileId: data.imageId,
      caption: data.caption ?? undefined,
    },
  });
}

// Delete image from gallery (backend: DELETE /gallery/images/:id)
function deleteImageApi(imageId: string, otp: string) {
  return del(`/gallery/images/${imageId}`, { request: { otp } });
}

// Hooks
export function useGalleries(params: {
  eventId?: string;
  classId?: string;
  privacy?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ["galleries", params],
    queryFn: () => fetchGalleries(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useGalleryById(galleryId: string) {
  return useQuery({
    queryKey: ["gallery", galleryId],
    queryFn: () => fetchGalleryById(galleryId),
    enabled: !!galleryId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      eventId?: string;
      classId?: string;
      privacy: "PUBLIC" | "PRIVATE" | "CLASS_ONLY";
    }) => createGalleryApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
    },
  });
}

export function useUpdateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      updateGalleryApi(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", id] });
    },
  });
}

export function useDeleteGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteGalleryApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
    },
  });
}

export function useUploadImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId, ...data }: { galleryId: string; imageId: string; caption?: string }) =>
      uploadImageApi(galleryId, data),
    onSuccess: (_data, { galleryId }) => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", galleryId] });
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      galleryId,
      imageId,
      otp,
    }: {
      galleryId: string;
      imageId: string;
      otp: string;
    }) => deleteImageApi(imageId, otp),
    onSuccess: (_data, { galleryId }) => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", galleryId] });
    },
  });
}

