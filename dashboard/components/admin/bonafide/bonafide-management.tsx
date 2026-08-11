"use client";

import { useMemo, useRef, useState } from "react";
import {
  useBonafideCertificates,
  useGenerateBonafide,
  useBonafidePreview,
  useDownloadBonafide,
  triggerBlobDownload,
} from "@/lib/hooks/use-bonafide";
import { useAllClasses, useClassStudents } from "@/lib/hooks/use-classes";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Download,
  Eye,
  Printer,
  Loader2,
  GraduationCap,
  User,
} from "lucide-react";

const PURPOSES = [
  { value: "PASSPORT", label: "Passport" },
  { value: "SCHOLARSHIP", label: "Scholarship" },
  { value: "BANK", label: "Bank" },
  { value: "VISA", label: "Visa" },
  { value: "GENERAL", label: "General" },
];

const PURPOSE_LABELS: Record<string, string> = Object.fromEntries(
  PURPOSES.map((p) => [p.value, p.label]),
);

const CLASS_ITEM_PAGE_SIZE = 100;

interface ClassRow {
  id: string;
  grade: string;
  division?: string | null;
}

interface StudentRow {
  id: string;
  firstName: string;
  lastName?: string;
  publicUserId?: string;
  dateOfBirth?: string;
  studentProfile?: {
    rollNumber?: number;
    fatherName?: string;
    motherName?: string;
    class?: { grade: string; division?: string | null };
  };
}

interface RegisterCertificate {
  id: string;
  purpose: string;
  certificateNumber: string;
  isDuplicate: boolean;
  issueDate: string;
  student?: {
    firstName: string;
    lastName?: string;
    publicUserId?: string;
    studentProfile?: {
      rollNumber?: number;
      class?: { grade: string; division?: string | null };
    };
  };
  creator?: { firstName: string; lastName?: string };
  file?: { id: string };
}

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

