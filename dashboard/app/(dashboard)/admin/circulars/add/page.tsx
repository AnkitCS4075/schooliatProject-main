"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { noticeSchema, NoticeFormData } from "@/lib/schemas/notice-schema";
import { useCreateNotice } from "@/lib/hooks/use-notices";
import { FormTopBar } from "@/components/forms/form-top-bar";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AddCircularPage() {
  const router = useRouter();
  const { mutateAsync: createNotice, isPending: isSaving } = useCreateNotice();

  const methods = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: "",
      content: "",
      visibleFrom: format(new Date(), "yyyy-MM-dd"),
      visibleTill: format(new Date(), "yyyy-MM-dd"),
    },
    mode: "onBlur",
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: NoticeFormData) => {
    try {
      await createNotice(data);
      toast.success("Notice created successfully!");
      setTimeout(() => {
        router.push("/admin/circulars");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create notice");
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-8">
        <FormTopBar
          title="Add New Notice"
          onCancel={() => router.push("/admin/circulars")}
          onReset={() => reset()}
          onSave={handleSubmit(onSubmit)}
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

