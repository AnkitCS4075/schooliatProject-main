"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCrmLeads, useCrmFunnel, useCreateCrmLead, useUpdateCrmLead, useAddCrmRemark, useDeleteCrmLead, type CrmLead } from "@/lib/hooks/use-crm";
import { useSchools } from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Search, Eye, Trash2, Phone, Building2 } from "lucide-react";

const STAGES = ["NEW", "CONTACTABLE", "CONTACTED", "CONNECTED", "FOLLOW_UP_SCHEDULED", "ADMISSION_DONE", "LOST"];
const STAGE_LABELS: Record<string, string> = { NEW: "New", CONTACTABLE: "Contactable", CONTACTED: "Contacted", CONNECTED: "Connected", FOLLOW_UP_SCHEDULED: "Follow-up", ADMISSION_DONE: "Admitted", LOST: "Lost" };
const STAGE_COLORS: Record<string, string> = { NEW: "bg-gray-100 text-gray-800", CONTACTABLE: "bg-blue-100 text-blue-800", CONTACTED: "bg-yellow-100 text-yellow-800", CONNECTED: "bg-purple-100 text-purple-800", FOLLOW_UP_SCHEDULED: "bg-orange-100 text-orange-800", ADMISSION_DONE: "bg-green-100 text-green-800", LOST: "bg-red-100 text-red-800" };
const SOURCES = ["STUDENT_REFERRAL", "PARENT_REFERRAL", "SALES_DEPARTMENT", "GATE_ENTRY", "GATE_WALK_IN"];
const SOURCE_LABELS: Record<string, string> = { STUDENT_REFERRAL: "Student Referral", PARENT_REFERRAL: "Parent Referral", SALES_DEPARTMENT: "Sales Dept", GATE_ENTRY: "Gate Entry", GATE_WALK_IN: "Gate Walk-in" };
const FOLLOW_UP_STATUSES = ["PENDING", "INTERESTED", "NOT_INTERESTED", "CONVERTED", "LOST"];
const FOLLOW_UP_LABELS: Record<string, string> = { PENDING: "Pending", INTERESTED: "Interested", NOT_INTERESTED: "Not Interested", CONVERTED: "Converted", LOST: "Lost" };
const FOLLOW_UP_COLORS: Record<string, string> = { PENDING: "bg-gray-100 text-gray-800", INTERESTED: "bg-green-100 text-green-800", NOT_INTERESTED: "bg-yellow-100 text-yellow-800", CONVERTED: "bg-blue-100 text-blue-800", LOST: "bg-red-100 text-red-800" };
const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "class", label: "Class Interested" },
  { value: "followUpStatus", label: "Follow-up Status" },
  { value: "followUpDate", label: "Follow-up Date" },
];

interface SchoolOption {
  id: string;
  name: string;
  code: string;
}

interface CrmLeadListResponse {
  data: CrmLead[];
  totalPages: number;
}

interface CrmFunnelData {
  stages: { NEW: number; CONTACTABLE: number; CONTACTED: number; CONNECTED: number; FOLLOW_UP_SCHEDULED: number; ADMISSION_DONE: number; LOST: number };
}

