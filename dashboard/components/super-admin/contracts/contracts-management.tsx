"use client";

import { useState } from "react";
import {
  useOnboardings,
  useActivateOnboarding,
  useContractHtml,
} from "@/lib/hooks/use-onboarding";
import { getFile } from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  FileText,
  Download,
  ShieldCheck,
  Building2,
  Mail,
  Clock,
  CheckCircle2,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  CONTRACT_SENT: "bg-blue-100 text-blue-800",
  CONTRACT_CONFIRMED: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const SCHOOL_STATUS_LABELS: Record<string, string> = {
  PENDING_CONTRACT: "Pending Contract",
  CONTRACT_ACCEPTED: "Contract Accepted — Awaiting Activation",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
};

interface ContractItem {
  id: string;
  schoolName: string;
  concernedEmail: string;
  status: string;
  contractAcceptedAt?: string | null;
  acceptedByEmail?: string | null;
  acceptedByIp?: string | null;
  school?: { contractStatus?: string | null };
  contractFile?: { id: string; name?: string | null };
}

function fmtDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ContractsManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewContract, setViewContract] = useState<string | null>(null);

  const { data, isLoading } = useOnboardings({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
  });
  const activateMutation = useActivateOnboarding();
  const { data: contractData, isLoading: contractLoading } =
    useContractHtml(viewContract || "");

  const items = data?.data?.items || [];

  const canActivate = (item: ContractItem) =>
    item.status === "CONTRACT_CONFIRMED" ||
    (item.status === "COMPLETED" && item.school?.contractStatus !== "ACTIVE");

  const handleActivate = async (item: ContractItem) => {
    try {
      await activateMutation.mutateAsync(item.id);
      toast.success(`${item.schoolName} activated. Welcome email sent.`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to activate school",
      );
    }
  };

  const statusCount = (s: string) => {
    const rows = (data?.data?.items || []).filter(
      (i: ContractItem) => i.status === s,
    );
    return rows.length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contracts</h1>
        <p className="text-muted-foreground">
          School contracts, acceptance status &amp; activation
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            ["CONTRACT_SENT", "Pending Acceptance", "bg-blue-50"],
            ["CONTRACT_CONFIRMED", "Accepted — Awaiting Activation", "bg-yellow-50"],
            ["COMPLETED", "Active", "bg-green-50"],
            ["CANCELLED", "Cancelled", "bg-red-50"],
          ] as const
        ).map(([s, label, cls]) => (
          <Card
            key={s}
            className={`cursor-pointer hover:shadow-md transition ${statusFilter === s ? "ring-2 ring-primary" : ""}`}
            onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
          >
            <CardContent className={`p-4 ${cls} rounded-lg`}>
              <p className="text-2xl font-bold">{statusCount(s)}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by school name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              No contracts found
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item: ContractItem) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 transition"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{item.schoolName}</h3>
                      <Badge className={STATUS_COLORS[item.status]}>
                        {item.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">
                        {item.school?.contractStatus
                          ? SCHOOL_STATUS_LABELS[item.school.contractStatus] ||
                            item.school.contractStatus
                          : "—"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {item.concernedEmail}
                      </span>
                      {item.contractAcceptedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          Accepted {fmtDate(item.contractAcceptedAt)}
                          {item.acceptedByEmail ? ` by ${item.acceptedByEmail}` : ""}
                        </span>
                      )}
                      {item.acceptedByIp && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> IP {item.acceptedByIp}
                        </span>
                      )}
                      {!item.contractAcceptedAt && item.status === "CONTRACT_SENT" && (
                        <span className="text-amber-600">
                          Awaiting school acceptance
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:justify-end">
                    {canActivate(item) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivate(item)}
                        disabled={activateMutation.isPending}
                        className="text-green-700 border-green-300 hover:bg-green-50"
                      >
                        {activateMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                        <span className="ml-1">Activate</span>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setViewContract(item.id)}>
                      <Eye className="w-4 h-4" />
                      <span className="ml-1 hidden sm:inline">View</span>
                    </Button>
                    {item.contractFile?.id && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={getFile(item.contractFile.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4" />
                          <span className="ml-1 hidden sm:inline">
                            {item.contractFile.name?.includes(".pdf")
                              ? "PDF"
                              : "Download"}
                          </span>
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!viewContract}
        onOpenChange={() => {
          setViewContract(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Service Contract
              {contractLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </DialogTitle>
          </DialogHeader>
          {contractData?.data?.contractHtml ? (
            <div
              className="border rounded p-4"
              dangerouslySetInnerHTML={{ __html: contractData.data.contractHtml }}
            />
          ) : (
            <p className="text-muted-foreground py-6 text-center">
              {contractLoading ? "Loading contract..." : "Contract not available."}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