export function BonafideManagement() {
  const { toast } = useToast();

  // ── Generation flow: Class → Division → Student ──
  const [grade, setGrade] = useState("");
  const [division, setDivision] = useState("");
  const [studentId, setStudentId] = useState("");
  const [purpose, setPurpose] = useState("GENERAL");
  const [isDuplicate, setIsDuplicate] = useState(false);

  // ── Preview modal ──
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewCertNumber, setPreviewCertNumber] = useState("");
  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  // ── Register ──
  const [page, setPage] = useState(1);
  const [purposeFilter, setPurposeFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const { data: allClassesData } = useAllClasses();
  const classes: ClassRow[] = useMemo(
    () => (allClassesData?.data as ClassRow[]) ?? [],
    [allClassesData],
  );

  const grades = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => c.grade && set.add(c.grade));
    return Array.from(set).sort((a, b) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [classes]);

  const divisions = useMemo(() => {
    const set = new Set<string>();
    classes
      .filter((c) => c.grade === grade)
      .forEach((c) => c.division && set.add(c.division));
    return Array.from(set).sort();
  }, [classes, grade]);

  const selectedClass = useMemo(
    () => classes.find((c) => c.grade === grade && c.division === division),
    [classes, grade, division],
  );

  const { data: rosterData, isLoading: rosterLoading } = useClassStudents(
    selectedClass?.id || "",
    {
      page: 1,
      limit: CLASS_ITEM_PAGE_SIZE,
      sortBy: "rollNumber",
      sortOrder: "asc",
    },
  );

  const students: StudentRow[] = useMemo(() => {
    const rows = (rosterData?.data?.students ?? rosterData?.data ?? []) as StudentRow[];
    return rows.sort((a, b) =>
      (a.studentProfile?.rollNumber ?? Number.MAX_SAFE_INTEGER) -
      (b.studentProfile?.rollNumber ?? Number.MAX_SAFE_INTEGER),
    );
  }, [rosterData]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === studentId),
    [students, studentId],
  );

  const canGenerate = Boolean(selectedStudent && purpose && selectedClass);

  const handleGradeChange = (value: string) => {
    setGrade(value);
    setDivision("");
    setStudentId("");
  };

  const handleDivisionChange = (value: string) => {
    setDivision(value);
    setStudentId("");
  };

  // ── Mutations ──
  const generateCert = useGenerateBonafide();
  const previewCert = useBonafidePreview();
  const downloadCert = useDownloadBonafide();

  const request = useMemo(
    () => ({ studentId, purpose, isDuplicate }),
    [studentId, purpose, isDuplicate],
  );

  const handlePreview = async () => {
    if (!canGenerate) {
      toast({ title: "Validation Error", description: "Select a class, student and purpose first", variant: "destructive" });
      return;
    }
    try {
      const data = await previewCert.mutateAsync(request);
      setPreviewHtml(data.html);
      setPreviewCertNumber(data.certificateNumber);
      setPreviewOpen(true);
    } catch (err) {
      toast({
        title: "Preview Failed",
        description: err instanceof Error ? err.message : "Could not render the certificate preview",
        variant: "destructive",
      });
    }
  };

  const handleGenerateDownload = async () => {
    if (!canGenerate) {
      toast({ title: "Validation Error", description: "Select a class, student and purpose first", variant: "destructive" });
      return;
    }
    try {
      const result = await generateCert.mutateAsync(request);
      triggerBlobDownload(result.blob, result.filename);
      toast({
        title: isDuplicate ? "Duplicate certificate issued" : "Certificate issued",
        description: `Downloaded ${result.filename} and logged to the certificate register`,
      });
    } catch (err) {
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Could not generate the certificate",
        variant: "destructive",
      });
    }
  };

  const handlePrintPreview = () => {
    previewFrameRef.current?.contentWindow?.print();
  };

  const handleRegisterDownload = async (id: string) => {
    try {
      const result = await downloadCert.mutateAsync({ id });
      triggerBlobDownload(result.blob, result.filename);
    } catch (err) {
      toast({
        title: "Download Failed",
        description: err instanceof Error ? err.message : "Could not download the certificate",
        variant: "destructive",
      });
    }
  };

  // ── Register data ──
  const listFilters = useMemo(() => {
    const f: Record<string, string | number | undefined> = { page, limit: 15 };
    if (purposeFilter !== "ALL") f.purpose = purposeFilter;
    if (typeFilter !== "ALL") f.isDuplicate = typeFilter;
    return f;
  }, [page, purposeFilter, typeFilter]);

  const { data: listData, isLoading: listLoading } = useBonafideCertificates(listFilters);
  const registerCertificates: RegisterCertificate[] = (listData?.data ?? []) as RegisterCertificate[];
  const totalPages = (listData?.totalPages as number) ?? 1;

  const resetFilters = () => {
    setPurposeFilter("ALL");
    setTypeFilter("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Bonafide Certificates</h1>
          <p className="text-sm text-muted-foreground">
            Issue professionally printed bonafide certificates with school branding, seal and signature.
          </p>
        </div>
      </div>

      {/* ── Issue new certificate ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Issue New Certificate
          </CardTitle>
          <CardDescription>
            Pick Class → Division → Student. Details auto-fill from the student record.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Class (Grade) *</Label>
              <Select value={grade} onValueChange={handleGradeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g} value={g}>
                      Class {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Division *</Label>
              <Select value={division} onValueChange={handleDivisionChange} disabled={!grade}>
                <SelectTrigger>
                  <SelectValue placeholder={grade ? "Select division" : "Select class first"} />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select value={studentId} onValueChange={setStudentId} disabled={!selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedClass ? "Select student" : "Select class first"} />
                </SelectTrigger>
                <SelectContent>
                  {rosterLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">Loading students...</div>
                  ) : students.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No students in this class</div>
                  ) : (
                    students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.studentProfile?.rollNumber ? `#${s.studentProfile.rollNumber} ` : ""}
                        {s.firstName} {s.lastName || ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedStudent && (
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <User className="h-4 w-4" />
                Student Details (printed on the certificate)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Student Name</div>
                  <div className="font-medium">
                    {selectedStudent.firstName} {selectedStudent.lastName || ""}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Roll No</div>
                  <div className="font-medium">{selectedStudent.studentProfile?.rollNumber ?? "N/A"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Admission No</div>
                  <div className="font-medium">{selectedStudent.publicUserId || "N/A"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Class &amp; Section</div>
                  <div className="font-medium">
                    {selectedStudent.studentProfile?.class?.grade}
                    {selectedStudent.studentProfile?.class?.division
                      ? ` - ${selectedStudent.studentProfile.class.division}`
                      : ""}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Father&apos;s Name</div>
                  <div className="font-medium">{selectedStudent.studentProfile?.fatherName || "N/A"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Mother&apos;s Name</div>
                  <div className="font-medium">{selectedStudent.studentProfile?.motherName || "N/A"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Date of Birth</div>
                  <div className="font-medium">{formatDate(selectedStudent.dateOfBirth)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Purpose *</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
                <Checkbox
                  checked={isDuplicate}
                  onCheckedChange={(checked) => setIsDuplicate(Boolean(checked))}
                />
                Issue as Duplicate (original stands cancelled)
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!canGenerate || previewCert.isPending}
              className="gap-2"
            >
              {previewCert.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Preview
            </Button>
            <Button
              onClick={handleGenerateDownload}
              disabled={!canGenerate || generateCert.isPending}
              className="gap-2"
            >
              {generateCert.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {generateCert.isPending ? "Generating..." : "Generate & Download PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Certificate register ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Issued Certificates Register
          </CardTitle>
          <CardDescription>
            Every issued certificate is logged with its number, student, issuer and date.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={purposeFilter} onValueChange={(v) => { setPurposeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All purposes</SelectItem>
                {PURPOSES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Original + Duplicate</SelectItem>
                <SelectItem value="false">Original</SelectItem>
                <SelectItem value="true">Duplicate</SelectItem>
              </SelectContent>
            </Select>
            {(purposeFilter !== "ALL" || typeFilter !== "ALL") && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Certificate No</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issued By</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead className="w-28">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={9}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : registerCertificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No certificates issued yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    registerCertificates.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-sm">{c.certificateNumber}</TableCell>
                        <TableCell className="font-medium">
                          {c.student?.firstName} {c.student?.lastName || ""}
                        </TableCell>
                        <TableCell>
                          {c.student?.studentProfile?.class?.grade}
                          {c.student?.studentProfile?.class?.division
                            ? ` - ${c.student.studentProfile.class.division}`
                            : ""}
                        </TableCell>
                        <TableCell>{c.student?.studentProfile?.rollNumber ?? "-"}</TableCell>
                        <TableCell>{PURPOSE_LABELS[c.purpose] || c.purpose.replace(/_/g, " ")}</TableCell>
                        <TableCell>
                          <Badge variant={c.isDuplicate ? "destructive" : "default"}>
                            {c.isDuplicate ? "Duplicate" : "Original"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {c.creator?.firstName} {c.creator?.lastName || ""}
                        </TableCell>
                        <TableCell>{formatDate(c.issueDate)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegisterDownload(c.id)}
                            disabled={downloadCert.isPending}
                            className="gap-1"
                          >
                            {downloadCert.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Preview modal ── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[88vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Certificate Preview
              <Badge variant="outline" className="ml-1 font-mono">{previewCertNumber}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 rounded-lg border bg-muted/30 overflow-auto">
            {previewHtml ? (
              <iframe
                ref={previewFrameRef}
                srcDoc={previewHtml}
                className="h-full w-full"
                title="Bonafide certificate preview"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
          <DialogFooter className="shrink-0">
            <Button
              variant="outline"
              onClick={handlePrintPreview}
              className="gap-2"
              disabled={!previewHtml}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={handleGenerateDownload}
              disabled={generateCert.isPending || !canGenerate}
              className="gap-2"
            >
              {generateCert.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Finalize & Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
