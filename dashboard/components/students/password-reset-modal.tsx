"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { post } from "@/lib/api/client";
import { toast } from "sonner";

interface PasswordResetModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
  onSuccess?: () => void;
}

function resetUserPassword(userId: string, newPassword: string) {
  return post(`/users/${userId}/reset-password`, {
    request: { newPassword },
  });
}

export function PasswordResetModal({
  visible,
  onClose,
  userId,
  userName,
  onSuccess,
}: PasswordResetModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { newPassword: string }) =>
      resetUserPassword(userId!, data.newPassword),
    onSuccess: () => {
      reset();
      onClose();
      toast.success("Password reset successfully!");
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reset password");
    },
  });

  const onSubmit = (data: { newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!userId) {
      toast.error("User ID is required");
      return;
    }
    resetPasswordMutation.mutate({ newPassword: data.newPassword });
  };

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-2 pb-4 border-b">
            <h3 className="text-xl font-bold text-[#1f5e00]">
              {userName || "User"}
            </h3>
            <p className="text-sm text-gray-600">Set new password</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm password",
                  validate: (value) =>
                    value === watch("newPassword") || "Passwords do not match",
                })}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending || !isValid}
                className="flex-1 bg-[#2d5a1a] hover:bg-[#1f5e00]"
              >
                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

