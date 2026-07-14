"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGalleryById,
  useUpdateGallery,
  useUploadImage,
  useDeleteImage,
} from "@/lib/hooks/use-gallery";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import { getFile } from "@/lib/api/client";
import { createGallerySchema, type CreateGalleryFormData } from "@/lib/schemas/gallery-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";

export default function GalleryEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageOtpId, setImageOtpId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGalleryById(id);
  const gallery = data?.data;

  const updateGallery = useUpdateGallery();
  const uploadImage = useUploadImage();
  const deleteImage = useDeleteImage();
  const fileUpload = useFileUpload();

  const form = useForm<CreateGalleryFormData>({
    resolver: zodResolver(createGallerySchema),
    defaultValues: {
      title: "",
      description: "",
      privacy: "PUBLIC",
      eventId: "",
      classId: "",
    },
  });

  useEffect(() => {
    if (!gallery) return;
    form.reset({
      title: gallery.title ?? "",
      description: gallery.description ?? "",
      privacy: (gallery.privacy as "PUBLIC" | "PRIVATE" | "CLASS_ONLY") ?? "PUBLIC",
      eventId: gallery.eventId ?? "",
      classId: gallery.classId ?? "",
    });
  }, [gallery?.id]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateGallery.mutateAsync({
        id,
        title: values.title,
        description: values.description || undefined,
        privacy: values.privacy,
        eventId: values.eventId || undefined,
        classId: values.classId || undefined,
      });
      toast.success("Gallery updated.");
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to update gallery.";
      toast.error(message);
    }
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    e.target.value = "";

    try {
      const uploadRes = await fileUpload.mutateAsync(file);
      const fileId = uploadRes?.data?.id ?? uploadRes?.id ?? (uploadRes as { id?: string })?.id;
      if (!fileId) {
        toast.error("Could not get file ID after upload.");
        return;
      }
      await uploadImage.mutateAsync({
        galleryId: id,
        imageId: fileId,
      });
      toast.success("Image added to gallery.");
      refetch();
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to upload image.";
      toast.error(message);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    setImageOtpId(imageId);
  };

  if (isLoading || !gallery) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const images = gallery.images ?? [];

  return (
    <div className="space-y-6 pb-8">
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/gallery")}
        className="gap-2 w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Gallery
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register("title")} placeholder="Gallery title" />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Brief description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="privacy">Privacy</Label>
              <Select
                value={form.watch("privacy")}
                onValueChange={(v) => form.setValue("privacy", v as "PUBLIC" | "PRIVATE" | "CLASS_ONLY")}
              >
                <SelectTrigger id="privacy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="CLASS_ONLY">Class Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={updateGallery.isPending}>
                {updateGallery.isPending ? "Saving..." : "Save Gallery"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/gallery/${id}`)}
              >
                View Gallery
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Images ({images.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={fileUpload.isPending || uploadImage.isPending}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {fileUpload.isPending || uploadImage.isPending ? "Uploading..." : "Add Image"}
          </Button>

          {images.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No images yet. Use "Add Image" to upload.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img: { id: string; fileId: string; caption?: string | null }) => (
                <div key={img.id} className="rounded-lg overflow-hidden border bg-muted/30 group relative">
                  <a
                    href={getFile(img.fileId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-square"
                  >
                    <img
                      src={getFile(img.fileId)}
                      alt={img.caption ?? "Gallery image"}
                      className="w-full h-full object-cover"
                    />
                  </a>
                  {img.caption && (
                    <p className="p-2 text-sm text-muted-foreground truncate">{img.caption}</p>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-90 group-hover:opacity-100"
                    onClick={() => handleDeleteImage(img.id)}
                    disabled={deleteImage.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DeletionOtpDialog
        open={!!imageOtpId}
        onOpenChange={(open) => !open && setImageOtpId(null)}
        audience="school-admin"
        title="Remove gallery image"
        description="Confirm with the code sent to your deletion email."
        entityType={SCHOOL_DELETION_ENTITY.GALLERY_IMAGE}
        entityId={imageOtpId ?? ""}
        isDeleting={deleteImage.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!imageOtpId) return;
          await deleteImage.mutateAsync({ galleryId: id, imageId: imageOtpId, otp });
          toast.success("Image removed.");
          refetch();
        }}
      />
    </div>
  );
}
