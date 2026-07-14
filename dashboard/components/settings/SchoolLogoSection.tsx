"use client";

import { FormCard } from "@/components/forms/form-card";
import { PhotoUpload } from "@/components/forms/photo-upload";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function SchoolLogoSection() {
  const { toast } = useToast();
  const { data: settingsData, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const form = useForm<{ schoolPhotoId?: string }>({ defaultValues: { schoolPhotoId: undefined } });

  if (isLoading) {
    return (
      <FormCard title="School Logo" icon={<ImageIcon className="h-5 w-5" />}>
        <Skeleton className="h-40 w-full" />
      </FormCard>
    );
  }

  return (
    <FormCard title="School Logo" icon={<ImageIcon className="h-5 w-5" />}>
      <PhotoUpload
        control={form.control}
        name="schoolPhotoId"
        hintText="Upload a school logo (recommended: square, 256×256 or higher)"
        buttonText="Add / Update Logo"
        existingImageUrl={settingsData?.data?.logoUrl}
        loading={isLoading}
        onUploadSuccess={async (fileResponse) => {
          const logoId = fileResponse?.id ?? (fileResponse as { data?: { id?: string } })?.data?.id ?? "";
          if (!logoId) {
            toast({ title: "Error", description: "Failed to get file ID from upload response.", variant: "destructive" });
            return;
          }
          try {
            await updateSettings.mutateAsync({ request: { logoId } });
            toast({ title: "Success", description: "School logo updated." });
          } catch (err: unknown) {
            toast({ title: "Error", description: "Failed to save logo to settings.", variant: "destructive" });
          }
        }}
        onUploadError={() => {
          toast({ title: "Error", description: "Failed to upload logo.", variant: "destructive" });
        }}
      />
    </FormCard>
  );
}
