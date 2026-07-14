"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { calendarEventSchema, CalendarEventFormData } from "@/lib/schemas/calendar-schema";
import { useUpdateCalendarEvent } from "@/lib/hooks/use-calendar";
import { FormTopBar } from "@/components/forms/form-top-bar";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

interface EditCalendarEventFormProps {
  item: any;
}

export function EditCalendarEventForm({ item }: EditCalendarEventFormProps) {
  const router = useRouter();
  const { mutateAsync: updateEvent, isPending: isSaving } = useUpdateCalendarEvent();

  const methods = useForm<CalendarEventFormData>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: {
      title: "",
      description: "",
      from: "",
      till: "",
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
    if (item) {
      setValue("title", item.title || "");
      setValue("description", item.description || "");
      setValue(
        "from",
        item.from ? format(new Date(item.from), "yyyy-MM-dd") : ""
      );
      setValue(
        "till",
        item.till ? format(new Date(item.till), "yyyy-MM-dd") : ""
      );
      setValue(
        "visibleFrom",
        item.visibleFrom ? format(new Date(item.visibleFrom), "yyyy-MM-dd") : ""
      );
      setValue(
        "visibleTill",
        item.visibleTill ? format(new Date(item.visibleTill), "yyyy-MM-dd") : ""
      );
    }
  }, [item, setValue]);

  const onSubmit = async (data: CalendarEventFormData) => {
    if (!item?.id) {
      toast.error("Missing event ID");
      return;
    }

    try {
      await updateEvent({ id: item.id, ...data });
      toast.success("Calendar event updated successfully!");
      setTimeout(() => {
        router.push("/admin/calendar");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update calendar event");
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-8">
        <FormTopBar
          title="Update Calendar Event"
          onCancel={() => router.push("/admin/calendar")}
          onReset={() => reset()}
          onSave={handleSubmit(onSubmit)}
          saveLabel="Update"
          isSaving={isSaving}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormCard title="Event Details">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  {...methods.register("title")}
                  placeholder="Enter event title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  {...methods.register("description")}
                  placeholder="Enter event description"
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>
          </FormCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormCard title="Event Dates">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="from">Event Start Date</Label>
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
                  <Label htmlFor="till">Event End Date</Label>
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
                  <Label htmlFor="visibleFrom">Event Visible From</Label>
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
                  <Label htmlFor="visibleTill">Event Visible Till</Label>
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

