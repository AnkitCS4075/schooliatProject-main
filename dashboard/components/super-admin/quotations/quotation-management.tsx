"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  usePlatformQuotations,
  usePlatformQuotationStats,
  useCreatePlatformQuotation,
} from "@/lib/hooks/use-platform-quotations";
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
  Plus,
  Search,
  Trash2,
  Eye,
  Building2,
  Mail,
  Phone,
  IndianRupee,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SENT: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-yellow-100 text-yellow-800",
};

const emptyModule = { moduleName: "", description: "", quantity: "1", unitPrice: "" };

const defaultForm = {
  schoolName: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  discountPercent: "",
  taxPercent: "18",
  validityDays: "30",
  termsAndConditions: "",
  notes: "",
  modules: [emptyModule],
};

export function QuotationManagement() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const { data: statsData } = usePlatformQuotationStats();
  const { data, isLoading } = usePlatformQuotations(1, 50, statusFilter === "all" ? undefined : statusFilter, search || undefined);
  const createMutation = useCreatePlatformQuotation();

  const items = data?.data?.items || [];
  const stats = statsData?.data;

  const updateModule = (idx: number, key: string, value: string) => {
    const modules = form.modules.map((m: any, i: number) => (i === idx ? { ...m, [key]: value } : m));
    setForm({ ...form, modules });
  };

  const addModule = () => setForm({ ...form, modules: [...form.modules, emptyModule] });
  const removeModule = (idx: number) =>
    setForm({ ...form, modules: form.modules.filter((_: any, i: number) => i !== idx) });

  const handleCreate = async () => {
    try {
      if (!form.schoolName.trim()) {
        toast.error("School name is required");
        return;
      }
      const itemsPayload = form.modules
        .map((m: any) => ({
          moduleName: m.moduleName.trim(),
          description: m.description.trim(),
          quantity: Number(m.quantity) || 1,
          unitPrice: Number(m.unitPrice) || 0,
        }))
        .filter((m: any) => m.moduleName);
      if (itemsPayload.length === 0) {
        toast.error("Add at least one module with a name and price");
        return;
      }
      const payload: any = {
        schoolName: form.schoolName.trim(),
        contactPerson: form.contactPerson.trim() || undefined,
        contactEmail: form.contactEmail.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        discountPercent: Number(form.discountPercent) || 0,
        taxPercent: Number(form.taxPercent) || 0,
        validityDays: Number(form.validityDays) || 30,
        termsAndConditions: form.termsAndConditions.trim() || undefined,
        notes: form.notes.trim() || undefined,
        modulesSelected: itemsPayload.map((m: any) => m.moduleName),
        items: itemsPayload,
      };
      const result = await createMutation.mutateAsync(payload);
      toast.success("Quotation created");
      setShowCreate(false);
      setForm(defaultForm);
      router.push(`/super-admin/quotations/${result.data?.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create");
    }
  };

  const getField = (label: string, key: string, type = "text", placeholder = "") => (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={(form as any)[key] || ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales Quotations</h1>
          <p className="text-muted-foreground">Create and send quotations to prospective schools</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> New Quotation</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Sales Quotation</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {getField("School Name *", "schoolName")}
              {getField("Contact Person", "contactPerson")}
              {getField("Contact Email", "contactEmail", "email")}
              {getField("Contact Phone", "contactPhone")}
            </div>

            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between">
                <Label>Modules & Pricing</Label>
                <Button type="button" variant="outline" size="sm" onClick={addModule}>
                  <Plus className="w-3 h-3 mr-1" /> Add Module
                </Button>
              </div>
              {form.modules.map((m: any, idx: number) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-start rounded-lg border p-2">
                  <div className="col-span-12 md:col-span-4 space-y-1">
                    <Input placeholder="Module name *" value={m.moduleName} onChange={(e) => updateModule(idx, "moduleName", e.target.value)} />
                  </div>
                  <div className="col-span-12 md:col-span-4 space-y-1">
                    <Input placeholder="Description" value={m.description} onChange={(e) => updateModule(idx, "description", e.target.value)} />
                  </div>
                  <div className="col-span-4 md:col-span-1 space-y-1">
                    <Input type="number" placeholder="Qty" value={m.quantity} onChange={(e) => updateModule(idx, "quantity", e.target.value)} />
                  </div>
                  <div className="col-span-7 md:col-span-2 space-y-1">
                    <Input type="number" placeholder="Unit price ₹" value={m.unitPrice} onChange={(e) => updateModule(idx, "unitPrice", e.target.value)} />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeModule(idx)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
              {getField("Discount (%)", "discountPercent", "number")}
              {getField("Tax (%)", "taxPercent", "number")}
              {getField("Validity (days)", "validityDays", "number")}
            </div>

            <div className="space-y-1 py-2">
              <Label>Terms &amp; Conditions</Label>
              <Textarea rows={3} value={form.termsAndConditions} onChange={(e) => setForm({ ...form, termsAndConditions: e.target.value })} />
            </div>
            <div className="space-y-1 py-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Quotation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"] as const).map((s) => (
            <Card key={s} className={`cursor-pointer hover:shadow-md transition ${statusFilter === s ? "ring-2 ring-primary" : ""}`} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{stats[s] || 0}</p>
                <Badge className={STATUS_COLORS[s]}>{s}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by school name, email or quotation number..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No quotations found</p>
          ) : (
            <div className="space-y-3">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition cursor-pointer" onClick={() => router.push(`/super-admin/quotations/${item.id}`)}>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{item.schoolName}</h3>
                      <span className="text-xs text-muted-foreground">{item.quotationNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {item.contactEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{item.contactEmail}</span>}
                      {item.contactPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{item.contactPhone}</span>}
                      <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{Number(item.totalAmount).toLocaleString("en-IN")}</span>
                      {item.validUntil && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.validUntil).toLocaleDateString("en-IN")}</span>}
                    </div>
                  </div>
                  <Badge className={STATUS_COLORS[item.status]}>{item.status}</Badge>
                  {item.onboarding && <Badge variant="outline">Onboarded</Badge>}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/super-admin/quotations/${item.id}`); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
