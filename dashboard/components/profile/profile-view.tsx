"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { clearToken } from "@/lib/auth/storage";
import { useAuth } from "@/lib/hooks/use-auth";
import { useMe, useUpdateMe } from "@/lib/hooks/use-me";
import { changeUserPassword } from "@/lib/api/client";
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordFormData,
  type UpdateProfileFormData,
} from "@/lib/schemas/settings-schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormCard } from "@/components/forms/form-card";
import { User, Lock, LogOut, Eye, EyeOff, Settings, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User as AuthUser } from "@/lib/auth/storage";

export type ProfileTheme = "admin" | "super-admin";

const themeConfig: Record<
  ProfileTheme,
  { gradient: string; iconColor: string; badgeColor: string; borderColor: string }
> = {
  admin: {
    gradient: "linear-gradient(135deg, var(--primary) 0%, var(--chart-3) 100%)",
    iconColor: "text-primary",
    badgeColor: "bg-primary",
    borderColor: "border-primary",
  },
  "super-admin": {
    gradient: "linear-gradient(135deg, var(--primary) 0%, var(--chart-2) 100%)",
    iconColor: "text-primary",
    badgeColor: "bg-primary",
    borderColor: "border-primary",
  },
};

function getDisplayNameFromAuth(user: AuthUser | null): string {
  if (!user) return "User";
  const u = user as AuthUser & { firstName?: string; lastName?: string };
  if (u.firstName?.trim()) {
    const full = `${u.firstName} ${(u.lastName || "").trim()}`.trim();
    if (full) return full;
  }
  const email = user.email ?? "";
  const parts = email.split("@")[0].split(".");
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`.replace(/\b\w/g, (l) => l.toUpperCase());
  }
  return email.split("@")[0] || "User";
}

function getDisplayName(me: { firstName?: string; lastName?: string | null } | null, fallbackAuth: AuthUser | null): string {
  if (me?.firstName?.trim()) {
    const full = `${me.firstName} ${(me.lastName || "").trim()}`.trim();
    if (full) return full;
  }
  return getDisplayNameFromAuth(fallbackAuth);
}

export interface ProfileViewProps {
  roleLabel: string;
  theme: ProfileTheme;
  /** Link to settings page (e.g. /admin/settings or /super-admin/settings) */
  settingsHref?: string;
}

export function ProfileView({ roleLabel, theme, settingsHref }: ProfileViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { data: me, isLoading: meLoading, refetch: refetchMe } = useMe();
  const updateMe = useUpdateMe();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const config = themeConfig[theme];

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      contact: "",
    },
  });

  useEffect(() => {
    if (me) {
      profileForm.reset({
        firstName: me.firstName ?? "",
        lastName: me.lastName ?? "",
        contact: me.contact ?? "",
      });
    }
  }, [me, profileForm]);

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changeUserPassword(currentPassword, newPassword),
  });

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await clearToken();
      router.replace("/login");
    }
  };

  const handleUpdateProfile = profileForm.handleSubmit(async (values) => {
    try {
      await updateMe.mutateAsync({
        request: {
          firstName: values.firstName,
          lastName: values.lastName || null,
          contact: values.contact,
        },
      });
      toast({ title: "Success", description: "Profile updated successfully." });
      setEditingProfile(false);
      refetchMe();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to update profile.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  });

  const handleChangePassword = passwordForm.handleSubmit(async (values) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      toast({ title: "Success", description: "Password updated successfully." });
    } catch (error: unknown) {
      const err = error as { message?: string; data?: { message?: string } };
      const message = err?.data?.message ?? err?.message ?? "Failed to update password.";
      if (message.toLowerCase().includes("current password")) {
        passwordForm.setError("currentPassword", { type: "manual", message: "Incorrect current password" });
      }
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  });

  const isLoading = authLoading || meLoading;

  if (authLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-52 rounded-2xl bg-gray-200" />
        <div className="h-48 rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: config.gradient }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
              <User className={`w-12 h-12 ${config.iconColor}`} />
            </div>
            <div
              className={`absolute bottom-2 right-2 w-6 h-6 rounded-full ${config.badgeColor} border-4 ${config.borderColor}`}
            />
          </div>
          <h2 className="text-2xl font-bold mb-1">
            {getDisplayName(me ?? null, user)}
          </h2>
          <p className="text-sm opacity-90">{me?.role?.name ?? roleLabel}</p>
          {(me?.email ?? user?.email) && (
            <p className="text-sm opacity-80 mt-1">{me?.email ?? user?.email}</p>
          )}
        </div>
      </div>

      {/* Profile information – view + edit */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Profile information
        </h3>
        {!editingProfile ? (
          <Card>
            <CardContent className="p-4">
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-gray-500">First name</dt>
                  <dd className="font-medium text-gray-900">{me?.firstName ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Last name</dt>
                  <dd className="font-medium text-gray-900">{me?.lastName ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium text-gray-900">{me?.email ?? user?.email ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Contact</dt>
                  <dd className="font-medium text-gray-900">{me?.contact ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Role</dt>
                  <dd className="font-medium text-gray-900">{me?.role?.name ?? user?.role?.name ?? roleLabel}</dd>
                </div>
                {me?.school && (
                  <div>
                    <dt className="text-gray-500">School</dt>
                    <dd className="font-medium text-gray-900">{me.school.name} ({me.school.code})</dd>
                  </div>
                )}
              </dl>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 gap-2"
                onClick={() => setEditingProfile(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <FormCard title="Edit profile" icon={<User className="h-4 w-4" />}>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="profile-firstName">First name</Label>
                <Input
                  id="profile-firstName"
                  {...profileForm.register("firstName")}
                  placeholder="First name"
                />
                {profileForm.formState.errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{profileForm.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="profile-lastName">Last name</Label>
                <Input
                  id="profile-lastName"
                  {...profileForm.register("lastName")}
                  placeholder="Last name (optional)"
                />
                {profileForm.formState.errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{profileForm.formState.errors.lastName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="profile-contact">Contact</Label>
                <Input
                  id="profile-contact"
                  {...profileForm.register("contact")}
                  placeholder="Phone or contact number"
                />
                {profileForm.formState.errors.contact && (
                  <p className="text-sm text-destructive mt-1">{profileForm.formState.errors.contact.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={updateMe.isPending}>
                  {updateMe.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingProfile(false);
                    if (me) profileForm.reset({ firstName: me.firstName ?? "", lastName: me.lastName ?? "", contact: me.contact ?? "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </FormCard>
        )}
      </div>

      {/* School / platform settings link */}
      {settingsHref && (
        <div>
          <Link href={settingsHref}>
            <Button variant="outline" className="w-full gap-2">
              <Settings className="h-4 w-4" />
              School &amp; account settings
            </Button>
          </Link>
        </div>
      )}

      {/* Security – Change password */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Security
        </h3>
        <FormCard title="Change password" icon={<Lock className="h-4 w-4" />}>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="relative">
              <Label htmlFor="profile-currentPassword">Current password</Label>
              <div className="relative">
                <Input
                  id="profile-currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  {...passwordForm.register("currentPassword")}
                  error={passwordForm.formState.errors.currentPassword?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="relative">
              <Label htmlFor="profile-newPassword">New password</Label>
              <div className="relative">
                <Input
                  id="profile-newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  {...passwordForm.register("newPassword")}
                  error={passwordForm.formState.errors.newPassword?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="relative">
              <Label htmlFor="profile-confirmPassword">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="profile-confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  {...passwordForm.register("confirmPassword")}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full"
            >
              {changePasswordMutation.isPending ? "Updating..." : "Update password"}
            </Button>
          </form>
        </FormCard>
      </div>

      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
