"use client";

import { useState } from "react";
import { useGateEntries, useGateEntryStats, useCreateGateEntry, useUpdateGateEntry, useDeleteGateEntry } from "@/lib/hooks/use-gate-entry";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, LogOut, Trash2, Search, Users, DoorOpen, ClipboardList, PhoneCall } from "lucide-react";

const CATEGORIES = [
  { value: "ADMISSION_ENQUIRY", label: "Admission Enquiry" },
  { value: "VISITOR", label: "Visitor" },
  { value: "PARENT", label: "Parent" },
  { value: "VENDOR", label: "Vendor" },
  { value: "STAFF_IN_OUT", label: "Staff In/Out" },
  { value: "OTHER", label: "Other" },
];

const categoryColor: Record<string, string> = {
  ADMISSION_ENQUIRY: "bg-blue-100 text-blue-800",
  VISITOR: "bg-indigo-100 text-indigo-800",
  PARENT: "bg-green-100 text-green-800",
  VENDOR: "bg-orange-100 text-orange-800",
  STAFF_IN_OUT: "bg-purple-100 text-purple-800",
  OTHER: "bg-gray-100 text-gray-800",
};

export function GateEntryManagement() {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [form, setForm] = useState({ category: "", name: "", phone: "", reason: "", classInterestedIn: "", personToMeet: "" });
  const { toast } = useToast();

  const filters = { page, limit: 15, ...(categoryFilter && { category: categoryFilter }), ...(search && { search }) };
  const { data, isLoading } = useGateEntries(filters);
  const { data: statsData } = useGateEntryStats();
  const createEntry = useCreateGateEntry();
  const updateEntry = useUpdateGateEntry();
  const deleteEntry = useDeleteGateEntry();

  const entries = (data as any)?.data ?? [];
  const totalPages = (data as any)?.totalPages ?? 1;
  const stats = (statsData as any)?.data;

  const handleCreate = async () => {
    if (!form.category || !form.name || !form.phone) {
      toast({ title: "Validation Error", description: "Category, name, and phone are required", variant: "destructive" });
      return;
    }
    try {
      await createEntry.mutateAsync(form);
      toast({ title: "Success", description: form.category === "ADMISSION_ENQUIRY" || form.category === "VISITOR" ? "Gate entry recorded — CRM lead auto-created" : "Gate entry recorded" });
      setAddDialogOpen(false);
      setForm({ category: "", name: "", phone: "", reason: "", classInterestedIn: "", personToMeet: "" });
    } catch {
      toast({ title: "Error", description: "Failed to create entry", variant: "destructive" });
    }
  };

  const handleMarkOut = async (id: string) => {
    try {
      await updateEntry.mutateAsync({ id, data: { outTime: new Date().toISOString() } });
      toast({ title: "Success", description: "Out time recorded" });
    } catch {
      toast({ title: "Error", description: "Failed to mark out", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await deleteEntry.mutateAsync(id);
      toast({ title: "Success", description: "Entry deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const formatTime = (dt: string) => new Date(dt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gate Entry</h1>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Entry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New Gate Entry</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Visitor name" /></div>
              <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" /></div>
              <div><Label>Reason</Label><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Purpose of visit" /></div>
              <div><Label>Class Interested In</Label><Input value={form.classInterestedIn} onChange={(e) => setForm({ ...form, classInterestedIn: e.target.value })} placeholder="e.g. Nursery, Grade 1" /></div>
              <div><Label>Person to Meet</Label><Input value={form.personToMeet} onChange={(e) => setForm({ ...form, personToMeet: e.target.value })} placeholder="Department / person" /></div>
              <Button onClick={handleCreate} disabled={createEntry.isPending} className="w-full">{createEntry.isPending ? "Saving..." : "Save Entry"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Today's Entries</CardTitle><ClipboardList className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalToday ?? 0}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Currently Inside</CardTitle><DoorOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.currentlyInside ?? 0}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">CRM Leads Created</CardTitle><PhoneCall className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.crmLeadsToday ?? 0}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Categories Today</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.byCategory?.length ?? 0}</div></CardContent></Card>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search name or phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v === "ALL" ? "" : v); setPage(1); }}><SelectTrigger className="w-48"><SelectValue placeholder="All categories" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Categories</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Date &amp; Time</TableHead><TableHead>Category</TableHead><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Reason</TableHead><TableHead>Class</TableHead><TableHead>Person to Meet</TableHead><TableHead>Out Time</TableHead><TableHead>CRM Lead</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={11} className="text-center py-8">Loading...</TableCell></TableRow>
            : entries.length === 0 ? <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">No entries found</TableCell></TableRow>
            : entries.map((e: any) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono">{e.serialNo}</TableCell>
                <TableCell className="text-sm">{formatTime(e.inTime)}</TableCell>
                <TableCell><Badge variant="outline" className={categoryColor[e.category] || ""}>{e.category.replace(/_/g, " ")}</Badge></TableCell>
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell><a href={`tel:${e.phone}`} className="text-primary hover:underline">{e.phone}</a></TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{e.reason || "-"}</TableCell>
                <TableCell className="text-sm">{e.classInterestedIn || "-"}</TableCell>
                <TableCell className="text-sm">{e.personToMeet || "-"}</TableCell>
                <TableCell>{e.outTime ? formatTime(e.outTime) : <Badge variant="secondary">Inside</Badge>}</TableCell>
                <TableCell>
                  {e.linkedLead ? (
                    <a href={`/admin/crm?lead=${e.linkedLead.id}`}><Badge className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer">Lead Created</Badge></a>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!e.outTime && <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleMarkOut(e.id)}><LogOut className="h-3.5 w-3.5" /></Button>}
                    <Button variant="outline" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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