"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormCard } from "@/components/forms/form-card";
import { useSettings, useUpdateSettings, type SchoolConfig } from "@/lib/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationsSection() {
  const { toast } = useToast();
  const { data: settingsData, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const schoolConfig = (settingsData?.data?.platformConfig as { school?: SchoolConfig } | undefined)?.school;
  const notifications = schoolConfig?.notifications ?? {};

  const [feeReminders, setFeeReminders] = useState(!!notifications.feeReminders);
  const [attendanceAlerts, setAttendanceAlerts] = useState(!!notifications.attendanceAlerts);
  const [homeworkReminders, setHomeworkReminders] = useState(!!notifications.homeworkReminders);
  const [circulars, setCirculars] = useState(!!notifications.circulars);

  useEffect(() => {
    setFeeReminders(!!notifications.feeReminders);
    setAttendanceAlerts(!!notifications.attendanceAlerts);
    setHomeworkReminders(!!notifications.homeworkReminders);
    setCirculars(!!notifications.circulars);
  }, [notifications.feeReminders, notifications.attendanceAlerts, notifications.homeworkReminders, notifications.circulars]);

  const updateNotification = async (key: keyof NonNullable<SchoolConfig["notifications"]>, value: boolean) => {
    const next = {
      ...schoolConfig,
      notifications: {
        ...(schoolConfig?.notifications ?? {}),
        [key]: value,
      },
    };
    try {
      await updateSettings.mutateAsync({
        request: {
          platformConfig: {
            ...(settingsData?.data?.platformConfig ?? {}),
            school: next,
          },
        },
      });
      toast({ title: "Success", description: "Notification preferences updated." });
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to update.";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <FormCard title="Notification Preferences" icon={<Bell className="h-5 w-5" />}>
        <Skeleton className="h-48 w-full" />
      </FormCard>
    );
  }

  return (
    <FormCard title="Notification Preferences" icon={<Bell className="h-5 w-5" />}>
      <p className="text-sm text-muted-foreground mb-4">
        Choose which notifications your school receives.
      </p>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label>Fee payment reminders</Label>
            <p className="text-sm text-muted-foreground">Remind parents and staff about due fee installments</p>
          </div>
          <Switch
            checked={feeReminders}
            onCheckedChange={(checked) => {
              setFeeReminders(checked);
              updateNotification("feeReminders", checked);
            }}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label>Attendance alerts</Label>
            <p className="text-sm text-muted-foreground">Alerts for low attendance or absent students</p>
          </div>
          <Switch
            checked={attendanceAlerts}
            onCheckedChange={(checked) => {
              setAttendanceAlerts(checked);
              updateNotification("attendanceAlerts", checked);
            }}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label>Homework reminders</Label>
            <p className="text-sm text-muted-foreground">Reminders for pending homework and submissions</p>
          </div>
          <Switch
            checked={homeworkReminders}
            onCheckedChange={(checked) => {
              setHomeworkReminders(checked);
              updateNotification("homeworkReminders", checked);
            }}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label>Circulars &amp; notices</Label>
            <p className="text-sm text-muted-foreground">Notifications when new circulars are published</p>
          </div>
          <Switch
            checked={circulars}
            onCheckedChange={(checked) => {
              setCirculars(checked);
              updateNotification("circulars", checked);
            }}
          />
        </div>
      </div>
    </FormCard>
  );
}
