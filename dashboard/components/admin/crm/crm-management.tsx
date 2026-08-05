"use client";

import { useState } from "react";
import { useCrmLeads, useCrmFunnel, useCreateCrmLead, useUpdateCrmLead, useAddCrmRemark, useDeleteCrmLead, useCrmAssignableUsers } from "@/lib/hooks/use-crm";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Search, Eye, Trash2, MessageSquare, ArrowRight } from "lucide-react";

const STAGES = ["NEW", "CONTACTABLE", "CONTACTED", "CONNECTED", "FOLLOW_UP_SCHEDULED", "ADMISSION_DONE", "LOST"];
const STAGE_LABELS: Record<string, string> = { NEW: "New", CONTACTABLE: "Contactable", CONTACTED: "Contacted", CONNECTED: "Connected", FOLLOW_UP_SCHEDULED: "Follow-up", ADMISSION_DONE: "Admitted", LOST: "Lost" };
const STAGE_COLORS: Record<string, string> = { NEW: "bg-gray-100 text-gray-800", CONTACTABLE: "bg-blue-100 text-blue-800", CONTACTED: "bg-yellow-100 text-yellow-800", CONNECTED: "bg-purple-100 text-purple-800", FOLLOW_UP_SCHEDULED: "bg-orange-100 text-orange-800", ADMISSION_DONE: "bg-green-100 text-green-800", LOST: "bg-red-100 text-red-800" };
const SOURCES = ["STUDENT_REFERRAL", "PARENT_REFERRAL", "SALES_DEPARTMENT", "GATE_ENTRY"];
const SOURCE_LABELS: Record<string, string> = { STUDENT_REFERRAL: "Student Referral", PARENT_REFERRAL: "Parent Referral", SALES_DEPARTMENT: "Sales Dept", GATE_ENTRY: "Gate Entry" };

export function CrmManagement() {
  const [page, setPage] = useState(1);
  const [stageFilter, setStageFilter] = useState("");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [viewLead, setViewLead] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", source: "", category: "", assignedToId: "", remarks: "" });
  const { toast } = useToast();

  const filters = { page, limit: 15, ...(stageFilter && { stage: stageFilter }), ...(search && { search }) };
  const { data, isLoading } = useCrmLeads(filters);
  const { data: funnelData } = useCrmFunnel();
  const { data: assignableUsers } = useCrmAssignableUsers();
  const assignees = (assignableUsers ?? []) as { id: string; firstName: string; lastName?: string }[];
  const createLead = useCreateCrmLead();
  const updateLead = useUpdateCrmLead();
  const addRemark = useAddCrmRemark();
  const deleteLead = useDeleteCrmLead();

  const leads = (data as any)?.data ?? [];
  const totalPages = (data as any)?.totalPages ?? 1;
  const funnel = (funnelData as any)?.data;

  const handleCreate = async () => {
    if (!form.name || !form.phone || !form.source) {
      toast({ title: "Validation Error", description: "Name, phone, and source are required", variant: "destructive" });
      return;
    }
    try {
      await createLead.mutateAsync({ ...form, assignedToId: form.assignedToId && form.assignedToId !== "none" ? form.assignedToId : undefined });
      toast({ title: "Success", description: "Lead created" });
      setAddOpen(false);
      setForm({ name: "", phone: "", source: "", category: "", assignedToId: "", remarks: "" });
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

  const handleReassign = async (leadId: string, assignedToId: string) => {
    try {
      await updateLead.mutateAsync({ id: leadId, data: { assignedToId: assignedToId === "none" ? null : assignedToId } });
      toast({ title: "Success", description: "Assignment updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update assignment", variant: "destructive" });
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
        <h1 className="text-2xl font-bold">CRM &amp; Lead Management</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Lead</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New Lead</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Source *</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{SOURCE_LABELS[s]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Admission" /></div>
              <div><Label>Assign To</Label>
                <Select value={form.assignedToId} onValueChange={(v) => setForm({ ...form, assignedToId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select teacher/staff" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Unassigned</SelectItem>{assignees.map((u) => <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName || ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
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
                <div className="text-2xl font-bold">{funnel.stages[s] ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">{STAGE_LABELS[s]}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search name or phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        <Select value={stageFilter} onValueChange={(v) => { setStageFilter(v === "ALL" ? "" : v); setPage(1); }}><SelectTrigger className="w-44"><SelectValue placeholder="All stages" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Stages</SelectItem>{STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}</SelectContent></Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Source</TableHead><TableHead>Stage</TableHead><TableHead>Assigned To</TableHead><TableHead>Remarks</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
            : leads.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No leads found</TableCell></TableRow>
            : leads.map((l: any) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell>{l.phone}</TableCell>
                <TableCell><Badge variant="outline">{SOURCE_LABELS[l.source] || l.source}</Badge></TableCell>
                <TableCell>
                  <Select value={l.stage} onValueChange={(v) => handleStageChange(l.id, v)}>
                    <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s} className="text-xs">{STAGE_LABELS[s]}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm">
                  <Select value={l.assignedToId ?? "none"} onValueChange={(v) => handleReassign(l.id, v)}>
                    <SelectTrigger className="h-7 w-40 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {assignees.map((u) => <SelectItem key={u.id} value={u.id} className="text-xs">{u.firstName} {u.lastName || ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
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
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {viewLead?.remarks?.map((r: any) => (
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