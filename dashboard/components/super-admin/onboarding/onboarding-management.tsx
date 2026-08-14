"use client";

import { useState } from "react";
import {
  useOnboardings,
  useCreateOnboarding,
  useDeleteOnboarding,
  useGenerateContract,
  useConfirmContract,
  useActivateOnboarding,
  useCompleteOnboarding,
  useCancelOnboarding,
  useOnboardingStats,
} from "@/lib/hooks/use-onboarding";
import { getFile } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Send,
  Trash2,
  Eye,
  Building2,
  Mail,
  Phone,
  Calendar,
  IndianRupee,
  Download,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  CONTRACT_SENT: "bg-blue-100 text-blue-800",
  CONTRACT_CONFIRMED: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const defaultForm = {
  schoolName: "",
  schoolAddress: "",
  schoolContactNumber: "",
  principalPhone: "",
  managementPhone: "",
  pointOfContactName: "",
  pointOfContactDesignation: "",
  concernedEmail: "",
  pricingPerStudent: "",
  pricingPerMonth: "",
  contractDurationYears: "1",
  paymentMode: "",
  paymentTermsDays: "",
  terminationNoticePeriod: "",
  notes: "",
};

export function OnboardingManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showContract, setShowContract] = useState<string | null>(null);
  const [contractHtml, setContractHtml] = useState("");
  const [form, setForm] = useState(defaultForm);

  const { data: statsData } = useOnboardingStats();
  const { data, isLoading } = useOnboardings({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
  });
  const createMutation = useCreateOnboarding();
  const deleteMutation = useDeleteOnboarding();
  const genContract = useGenerateContract();
  const confirmMutation = useConfirmContract();
  const activateMutation = useActivateOnboarding();
  const completeMutation = useCompleteOnboarding();
  const cancelMutation = useCancelOnboarding();

  const items = data?.data?.items || [];
  const stats = statsData?.data;

  const handleCreate = async () => {
    try {
      const payload: any = { ...form };
      if (payload.pricingPerStudent) payload.pricingPerStudent = Number(payload.pricingPerStudent);
      if (payload.pricingPerMonth) payload.pricingPerMonth = Number(payload.pricingPerMonth);
      if (payload.contractDurationYears) payload.contractDurationYears = Number(payload.contractDurationYears);
      if (payload.paymentTermsDays) payload.paymentTermsDays = Number(payload.paymentTermsDays);
      if (payload.terminationNoticePeriod) payload.terminationNoticePeriod = Number(payload.terminationNoticePeriod);
      await createMutation.mutateAsync(payload);
      toast.success("Onboarding created");
      setShowCreate(false);
      setForm(defaultForm);
    } catch (err: any) {
      toast.error(err.message || "Failed to create");
    }
  };

  const handleGenerateContract = async (id: string) => {
    try {
      const result = await genContract.mutateAsync(id);
      setContractHtml(result.data?.contractHtml || "");
      setShowContract(id);
      toast.success("Contract generated");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate");
    }
  };

  const handleViewContract = async (id: string) => {
    setShowContract(id);
    setContractHtml("");
    try {
      const result = await fetch(`/api/v1/school-onboardings/${id}/contract`, {
        headers: {
          "x-platform": "web",
          Authorization: `Bearer ${
            typeof window !== "undefined"
              ? window.sessionStorage.getItem("accessToken") || ""
              : ""
          }`,
        },
      }).then((r) => r.json());
      setContractHtml(result?.data?.contractHtml || "");
    } catch {
      toast.error("Failed to load contract");
    }
  };

  const handleAction = async (
    action: string,
    id: string,
    fn: () => Promise<any>,
    label: string
  ) => {
    try {
      await fn();
      toast.success(label);
    } catch (err: any) {
      toast.error(err.message || `Failed: ${label}`);
    }
  };

  const getField = (label: string, key: string, type = "text") => (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type={type}
        value={(form as any)[key] || ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">School Onboarding</h1>
          <p className="text-muted-foreground">Manage school registrations and auto-generated contracts</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> New Onboarding</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New School Onboarding</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {getField("School Name *", "schoolName")}
              {getField("School Address *", "schoolAddress")}
              {getField("School Contact *", "schoolContactNumber")}
              {getField("Concerned Email *", "concernedEmail")}
              {getField("Principal Phone", "principalPhone")}
              {getField("Management Phone", "managementPhone")}
              {getField("POC Name", "pointOfContactName")}
              {getField("POC Designation", "pointOfContactDesignation")}
              {getField("Pricing/Student (₹)", "pricingPerStudent", "number")}
              {getField("Monthly Pricing (₹)", "pricingPerMonth", "number")}
              {getField("Contract Duration (years)", "contractDurationYears", "number")}
              {getField("Payment Terms (days)", "paymentTermsDays", "number")}
              {getField("Termination Notice (months)", "terminationNoticePeriod", "number")}
              <div className="space-y-1">
                <Label>Payment Mode</Label>
                <Select value={form.paymentMode} onValueChange={(v) => setForm({ ...form, paymentMode: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Onboarding"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(["DRAFT", "CONTRACT_SENT", "CONTRACT_CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((s) => {
            const count = stats.byStatus?.find((b: any) => b.status === s)?._count || 0;
            return (
              <Card key={s} className={`cursor-pointer hover:shadow-md transition ${statusFilter === s ? "ring-2 ring-primary" : ""}`} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <Badge className={STATUS_COLORS[s]}>{s.replace("_", " ")}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by school name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No onboardings found</p>
          ) : (
            <div className="space-y-3">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.schoolName}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{item.concernedEmail}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{item.schoolContactNumber}</span>
                      {item.contractAcceptedAt && (
                        <span className="flex items-center gap-1 text-green-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Accepted {new Date(item.contractAcceptedAt).toLocaleDateString("en-IN")}
                          {item.acceptedByEmail ? ` by ${item.acceptedByEmail}` : ""}
                          {item.acceptedByIp ? ` (IP ${item.acceptedByIp})` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className={STATUS_COLORS[item.status]}>{item.status.replace("_", " ")}</Badge>
                  <div className="flex items-center gap-1">
                    {item.status === "DRAFT" && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleGenerateContract(item.id)} disabled={genContract.isPending}>
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => cancelMutation.mutateAsync(item.id)} className="text-red-600 hover:text-red-700">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {item.status === "CONTRACT_SENT" && (
                      <Button variant="ghost" size="sm" onClick={() => confirmMutation.mutateAsync(item.id)}>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                    )}
                    {item.status === "CONTRACT_CONFIRMED" && (
                      <Button variant="ghost" size="sm" onClick={() => completeMutation.mutateAsync(item.id)}>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                    )}
                    {(item.status === "CONTRACT_CONFIRMED" ||
                      (item.status === "COMPLETED" && item.school?.contractStatus !== "ACTIVE")) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => activateMutation.mutateAsync(item.id)}
                        disabled={activateMutation.isPending}
                        title="Activate school account"
                      >
                        {activateMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                    )}
                    {item.contractFile?.id && (
                      <Button variant="ghost" size="sm" asChild title="Download contract PDF">
                        <a href={getFile(item.contractFile.id)} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleViewContract(item.id)} title="View contract">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutateAsync(item.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!showContract} onOpenChange={() => { setShowContract(null); setContractHtml(""); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Generated Contract</DialogTitle></DialogHeader>
          {contractHtml && <div className="border rounded p-4" dangerouslySetInnerHTML={{ __html: contractHtml }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
