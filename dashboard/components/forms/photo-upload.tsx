"use client";

import { useState, useEffect, useRef } from "react";
import { useFormContext, Controller, Control, useWatch } from "react-hook-form";
import { useFileUpload, useFile, getFileUrl } from "@/lib/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface PhotoUploadProps {
  name: string;
  label?: string;
  existingFileId?: string | null;
  existingImageUrl?: string;
  hintText?: string;
  buttonText?: string;
  rules?: any;
  control?: Control<any>;
  loading?: boolean;
  onUploadSuccess?: (fileResponse: any) => void;
  onUploadError?: () => void;
}

export function PhotoUpload({
  name,
  label,
  existingFileId,
  existingImageUrl,
  hintText = "Drop your files to upload a photo",
  buttonText = "Select files",
  rules,
  control: providedControl,
  loading: externalLoading,
  onUploadSuccess,
  onUploadError,
}: PhotoUploadProps) {
  const formContext = providedControl ? undefined : useFormContext();
  const control = providedControl || formContext?.control;
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const imageUriRef = useRef<string | null>(null);

  const watchedValue = useWatch({ control, name });
  const { mutateAsync: uploadFile } = useFileUpload();

  const { data: existingFile, isLoading: loadingExistingFile } = useFile(
    existingFileId,
    { enabled: !!existingFileId && !isRemoved }
  );

  const shouldFetchUploaded = !!(
    watchedValue &&
    watchedValue !== existingFileId &&
    !existingImageUrl
  );
  const { data: uploadedFile } = useFile(watchedValue, {
    enabled: shouldFetchUploaded && !!watchedValue,
  });

  useEffect(() => {
    const fileUrl = getFileUrl(existingFile);
    if (fileUrl && !isRemoved) {
      imageUriRef.current = fileUrl;
      setLocalImageUri(fileUrl);
    }
  }, [existingFile, isRemoved]);

  useEffect(() => {
    const fileUrl = getFileUrl(uploadedFile);
    if (fileUrl && !uploading && !existingImageUrl) {
      imageUriRef.current = fileUrl;
      setLocalImageUri(fileUrl);
    }
  }, [uploadedFile, uploading, existingImageUrl]);

  useEffect(() => {
    if (existingImageUrl && !isRemoved) {
      imageUriRef.current = existingImageUrl;
      setLocalImageUri(existingImageUrl);
    }
  }, [existingImageUrl, isRemoved]);

  const handlePickPhoto = async (onChange: (value: string | null) => void) => {
    try {
      setIsRemoved(false);
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const imageUri = URL.createObjectURL(file);
        imageUriRef.current = imageUri;
        setLocalImageUri(imageUri);
        setUploading(true);

        try {
          const response = await uploadFile(file);
          if (response?.data?.id) {
            onChange(response.data.id);
            onUploadSuccess?.(response);
          } else {
            throw new Error("Upload response missing file ID");
          }
        } catch (error: any) {
          console.error("File upload error:", error);
          onUploadError?.();
          alert(error?.message || "Failed to upload photo. Please try again.");
        } finally {
          setUploading(false);
        }
      };
      input.click();
    } catch (error) {
      console.error("Image picker error:", error);
      alert("Failed to pick image. Please try again.");
    }
  };

  const handleRemovePhoto = (onChange: (value: string | null) => void) => {
    if (confirm("Are you sure you want to remove this photo?")) {
      imageUriRef.current = null;
      setLocalImageUri(null);
      setIsRemoved(true);
      onChange(null);
    }
  };

  const currentDisplayImageUri =
    imageUriRef.current ||
    localImageUri ||
    (!isRemoved && existingImageUrl) ||
    getFileUrl(uploadedFile) ||
    getFileUrl(existingFile) ||
    null;

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return (
            <>
              <div
                className={`border-2 border-dashed rounded-xl p-6 min-h-[200px] flex items-center justify-center ${
                  error
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                {(loadingExistingFile || externalLoading) && !currentDisplayImageUri ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <p className="text-sm text-gray-600">Loading photo...</p>
                  </div>
                ) : currentDisplayImageUri ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                      <img
                        src={currentDisplayImageUri}
                        alt="Photo"
                        className="h-full w-full object-cover"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePickPhoto(onChange)}
                        disabled={uploading}
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemovePhoto(onChange)}
                        disabled={uploading}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 text-center">{hintText}</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePickPhoto(onChange)}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {buttonText}
                    </Button>
                  </div>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-500">{error.message}</p>
              )}
            </>
          );
        }}
      />
    </div>
  );
}

