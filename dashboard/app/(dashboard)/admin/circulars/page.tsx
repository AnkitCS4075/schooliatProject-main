"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CircularsTable } from "@/components/circulars/circulars-table";
import { useNoticesPage, useDeleteNotice, useBulkDeleteNotices } from "@/lib/hooks/use-notices";
import { useToast } from "@/hooks/use-toast";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";

type NoticeOtpTarget =
  | { mode: "one"; id: string }
  | { mode: "bulk"; ids: string[] };

export default function CircularsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [noticeOtpTarget, setNoticeOtpTarget] = useState<NoticeOtpTarget | null>(null);
  const limit = 15;

  const { data, isLoading, isError, error, isFetching, refetch } = useNoticesPage(page, limit);
  const deleteNotice = useDeleteNotice();
  const bulkDeleteNotices = useBulkDeleteNotices();

  const notices = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleAddNew = useCallback(() => {
    router.push("/admin/circulars/add");
  }, [router]);

  const handleEdit = useCallback(
    (notice: any) => {
      sessionStorage.setItem("editingNotice", JSON.stringify(notice));
      router.push(`/admin/circulars/${notice.id}/edit`);
    },
    [router]
  );

  const handleDelete = useCallback((noticeId: string) => {
    setNoticeOtpTarget({ mode: "one", id: noticeId });
  }, []);

  const handleBulkDelete = useCallback((ids: string[]) => {
    setNoticeOtpTarget({ mode: "bulk", ids });
  }, []);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notices...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error?.message || "Failed to load notices"}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-in-out"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <CircularsTable
        notices={notices}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        page={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
        serverTotalPages={totalPages}
        loading={
          isFetching || deleteNotice.isPending || bulkDeleteNotices.isPending
        }
        onRefresh={refetch}
      />

      <DeletionOtpDialog
        open={!!noticeOtpTarget}
        onOpenChange={(open) => !open && setNoticeOtpTarget(null)}
        audience="school-admin"
        title={
          noticeOtpTarget?.mode === "bulk"
            ? `Delete ${noticeOtpTarget.ids.length} notice(s)`
            : "Delete notice"
        }
        description="This removes the notice from your school. Confirm with the code sent to your deletion email."
        entityType={SCHOOL_DELETION_ENTITY.NOTICE}
        entityId={
          noticeOtpTarget?.mode === "one"
            ? noticeOtpTarget.id
            : noticeOtpTarget
              ? `bulk:${noticeOtpTarget.ids.length}`
              : ""
        }
        isDeleting={deleteNotice.isPending || bulkDeleteNotices.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!noticeOtpTarget) return;
          if (noticeOtpTarget.mode === "one") {
            await deleteNotice.mutateAsync({ id: noticeOtpTarget.id, otp });
            toast({
              title: "Success",
              description: "Notice deleted successfully!",
              variant: "default",
            });
          } else {
            const res = await bulkDeleteNotices.mutateAsync({
              noticeIds: noticeOtpTarget.ids,
              otp,
            });
            const n =
              (res as { data?: { count?: number } })?.data?.count ??
              noticeOtpTarget.ids.length;
            toast({
              title: "Success",
              description: `${n} notice(s) deleted successfully!`,
              variant: "default",
            });
          }
          refetch();
        }}
      />
    </div>
  );
}

