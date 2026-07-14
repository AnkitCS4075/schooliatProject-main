"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useHomeworkById, useUpdateHomework } from "@/lib/hooks/use-homework";
import { FormTopBar } from "@/components/forms/form-top-bar";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClassesContext } from "@/lib/context/classes-context";
import { useSubjects } from "@/lib/hooks/use-subjects";
import { toast } from "sonner";
import { useEffect } from "react";

interface EditFormData {
  title: string;
  description: string;
  classIds: string[];
  subjectId: string;
  dueDate: string;
}

export default function EditHomeworkPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: homeworkRes, isLoading } = useHomeworkById(id);
  const { mutateAsync: updateHomework, isPending: isSaving } = useUpdateHomework();
  const { classes } = useClassesContext();

  const homework = homeworkRes?.data;

  const methods = useForm<EditFormData>({
    defaultValues: {
      title: "",
      description: "",
      classIds: [],
      subjectId: "",
      dueDate: "",
    },
    mode: "onBlur",
  });

  const {
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = methods;

  const watchedClassIds = watch("classIds");

  const { data: subjectsData } = useSubjects({
    classId: watchedClassIds.length === 1 ? watchedClassIds[0] : undefined,
    limit: 1000,
  });
  const uniqueSubjects = subjectsData?.data || [];

  useEffect(() => {
    if (homework) {
      const dueDate = homework.dueDate
        ? new Date(homework.dueDate).toISOString().slice(0, 16)
        : "";
      reset({
        title: homework.title || "",
        description: homework.description || "",
        classIds: homework.classIds || [],
        subjectId: homework.subjectId || "",
        dueDate,
      });
    }
  }, [homework, reset]);

  const onSubmit = async (data: EditFormData) => {
    try {
      await updateHomework({
        id,
        title: data.title,
        description: data.description,
        classIds: data.classIds,
        subjectId: data.subjectId,
        dueDate: new Date(data.dueDate).toISOString(),
      });
      toast.success("Homework updated successfully");
      setTimeout(() => router.push("/admin/homework"), 1000);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update homework");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg font-medium">Homework not found</p>
        <p className="text-sm mt-1">It may have been deleted or you may not have access.</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-8">
        <FormTopBar
          title="Edit Homework"
          onCancel={() => router.push("/admin/homework")}
          onReset={() => reset()}
          onSave={handleSubmit(onSubmit)}
          isSaving={isSaving}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormCard title="Basic Information">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...methods.register("title", { required: "Title is required" })}
                  placeholder="Enter homework title"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  {...methods.register("dueDate", { required: "Due date is required" })}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-500">{errors.dueDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Classes *</Label>
                <Controller
                  control={control}
                  name="classIds"
                  rules={{ validate: (v) => v.length > 0 || "At least one class required" }}
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <>
                      <Select
                        value={value[0] || ""}
                        onValueChange={(val) => {
                          if (!value.includes(val)) onChange([...value, val]);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.division ? `${cls.grade}-${cls.division}` : cls.grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {value.map((classId) => {
                            const cls = classes?.find((c) => c.id === classId);
                            return (
                              <Badge
                                key={classId}
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => onChange(value.filter((cid) => cid !== classId))}
                              >
                                {cls?.division ? `${cls.grade}-${cls.division}` : cls?.grade}
                                <X className="h-3 w-3 ml-1" />
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      {error && <p className="text-sm text-red-500">{error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Subject *</Label>
                <Controller
                  control={control}
                  name="subjectId"
                  rules={{ required: "Subject is required" }}
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <>
                      <Select value={value} onValueChange={onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueSubjects.map((sub: any) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {error && <p className="text-sm text-red-500">{error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label>Description *</Label>
                <Textarea
                  {...methods.register("description", { required: "Description is required" })}
                  placeholder="Enter homework description"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>
          </FormCard>
        </form>
      </div>
    </FormProvider>
  );
}
