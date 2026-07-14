"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { noticeSchema, NoticeFormData } from "@/lib/schemas/notice-schema";
import { useNotice, useUpdateNotice } from "@/lib/hooks/use-notices";
import { FormTopBar } from "@/components/forms/form-top-bar";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function EditCircularPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = params.id as string;

  // Try to get from sessionStorage first, then fetch from API
  const [noticeData, setNoticeData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("editingNotice");
    if (stored) {
      try {
        setNoticeData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored notice", e);
      }
    }
  }, []);

  const { data: noticeResponse, isLoading: isNoticeFetching } = useNotice(noticeId);
  const notice = noticeData || noticeResponse?.data;
  const { mutateAsync: updateNotice, isPending: isSaving } = useUpdateNotice();

  const methods = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: "",
      content: "",
      visibleFrom: "",
      visibleTill: "",
    },
    mode: "onBlur",
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (!notice) return;

    setValue("title", notice.title || "");
    setValue("content", notice.content || "");
    setValue(
      "visibleFrom",
      notice.visibleFrom ? format(new Date(notice.visibleFrom), "yyyy-MM-dd") : ""
    );
    setValue(
      "visibleTill",
      notice.visibleTill ? format(new Date(notice.visibleTill), "yyyy-MM-dd") : ""
    );
  }, [notice, setValue]);

  const onSubmit = async (data: NoticeFormData) => {
    if (!noticeId) {
      toast.error("Missing notice ID");
      return;
    }

    try {
      await updateNotice({ id: noticeId, ...data });
      toast.success("Notice updated successfully!");
      setTimeout(() => {
        router.push("/admin/circulars");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update notice");
    }
  };

  if (isNoticeFetching && !notice) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Notice not found</p>
          <button
            onClick={() => router.push("/admin/circulars")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-in-out"
          >
            Back to Circulars
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-8">
        <FormTopBar
          title="Edit Notice"
          onCancel={() => router.push("/admin/circulars")}
          onReset={() => reset()}
          onSave={handleSubmit(onSubmit)}
          saveLabel="Update"
          isSaving={isSaving}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormCard title="Notice Details">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...methods.register("title")}
                  placeholder="Enter notice title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  {...methods.register("content")}
                  placeholder="Enter notice content"
                  rows={6}
                  className={errors.content ? "border-red-500" : ""}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
              </div>
            </div>
          </FormCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormCard title="Visibility Settings">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visibleFrom">Visible From</Label>
                  <Input
                    id="visibleFrom"
                    type="date"
                    {...methods.register("visibleFrom")}
                    className={errors.visibleFrom ? "border-red-500" : ""}
                  />
                  {errors.visibleFrom && (
                    <p className="text-sm text-red-500">{errors.visibleFrom.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibleTill">Visible Till</Label>
                  <Input
                    id="visibleTill"
                    type="date"
                    {...methods.register("visibleTill")}
                    className={errors.visibleTill ? "border-red-500" : ""}
                  />
                  {errors.visibleTill && (
                    <p className="text-sm text-red-500">{errors.visibleTill.message}</p>
                  )}
                </div>
              </div>
            </FormCard>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

