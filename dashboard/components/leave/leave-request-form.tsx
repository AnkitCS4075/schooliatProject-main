"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeaveRequestSchema, CreateLeaveRequestFormData } from "@/lib/schemas/leave-schema";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { useLeaveTypes } from "@/lib/hooks/use-leave";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaveRequestFormProps {
  onSubmit: (data: CreateLeaveRequestFormData) => void;
  isSubmitting?: boolean;
}

export function LeaveRequestForm({ onSubmit, isSubmitting = false }: LeaveRequestFormProps) {
  const { data: leaveTypesData, isLoading: leaveTypesLoading } = useLeaveTypes();
  const leaveTypes = leaveTypesData?.data || [];

  const methods = useForm<CreateLeaveRequestFormData>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
    mode: "onBlur",
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormCard title="Leave Request Details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Leave Type *</Label>
              {leaveTypesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Controller
                  control={control}
                  name="leaveTypeId"
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <>
                      <Select value={value} onValueChange={onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Leave Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveTypes.map((type: any) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name} ({type.maxLeaves || "Unlimited"} available)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {error && <p className="text-sm text-red-500">{error.message}</p>}
                    </>
                  )}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <>
                    <Input
                      type="date"
                      value={value}
                      onChange={onChange}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {error && <p className="text-sm text-red-500">{error.message}</p>}
                  </>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Controller
                control={control}
                name="endDate"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <>
                    <Input
                      type="date"
                      value={value}
                      onChange={onChange}
                      min={methods.watch("startDate") || new Date().toISOString().split("T")[0]}
                    />
                    {error && <p className="text-sm text-red-500">{error.message}</p>}
                  </>
                )}
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Reason *</Label>
              <Controller
                control={control}
                name="reason"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <>
                    <Textarea
                      value={value}
                      onChange={onChange}
                      placeholder="Enter reason for leave (minimum 10 characters)"
                      rows={4}
                    />
                    {error && <p className="text-sm text-red-500">{error.message}</p>}
                    <p className="text-sm text-gray-500">
                      {value.length} / 500 characters
                    </p>
                  </>
                )}
              />
            </div>
          </div>
        </FormCard>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#4CAF50] hover:bg-[#45a049]"
          >
            {isSubmitting ? "Submitting..." : "Submit Leave Request"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

