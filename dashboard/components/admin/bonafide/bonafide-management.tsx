"use client";

import { useState } from "react";
import { useBonafideCertificates, useGenerateBonafide } from "@/lib/hooks/use-bonafide";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Download, FileText } from "lucide-react";

const PURPOSES = [
  { value: "PASSPORT", label: "Passport" },
  { value: "SCHOLARSHIP", label: "Scholarship" },
  { value: "BANK", label: "Bank" },
  { value: "VISA", label: "Visa" },
  { value: "GENERAL", label: "General" },
];

export function BonafideManagement() {
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [purpose, setPurpose] = useState("");
  const { toast } = useToast();

  const { data, isLoading } = useBonafideCertificates({ page, limit: 15 });
  const generateCert = useGenerateBonafide();

  const certificates = (data as any)?.data ?? [];
  const totalPages = (data as any)?.totalPages ?? 1;

  const handleGenerate = async () => {
    if (!studentId || !purpose) {
      toast({ title: "Validation Error", description: "Student ID and purpose are required", variant: "destructive" });
      return;
    }
    try {
      const result = await generateCert.mutateAsync({ studentId, purpose });
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Certificate generated and downloaded" });
      setAddOpen(false);
      setStudentId("");
      setPurpose("");
    } catch {
      toast({ title: "Error", description: "Failed to generate certificate", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bonafide Certificates</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Generate Certificate</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Generate Bonafide Certificate</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Student ID *</Label><Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Enter student UUID" /></div>
              <div><Label>Purpose *</Label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                  <SelectContent>{PURPOSES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerate} disabled={generateCert.isPending} className="w-full">
                <Download className="mr-2 h-4 w-4" />{generateCert.isPending ? "Generating..." : "Generate & Download"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Admission No</TableHead><TableHead>Purpose</TableHead><TableHead>Certificate No</TableHead><TableHead>Issue Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            : certificates.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No certificates generated yet</TableCell></TableRow>
            : certificates.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.student?.firstName} {c.student?.lastName}</TableCell>
                <TableCell><Badge variant="outline">{c.student?.publicUserId || "N/A"}</Badge></TableCell>
                <TableCell>{c.purpose.replace(/_/g, " ")}</TableCell>
                <TableCell className="font-mono text-sm">{c.certificateNumber}</TableCell>
                <TableCell>{new Date(c.issueDate).toLocaleDateString("en-IN")}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm"><Download className="mr-1 h-3.5 w-3.5" /> PDF</Button>
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