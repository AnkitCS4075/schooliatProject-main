"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createHomeworkSchema, CreateHomeworkFormData } from "@/lib/schemas/homework-schema";
import { useCreateHomework } from "@/lib/hooks/use-homework";
import { FormTopBar } from "@/components/forms/form-top-bar";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClassDropdown } from "@/components/forms/class-dropdown";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClassesContext } from "@/lib/context/classes-context";
import { useSubjects } from "@/lib/hooks/use-subjects";

export default function AddHomeworkPage() {
  const router = useRouter();
  const { mutateAsync: createHomework, isPending: isSaving } = useCreateHomework();
  const { classes } = useClassesContext();
  const [isMCQ, setIsMCQ] = useState(false);

  const methods = useForm<CreateHomeworkFormData>({
    resolver: zodResolver(createHomeworkSchema),
    defaultValues: {
      title: "",
      description: "",
      classIds: [],
      subjectId: "",
      dueDate: "",
      isMCQ: false,
      attachments: [],
      mcqQuestions: [],
    },
    mode: "onBlur",
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = methods;

  const watchedIsMCQ = watch("isMCQ");
  const watchedClassIds = watch("classIds");
  const watchedMCQQuestions = watch("mcqQuestions") || [];

  // Fetch subjects - if a class is selected, filter by classId, otherwise get all
  const { data: subjectsData } = useSubjects({
    classId: watchedClassIds.length === 1 ? watchedClassIds[0] : undefined,
    limit: 1000,
  });
  const uniqueSubjects = subjectsData?.data || [];

  const addMCQQuestion = () => {
    const current = watchedMCQQuestions || [];
    setValue("mcqQuestions", [
      ...current,
      {
        question: "",
        options: ["", ""],
        correctAnswer: 0,
        marks: 1,
      },
    ]);
  };

  const removeMCQQuestion = (index: number) => {
    const current = watchedMCQQuestions || [];
    setValue(
      "mcqQuestions",
      current.filter((_, i) => i !== index)
    );
  };

  const updateMCQQuestion = (index: number, field: string, value: any) => {
    const current = watchedMCQQuestions || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue("mcqQuestions", updated);
  };

  const addOption = (questionIndex: number) => {
    const current = watchedMCQQuestions || [];
    const updated = [...current];
    if (updated[questionIndex].options.length < 6) {
      updated[questionIndex].options.push("");
      setValue("mcqQuestions", updated);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const current = watchedMCQQuestions || [];
    const updated = [...current];
    if (updated[questionIndex].options.length > 2) {
      updated[questionIndex].options = updated[questionIndex].options.filter(
        (_, i) => i !== optionIndex
      );
      setValue("mcqQuestions", updated);
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const current = watchedMCQQuestions || [];
    const updated = [...current];
    updated[questionIndex].options[optionIndex] = value;
    setValue("mcqQuestions", updated);
  };

  const onSubmit = async (data: CreateHomeworkFormData) => {
    try {
      await createHomework(data);
      toast.success("Homework created successfully");
      setTimeout(() => {
        reset();
        router.push("/admin/homework");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create homework");
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-8">
        <FormTopBar
          title="Add New Homework"
          onCancel={() => router.push("/admin/homework")}
          onReset={() => reset()}
          onSave={handleSubmit(onSubmit)}
          isSaving={isSaving}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <FormCard title="Basic Information">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...methods.register("title")}
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
                  {...methods.register("dueDate")}
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
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <>
                      <Select
                        value={value[0] || ""}
                        onValueChange={(val) => {
                          if (!value.includes(val)) {
                            onChange([...value, val]);
                          }
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
                                onClick={() => onChange(value.filter((id) => id !== classId))}
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

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  {...methods.register("description")}
                  placeholder="Enter homework description"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isMCQ"
                    checked={watchedIsMCQ}
                    onCheckedChange={(checked) => {
                      setIsMCQ(!!checked);
                      setValue("isMCQ", !!checked);
                      if (!checked) {
                        setValue("mcqQuestions", []);
                      }
                    }}
                  />
                  <Label htmlFor="isMCQ" className="cursor-pointer">
                    This is an MCQ Assessment
                  </Label>
                </div>
              </div>
            </div>
          </FormCard>

          {/* MCQ Questions */}
          {watchedIsMCQ && (
            <FormCard title="MCQ Questions">
              <div className="space-y-6">
                {watchedMCQQuestions.map((question, qIndex) => (
                  <div key={qIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Question {qIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMCQQuestion(qIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Question *</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) =>
                          updateMCQQuestion(qIndex, "question", e.target.value)
                        }
                        placeholder="Enter question"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Options *</Label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) =>
                              updateOption(qIndex, oIndex, e.target.value)
                            }
                            placeholder={`Option ${oIndex + 1}`}
                          />
                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(qIndex, oIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {question.options.length < 6 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(qIndex)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Correct Answer (Index) *</Label>
                        <Select
                          value={String(question.correctAnswer)}
                          onValueChange={(val) =>
                            updateMCQQuestion(qIndex, "correctAnswer", parseInt(val))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options.map((_, idx) => (
                              <SelectItem key={idx} value={String(idx)}>
                                Option {idx + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Marks *</Label>
                        <Input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={question.marks}
                          onChange={(e) =>
                            updateMCQQuestion(qIndex, "marks", parseFloat(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addMCQQuestion}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>

                {errors.mcqQuestions && (
                  <p className="text-sm text-red-500">{errors.mcqQuestions.message}</p>
                )}
              </div>
            </FormCard>
          )}
        </form>
      </div>
    </FormProvider>
  );
}

