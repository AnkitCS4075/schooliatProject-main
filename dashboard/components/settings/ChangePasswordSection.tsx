"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormCard } from "@/components/forms/form-card";
import { useChangePassword } from "@/lib/hooks/use-settings";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/schemas/settings-schema";
import { Eye, EyeOff, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ChangePasswordSection() {
  const { toast } = useToast();
  const changePassword = useChangePassword();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      form.reset();
      toast({ title: "Success", description: "Password updated successfully." });
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to update password.";
      if (msg.toLowerCase().includes("incorrect current password")) {
        form.setError("currentPassword", { type: "manual", message: "Incorrect current password" });
      }
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  });

  return (
    <FormCard title="Change Password" icon={<Key className="h-5 w-5" />}>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter current password"
              {...form.register("currentPassword")}
              error={form.formState.errors.currentPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.currentPassword && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              {...form.register("newPassword")}
              error={form.formState.errors.newPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.newPassword && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              {...form.register("confirmPassword")}
              error={form.formState.errors.confirmPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={changePassword.isPending}>
          {changePassword.isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </FormCard>
  );
}
