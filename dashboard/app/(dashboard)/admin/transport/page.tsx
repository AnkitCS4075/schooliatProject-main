"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TransportTable } from "@/components/transport/transport-table";
import { useVehiclesPage, useDeleteVehicle, useBulkDeleteTransports } from "@/lib/hooks/use-transport";
import { useToast } from "@/hooks/use-toast";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";

type TransportOtpTarget =
  | { mode: "one"; id: string }
  | { mode: "bulk"; ids: string[] };

export default function TransportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [transportOtpTarget, setTransportOtpTarget] = useState<TransportOtpTarget | null>(null);
  const limit = 15;

  const { data, isLoading, isError, error, isFetching, refetch } = useVehiclesPage(page, limit);
  const deleteVehicle = useDeleteVehicle();
  const bulkDeleteTransports = useBulkDeleteTransports();

  const transports = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleAddNew = useCallback(() => {
    router.push("/admin/transport/add");
  }, [router]);

  const handleEdit = useCallback(
    (transport: any) => {
      sessionStorage.setItem("editingTransport", JSON.stringify(transport));
      router.push(`/admin/transport/${transport.id}/edit`);
    },
    [router]
  );

  const handleDelete = useCallback((transportId: string) => {
    setTransportOtpTarget({ mode: "one", id: transportId });
  }, []);

  const handleBulkDelete = useCallback((ids: string[]) => {
    setTransportOtpTarget({ mode: "bulk", ids });
  }, []);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transports...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error?.message || "Failed to load transports"}</p>
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
      <TransportTable
        transports={transports}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        page={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
        serverTotalPages={totalPages}
        loading={
          isFetching || deleteVehicle.isPending || bulkDeleteTransports.isPending
        }
        onRefresh={refetch}
      />

      <DeletionOtpDialog
        open={!!transportOtpTarget}
        onOpenChange={(open) => !open && setTransportOtpTarget(null)}
        audience="school-admin"
        title={
          transportOtpTarget?.mode === "bulk"
            ? `Delete ${transportOtpTarget.ids.length} vehicle(s)`
            : "Delete vehicle"
        }
        description="This removes the transport record from your school. Confirm with the code sent to your deletion email."
        entityType={SCHOOL_DELETION_ENTITY.TRANSPORT}
        entityId={
          transportOtpTarget?.mode === "one"
            ? transportOtpTarget.id
            : transportOtpTarget
              ? `bulk:${transportOtpTarget.ids.length}`
              : ""
        }
        isDeleting={deleteVehicle.isPending || bulkDeleteTransports.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!transportOtpTarget) return;
          if (transportOtpTarget.mode === "one") {
            await deleteVehicle.mutateAsync({ id: transportOtpTarget.id, otp });
            toast({ title: "Success", description: "Transport deleted successfully!" });
          } else {
            const res = await bulkDeleteTransports.mutateAsync({
              transportIds: transportOtpTarget.ids,
              otp,
            });
            const n =
              (res as { data?: { count?: number } })?.data?.count ??
              transportOtpTarget.ids.length;
            toast({
              title: "Success",
              description: `${n} transport(s) deleted successfully!`,
            });
          }
          refetch();
        }}
      />
    </div>
  );
}

