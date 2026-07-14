"use client";

import { useParams, useRouter } from "next/navigation";
import { useGalleryById } from "@/lib/hooks/use-gallery";
import { getFile } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Image as ImageIcon, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function GalleryViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const { data, isLoading, error } = useGalleryById(id);
  const gallery = data?.data;

  const getPrivacyBadge = (privacy: string) => {
    switch (privacy) {
      case "PUBLIC":
        return <Badge className="bg-primary hover:bg-schooliat-primary-dark">Public</Badge>;
      case "PRIVATE":
        return <Badge variant="destructive">Private</Badge>;
      case "CLASS_ONLY":
        return <Badge className="bg-primary/80 hover:bg-primary">Class Only</Badge>;
      default:
        return <Badge>{privacy}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="space-y-6 pb-8">
        <Button variant="ghost" onClick={() => router.push("/admin/gallery")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Gallery not found or you don’t have access to it.
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = gallery.images ?? [];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/gallery")}
          className="gap-2 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/gallery/${id}/edit`)}
            className="gap-2"
          >
            Edit Gallery
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ImageIcon className="h-6 w-6" />
                {gallery.title}
              </CardTitle>
              {gallery.description && (
                <p className="text-muted-foreground mt-2">{gallery.description}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {getPrivacyBadge(gallery.privacy)}
              {gallery.createdAt && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(gallery.createdAt), "MMM dd, yyyy")}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground border border-dashed rounded-lg">
              No images in this gallery yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img: { id: string; fileId: string; caption?: string | null }) => (
                <div key={img.id} className="rounded-lg overflow-hidden border bg-muted/30">
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
                    <p className="p-2 text-sm text-muted-foreground truncate" title={img.caption}>
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
