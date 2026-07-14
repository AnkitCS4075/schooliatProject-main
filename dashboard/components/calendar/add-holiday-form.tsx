"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { holidaySchema, HolidayFormData } from "@/lib/schemas/calendar-schema";
import { useCreateHoliday } from "@/lib/hooks/use-calendar";
import { FormTopBar } from "@/components/forms/form-top-bar";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

export function AddHolidayForm() {
  const router = useRouter();
  const { mutateAsync: createHoliday, isPending: isSaving } = useCreateHoliday();

  const methods = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      title: "",
      from: format(new Date(), "yyyy-MM-dd"),
      till: format(new Date(), "yyyy-MM-dd"),
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

  const onSubmit = async (data: HolidayFormData) => {
    try {
      await createHoliday(data);
      toast.success("Holiday created successfully!");
      setTimeout(() => {
        router.push("/admin/calendar");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create holiday");
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-8">
        <FormTopBar
          title="Add Holiday"
          onCancel={() => router.push("/admin/calendar")}
          onReset={() => reset()}
          onSave={handleSubmit(onSubmit)}
          isSaving={isSaving}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormCard title="Holiday Details">
            <div className="space-y-2">
              <Label htmlFor="title">Holiday Title</Label>
              <Input
                id="title"
                {...methods.register("title")}
                placeholder="Enter holiday title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
          </FormCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormCard title="Holiday Dates">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="from">Holiday Start Date</Label>
                  <Input
                    id="from"
                    type="date"
                    {...methods.register("from")}
                    className={errors.from ? "border-red-500" : ""}
                  />
                  {errors.from && (
                    <p className="text-sm text-red-500">{errors.from.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="till">Holiday End Date</Label>
                  <Input
                    id="till"
                    type="date"
                    {...methods.register("till")}
                    className={errors.till ? "border-red-500" : ""}
                  />
                  {errors.till && (
                    <p className="text-sm text-red-500">{errors.till.message}</p>
                  )}
                </div>
              </div>
            </FormCard>

            <FormCard title="Visibility Settings">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visibleFrom">Holiday Visible From</Label>
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
                  <Label htmlFor="visibleTill">Holiday Visible Till</Label>
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

