"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SOURCES = ["STUDENT_REFERRAL", "PARENT_REFERRAL", "SALES_DEPARTMENT", "GATE_ENTRY"];
const SOURCE_LABELS: Record<string, string> = { STUDENT_REFERRAL: "Student Referral", PARENT_REFERRAL: "Parent Referral", SALES_DEPARTMENT: "Sales Dept", GATE_ENTRY: "Gate Entry" };

interface LeadFormProps {
  initialData?: { name: string; phone: string; source: string; category: string };
  onSubmit: (data: { name: string; phone: string; source: string; category: string; remarks?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LeadForm({ initialData, onSubmit, onCancel, isLoading }: LeadFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    source: initialData?.source || "",
    category: initialData?.category || "",
    remarks: "",
  });

  return (
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
      {!initialData && <div><Label>Initial Remark</Label><Input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="First note..." /></div>}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(form)} disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
      </div>
    </div>
  );
}