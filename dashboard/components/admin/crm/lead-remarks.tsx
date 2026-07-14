"use client";

import { useState } from "react";
import { useAddCrmRemark } from "@/lib/hooks/use-crm";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";

interface Remark {
  id: string;
  content: string;
  author?: { firstName: string; lastName?: string };
  createdAt: string;
}

interface LeadRemarksProps {
  leadId: string;
  remarks: Remark[];
  onRemarkAdded?: () => void;
}

export function LeadRemarks({ leadId, remarks, onRemarkAdded }: LeadRemarksProps) {
  const [text, setText] = useState("");
  const addRemark = useAddCrmRemark();
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!text.trim()) return;
    try {
      await addRemark.mutateAsync({ leadId, content: text });
      toast({ title: "Success", description: "Remark added" });
      setText("");
      onRemarkAdded?.();
    } catch {
      toast({ title: "Error", description: "Failed to add remark", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Remarks ({remarks.length})</h4>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {remarks.length === 0 && <p className="text-sm text-muted-foreground">No remarks yet</p>}
        {remarks.map((r) => (
          <div key={r.id} className="border rounded p-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">{r.author?.firstName} {r.author?.lastName}</span>
              <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString("en-IN")}</span>
            </div>
            <p className="mt-1">{r.content}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input placeholder="Add a remark..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        <Button size="sm" onClick={handleAdd} disabled={addRemark.isPending}>Add</Button>
      </div>
    </div>
  );
}