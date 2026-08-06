"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock, Inbox } from "lucide-react";
import {
  usePendingApprovals,
  useApprovalHistory,
  useDecideApproval,
} from "@/lib/hooks/use-approvals";
import { toast } from "sonner";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function personName(p: { firstName?: string | null; lastName?: string | null; role?: string | null } | null | undefined) {
  if (!p) return "—";
  return [p.firstName, p.lastName].filter(Boolean).join(" ") || "—";
}

const MODULE_BADGE_VARIANTS: Record<string, string> = {
  LEAVE: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  EVENT: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  GALLERY: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  QUOTATION: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  FEE_WAIVER: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  TRANSFER_CERTIFICATE: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
};

function ModuleBadge({ module }: { module: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${MODULE_BADGE_VARIANTS[module] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
      {module.replaceAll("_", " ")}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "PENDING") {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
        <Clock className="mr-1 h-3 w-3" /> Pending
      </Badge>
    );
  }
  if (status === "APPROVED") {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
        <CheckCircle className="mr-1 h-3 w-3" /> Approved
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
      <XCircle className="mr-1 h-3 w-3" /> Rejected
    </Badge>
  );
}

function DecisionDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  action,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (remarks: string) => void;
  title: string;
  action: "APPROVE" | "REJECT";
}) {
  const [remarks, setRemarks] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setRemarks(""); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {action === "APPROVE" ? "Approve" : "Reject"} {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Remarks {action === "REJECT" ? "(recommended)" : "(optional)"}</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder={action === "REJECT" ? "Why is this being rejected?" : "Optional note for the requester"}
            />
          </div>
          <Button
            variant={action === "APPROVE" ? "default" : "destructive"}
            onClick={() => { onConfirm(remarks); setRemarks(""); }}
            className="w-full"
          >
            {action === "APPROVE" ? "Confirm Approval" : "Confirm Rejection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ApprovalManagement() {
  const [decisionDialog, setDecisionDialog] = useState<{
    request: any;
    action: "APPROVE" | "REJECT";
  } | null>(null);
  const [historyStatus, setHistoryStatus] = useState<string>("all");
  const [historyModule, setHistoryModule] = useState<string>("all");

  const { data: pendingData, isLoading: loadingPending } = usePendingApprovals();
  const { data: historyData, isLoading: loadingHistory } = useApprovalHistory({
    status: historyStatus === "all" ? undefined : historyStatus,
    module: historyModule === "all" ? undefined : historyModule,
  });
  const decide = useDecideApproval();

  const pending = (pendingData as any)?.data || [];
  const history = (historyData as any)?.data?.requests || [];
  const historyPagination = (historyData as any)?.data?.pagination;

  const handleDecision = async (remarks: string) => {
    if (!decisionDialog) return;
    try {
      await decide.mutateAsync({
        id: decisionDialog.request.id,
        action: decisionDialog.action,
        remarks: remarks?.trim() || undefined,
      });
      toast.success(
        decisionDialog.action === "APPROVE" ? "Request approved" : "Request rejected"
      );
      setDecisionDialog(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update approval");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Approvals</h1>
          <p className="text-muted-foreground text-sm">
            Review and approve leave, fee waivers, transfer certificates, quotations, events and gallery albums
          </p>
        </div>
        {pending.length > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            <AlertCircle className="mr-1 h-4 w-4" /> {pending.length} pending
          </Badge>
        )}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {loadingPending ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : pending.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Inbox className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No requests pending approval</p>
              </CardContent>
            </Card>
          ) : (
            pending.map((r: any) => (
              <Card key={r.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <ModuleBadge module={r.module} />
                        <h3 className="font-semibold">{r.title}</h3>
                      </div>
                      {r.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Requested by <span className="font-medium">{personName(r.requester)}</span>{r.requester?.role ? ` (${r.requester.role.replaceAll("_", " ")})` : ""}</span>
                        <span>Created {formatDate(r.createdAt)}</span>
                        {r.approver && <span>Assigned to {personName(r.approver)}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={decide.isPending}
                        onClick={() => setDecisionDialog({ request: r, action: "APPROVE" })}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={decide.isPending}
                        onClick={() => setDecisionDialog({ request: r, action: "REJECT" })}
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Select value={historyModule} onValueChange={setHistoryModule}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="All modules" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modules</SelectItem>
                <SelectItem value="LEAVE">Leave Request</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
                <SelectItem value="GALLERY">Gallery Album</SelectItem>
                <SelectItem value="QUOTATION">Quotation</SelectItem>
                <SelectItem value="FEE_WAIVER">Fee Waiver</SelectItem>
                <SelectItem value="TRANSFER_CERTIFICATE">Transfer Certificate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={historyStatus} onValueChange={setHistoryStatus}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Inbox className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No approval history</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Decided By</TableHead>
                      <TableHead>Decided At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="font-medium">{r.title}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</div>
                        </TableCell>
                        <TableCell><ModuleBadge module={r.module} /></TableCell>
                        <TableCell>{personName(r.requester)}</TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                        <TableCell className="max-w-[240px] text-sm text-muted-foreground">
                          {r.remarks || "—"}
                        </TableCell>
                        <TableCell>
                          <div>{personName(r.decider)}</div>
                          {r.decider?.role && <div className="text-xs text-muted-foreground">{r.decider.role.replaceAll("_", " ")}</div>}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">{formatDateTime(r.decidedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          {historyPagination && historyPagination.totalPages > 1 && (
            <div className="text-xs text-muted-foreground mt-2">
              Page {historyPagination.page} of {historyPagination.totalPages} · {historyPagination.total} records
            </div>
          )}
        </TabsContent>
      </Tabs>

      <DecisionDialog
        open={!!decisionDialog}
        onOpenChange={() => setDecisionDialog(null)}
        onConfirm={handleDecision}
        action={decisionDialog?.action || "APPROVE"}
        title={decisionDialog ? `"${decisionDialog.request.title}"` : ""}
      />
    </div>
  );
}
