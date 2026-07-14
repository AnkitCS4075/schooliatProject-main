"use client";

import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentFormData } from "@/lib/schemas/fees-schema";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  installment: any;
  isSubmitting: boolean;
}

function formatCurrency(num: number | string | null | undefined): string {
  return `₹${Number(num || 0).toLocaleString("en-IN")}`;
}

export function PaymentModal({
  visible,
  onClose,
  onSubmit,
  installment,
  isSubmitting,
}: PaymentModalProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      isWaiver: false,
    },
  });

  const isWaiver = watch("isWaiver");

  const onFormSubmit = async (data: PaymentFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch {
      // Error handling is done in parent
    }
  };

  const remainingAmount = installment?.remainingAmount || 0;
  const paidSoFar = Number(installment?.paidAmount ?? 0);
  const isFirstPaymentOnRow = paidSoFar <= 0;
  const submitLabel = isWaiver
    ? "Apply waiver & generate receipt"
    : isFirstPaymentOnRow
      ? "Mark paid & generate receipt"
      : "Record payment & generate receipt";

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          {installment?.studentId ? (
            <p className="text-sm text-muted-foreground pt-1">
              <Link
                href={`/admin/students/${installment.studentId}`}
                className="text-primary font-medium hover:underline"
              >
                Open student profile
              </Link>
            </p>
          ) : null}
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Controller
              name="isWaiver"
              control={control}
              render={({ field }) => (
                <Switch
                  id="isWaiver"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="isWaiver">Waive this Installment</Label>
          </div>

          <div className={`space-y-4 ${isWaiver ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errors.paymentMethod ? "border-red-500" : ""}>
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash (Offline)</SelectItem>
                        <SelectItem value="CHEQUE">Cheque (Offline)</SelectItem>
                        <SelectItem value="UPI">UPI (Online)</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer (Online)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.paymentMethod && (
                  <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="0.00"
                  max={remainingAmount}
                  className={errors.amount ? "border-red-500" : ""}
                  disabled={isWaiver}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction / Ref ID (for Online/Bank)</Label>
              <Input
                id="transactionId"
                {...register("transactionId")}
                placeholder="UTR / UPI Ref / Cheque No."
                className={errors.transactionId ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks / Internal Notes</Label>
              <Input
                id="remarks"
                {...register("remarks")}
                placeholder="Any additional details..."
                className={errors.remarks ? "border-red-500" : ""}
              />
            </div>
          </div>

          <div className="pt-4 border-t flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              A fee receipt is generated on the server when you confirm; it opens automatically after success when available.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
