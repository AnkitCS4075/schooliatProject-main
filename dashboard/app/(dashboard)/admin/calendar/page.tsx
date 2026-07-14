"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarScreen } from "@/components/calendar/calendar-screen";
import {
  useDeleteCalendarEvent,
  useDeleteHoliday,
} from "@/lib/hooks/use-calendar";
import { useToast } from "@/hooks/use-toast";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";

type CalendarDeleteTarget =
  | { kind: "event"; id: string }
  | { kind: "holiday"; id: string };

export default function CalendarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const deleteCalendarEvent = useDeleteCalendarEvent();
  const deleteHoliday = useDeleteHoliday();
  const [deleteTarget, setDeleteTarget] = useState<CalendarDeleteTarget | null>(null);

  const handleEdit = useCallback(
    (item: any) => {
      sessionStorage.setItem("editingCalendarItem", JSON.stringify(item));
      router.push(`/admin/calendar/${item.id}/edit`);
    },
    [router]
  );

  const handleDelete = useCallback((item: any) => {
    const isHoliday = !item.dateType;
    setDeleteTarget(isHoliday ? { kind: "holiday", id: item.id } : { kind: "event", id: item.id });
  }, []);

  return (
    <div className="container mx-auto py-6 px-4">
      <CalendarScreen onEdit={handleEdit} onDelete={handleDelete} />

      <DeletionOtpDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        audience="school-admin"
        title={deleteTarget?.kind === "holiday" ? "Delete holiday" : "Delete calendar event"}
        description="Confirm with the code sent to your deletion email."
        entityType={
          deleteTarget?.kind === "holiday"
            ? SCHOOL_DELETION_ENTITY.HOLIDAY
            : SCHOOL_DELETION_ENTITY.CALENDAR_EVENT
        }
        entityId={deleteTarget?.id ?? ""}
        isDeleting={deleteCalendarEvent.isPending || deleteHoliday.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!deleteTarget) return;
          if (deleteTarget.kind === "holiday") {
            await deleteHoliday.mutateAsync({ id: deleteTarget.id, otp });
          } else {
            await deleteCalendarEvent.mutateAsync({ id: deleteTarget.id, otp });
          }
          toast({
            title: "Success",
            description: "Item deleted successfully!",
            variant: "default",
          });
        }}
      />
    </div>
  );
}