export function SuperAdminLeadsManagement() {
  const searchParams = useSearchParams();
  const leadParam = searchParams.get("lead");
  const [page, setPage] = useState(1);
  const [stageFilter, setStageFilter] = useState("");
  const [followUpFilter, setFollowUpFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [addOpen, setAddOpen] = useState(false);
  const [viewLead, setViewLead] = useState<CrmLead | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [seenParam, setSeenParam] = useState<string | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [form, setForm] = useState({ schoolId: "", name: "", phone: "", source: "", category: "", classInterestedIn: "", purposeOfVisit: "", remarks: "" });
  const { toast } = useToast();

  const filters = {
    page,
    limit: 15,
    sortBy,
    sortOrder,
    ...(stageFilter && { stage: stageFilter }),
    ...(followUpFilter && { followUpStatus: followUpFilter }),
    ...(schoolFilter && { schoolId: schoolFilter }),
    ...(search && { search }),
  };
  const { data, isLoading } = useCrmLeads(filters);
  const { data: funnelData } = useCrmFunnel();
  const { data: schoolsData } = useSchools();
  const schools = ((schoolsData as { data?: SchoolOption[] })?.data ?? []) as SchoolOption[];
  const createLead = useCreateCrmLead();
  const updateLead = useUpdateCrmLead();
  const addRemark = useAddCrmRemark();
  const deleteLead = useDeleteCrmLead();

  const leads = useMemo(() => ((data ?? {}) as CrmLeadListResponse).data ?? [], [data]);
  const totalPages = ((data ?? {}) as CrmLeadListResponse).totalPages ?? 1;
  const funnel = (funnelData as { data?: CrmFunnelData })?.data;

  // Deep-link (?lead=... from the Gate Entry page): open the dialog once that row loads.
  // Uses React's "adjust state during render" pattern (guarded, so it runs only once per param).
  if (leadParam && leadParam !== seenParam) {
    const match = leads.find((l) => l.id === leadParam);
    if (match) {
      setSeenParam(leadParam);
      setViewLead(match);
      setViewOpen(true);
    }
  }

  const handleCreate = async () => {
    if (!form.schoolId || !form.name || !form.phone || !form.source) {
      toast({ title: "Validation Error", description: "School, name, phone, and source are required", variant: "destructive" });
      return;
    }
    try {
      await createLead.mutateAsync(form);
      toast({ title: "Success", description: "Lead created" });
      setAddOpen(false);
      setForm({ schoolId: "", name: "", phone: "", source: "", category: "", classInterestedIn: "", purposeOfVisit: "", remarks: "" });
    } catch {
      toast({ title: "Error", description: "Failed to create lead", variant: "destructive" });
    }
  };

  const handleStageChange = async (leadId: string, newStage: string) => {
    try {
      await updateLead.mutateAsync({ id: leadId, data: { stage: newStage } });
      toast({ title: "Success", description: "Stage updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update stage", variant: "destructive" });
    }
  };

  const handleFollowUpChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLead.mutateAsync({ id: leadId, data: { followUpStatus: newStatus } });
      toast({ title: "Success", description: "Follow-up status updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleAddRemark = async () => {
    if (!remarkText.trim() || !viewLead) return;
    try {
      await addRemark.mutateAsync({ leadId: viewLead.id, content: remarkText });
      toast({ title: "Success", description: "Remark added" });
      setRemarkText("");
      setViewOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to add remark", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    try {
      await deleteLead.mutateAsync(id);
      toast({ title: "Success", description: "Lead deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads — All Schools</h1>
          <p className="text-muted-foreground text-sm mt-1">Every school&apos;s CRM leads in one place. Filter by school, update stages, or log a new lead on behalf of a school.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Lead</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New Lead</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>School *</Label>
                <Select value={form.schoolId} onValueChange={(v) => setForm({ ...form, schoolId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                  <SelectContent>{schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Source *</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{SOURCE_LABELS[s]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Admission" /></div>
              <div><Label>Class Interested In</Label><Input value={form.classInterestedIn} onChange={(e) => setForm({ ...form, classInterestedIn: e.target.value })} placeholder="e.g. Nursery, Grade 1" /></div>
              <div><Label>Purpose of Visit</Label><Input value={form.purposeOfVisit} onChange={(e) => setForm({ ...form, purposeOfVisit: e.target.value })} placeholder="e.g. Admission enquiry" /></div>
              <div><Label>Initial Remark</Label><Input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="First note..." /></div>
              <Button onClick={handleCreate} disabled={createLead.isPending} className="w-full">{createLead.isPending ? "Creating..." : "Create Lead"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {funnel && (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {STAGES.map((s) => (
            <Card key={s} className="cursor-pointer hover:ring-2 hover:ring-primary/20" onClick={() => { setStageFilter(stageFilter === s ? "" : s); setPage(1); }}>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold">{funnel.stages[s as keyof CrmFunnelData["stages"]] ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">{STAGE_LABELS[s]}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search name or phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        <Select value={schoolFilter} onValueChange={(v) => { setSchoolFilter(v === "ALL" ? "" : v); setPage(1); }}><SelectTrigger className="w-56"><SelectValue placeholder="All schools" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Schools</SelectItem>{schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}</SelectContent></Select>
        <Select value={stageFilter} onValueChange={(v) => { setStageFilter(v === "ALL" ? "" : v); setPage(1); }}><SelectTrigger className="w-44"><SelectValue placeholder="All stages" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Stages</SelectItem>{STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}</SelectContent></Select>
        <Select value={followUpFilter} onValueChange={(v) => { setFollowUpFilter(v === "ALL" ? "" : v); setPage(1); }}><SelectTrigger className="w-48"><SelectValue placeholder="All follow-ups" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Follow-ups</SelectItem>{FOLLOW_UP_STATUSES.map((s) => <SelectItem key={s} value={s}>{FOLLOW_UP_LABELS[s]}</SelectItem>)}</SelectContent></Select>
        <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}><SelectTrigger className="w-48"><SelectValue placeholder="Sort by" /></SelectTrigger><SelectContent>{SORT_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>Sort: {s.label}</SelectItem>)}</SelectContent></Select>
        <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>School</TableHead><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Source</TableHead><TableHead>Stage</TableHead><TableHead>Follow-up</TableHead><TableHead>Class</TableHead><TableHead>Notes</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
            : leads.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No leads found</TableCell></TableRow>
            : leads.map((l) => (
              <TableRow key={l.id}>
                <TableCell><Badge variant="outline" className="bg-slate-100 text-slate-800"><Building2 className="h-3 w-3 mr-1" />{l.school?.code ?? "—"}</Badge></TableCell>
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell>
                  <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                    <Phone className="h-3.5 w-3.5" />{l.phone}
                  </a>
                </TableCell>
                <TableCell><Badge variant="outline">{SOURCE_LABELS[l.source] || l.source}</Badge></TableCell>
                <TableCell>
                  <Select value={l.stage} onValueChange={(v) => handleStageChange(l.id, v)}>
                    <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s} className="text-xs">{STAGE_LABELS[s]}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={l.followUpStatus || "PENDING"} onValueChange={(v) => handleFollowUpChange(l.id, v)}>
                    <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{FOLLOW_UP_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{FOLLOW_UP_LABELS[s]}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="mt-1"><Badge className={FOLLOW_UP_COLORS[l.followUpStatus || "PENDING"]}>{FOLLOW_UP_LABELS[l.followUpStatus || "PENDING"]}</Badge></div>
                </TableCell>
                <TableCell className="text-sm">{l.classInterestedIn || "-"}</TableCell>
                <TableCell><Badge variant="secondary">{l._count?.remarks ?? 0}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => { setViewLead(l); setViewOpen(true); }}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Lead: {viewLead?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">School:</span> {viewLead?.school?.name ?? "—"} <Badge variant="outline" className="ml-1">{viewLead?.school?.code ?? ""}</Badge></div>
            <div><span className="font-medium">Phone:</span> <a href={`tel:${viewLead?.phone}`} className="text-primary">{viewLead?.phone}</a></div>
            <div><span className="font-medium">Source:</span> {SOURCE_LABELS[viewLead?.source ?? ""] || viewLead?.source}</div>
            <div><span className="font-medium">Stage:</span> <Badge className={STAGE_COLORS[viewLead?.stage ?? ""] || ""}>{STAGE_LABELS[viewLead?.stage ?? ""] || viewLead?.stage}</Badge></div>
            <div><span className="font-medium">Follow-up Status:</span> {FOLLOW_UP_LABELS[viewLead?.followUpStatus ?? ""] || viewLead?.followUpStatus}</div>
            {viewLead?.classInterestedIn && <div><span className="font-medium">Class Interested In:</span> {viewLead.classInterestedIn}</div>}
            {viewLead?.purposeOfVisit && <div><span className="font-medium">Purpose of Visit:</span> {viewLead.purposeOfVisit}</div>}
            {viewLead?.nextFollowUpAt && <div><span className="font-medium">Next Follow-up:</span> {new Date(viewLead.nextFollowUpAt).toLocaleString("en-IN")}</div>}
            {viewLead?.gateEntries?.length ? <div><span className="font-medium">Gate Entries:</span> {viewLead.gateEntries.map((g) => `#${g.serialNo}`).join(", ")}</div> : null}
          </div>
          <div className="border-t pt-3 space-y-3 max-h-72 overflow-y-auto">
            <div className="text-sm font-medium">Call Notes &amp; Remarks</div>
            {viewLead?.remarks?.map((r) => (
              <div key={r.id} className="border rounded p-2 text-sm">
                <div className="font-medium">{r.author?.firstName} {r.author?.lastName}</div>
                <div className="text-muted-foreground text-xs">{new Date(r.createdAt).toLocaleString("en-IN")}</div>
                <div className="mt-1">{r.content}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input placeholder="Add a remark..." value={remarkText} onChange={(e) => setRemarkText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddRemark()} />
            <Button size="sm" onClick={handleAddRemark} disabled={addRemark.isPending}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="py-2 px-3 text-sm">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
