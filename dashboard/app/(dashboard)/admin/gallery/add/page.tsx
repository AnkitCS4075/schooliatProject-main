"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateGallery } from "@/lib/hooks/use-gallery";
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
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function GalleryAddPage() {
  const router = useRouter();
  const createGallery = useCreateGallery();

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

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await createGallery.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        privacy: values.privacy,
        eventId: values.eventId || undefined,
        classId: values.classId || undefined,
      });
      const galleryId = res?.data?.id;
      toast.success("Gallery created successfully.");
      if (galleryId) {
        router.push(`/admin/gallery/${galleryId}/edit`);
      } else {
        router.push("/admin/gallery");
      }
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to create gallery.";
      toast.error(message);
    }
  });

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
          <CardTitle>Add Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="e.g. Annual Day 2024"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Brief description of the gallery"
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

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={createGallery.isPending}>
                {createGallery.isPending ? "Creating..." : "Create Gallery"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/gallery")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
