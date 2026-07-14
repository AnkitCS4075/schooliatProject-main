"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCancelFeeInstallment } from "@/lib/hooks/use-fees";
import { useToast } from "@/hooks/use-toast";

interface CancelFeeInstallmentModalProps {
  visible: boolean;
  onClose: () => void;
  installment: { id: string; installementNumber?: number } | null;
  onSuccess: () => void;
}

export function CancelFeeInstallmentModal({
  visible,
  onClose,
  installment,
  onSuccess,
}: CancelFeeInstallmentModalProps) {
  const { toast } = useToast();
  const cancelMut = useCancelFeeInstallment();
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!installment?.id) return;
    try {
      await cancelMut.mutateAsync({
        installmentId: installment.id,
        reason: reason.trim() || undefined,
      });
      toast({ title: "Cancelled", description: "Installment has been cancelled." });
      handleClose();
      onSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Request failed";
      toast({
        title: "Could not cancel",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Cancel installment
            {installment?.installementNumber != null
              ? ` #${installment.installementNumber}`
              : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Cancelling reverses recorded payments on this row for totals and marks the installment as
            cancelled. This action requires the Record fee payment permission.
          </p>
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="e.g. Duplicate entry, transferred out"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose} disabled={cancelMut.isPending}>
              Back
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleSubmit}
              disabled={cancelMut.isPending}
            >
              {cancelMut.isPending ? "Cancelling…" : "Confirm cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
