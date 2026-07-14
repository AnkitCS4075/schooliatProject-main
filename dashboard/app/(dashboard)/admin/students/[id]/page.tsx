"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useStudent } from "@/lib/hooks/use-students";
import { useStudentFees, useStudentFeeLedger } from "@/lib/hooks/use-fees";
import { useMarks, useResults } from "@/lib/hooks/use-marks";
import { useHomework } from "@/lib/hooks/use-homework";
import { useAttendance, useAttendanceStatistics } from "@/lib/hooks/use-attendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmergencyContacts } from "@/lib/hooks/use-emergency-contacts";
import { ArrowLeft, Pencil, IndianRupee, BookOpen, Award, FileText, CalendarCheck, ScrollText, Phone, Bus } from "lucide-react";
import { useGenerateBonafide } from "@/lib/hooks/use-bonafide";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PRESENT":
      return "default";
    case "ABSENT":
      return "destructive";
    case "LATE":
      return "secondary";
    case "HALF_DAY":
      return "outline";
    default:
      return "secondary";
  }
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const ytdRange = useMemo(() => {
    const y = new Date().getFullYear();
    return {
      startDate: `${y}-01-01`,
      endDate: format(new Date(), "yyyy-MM-dd"),
    };
  }, []);

  const { data: studentRes, isLoading: loadingStudent } = useStudent(studentId);
  const student = studentRes?.data;

  const { data: attendanceRes, isLoading: loadingAttendance } = useAttendance({
    studentId,
    startDate: ytdRange.startDate,
    endDate: ytdRange.endDate,
  });
  const attendanceRows = attendanceRes?.data ?? [];

  const { data: statsRes, isLoading: loadingStats } = useAttendanceStatistics({
    studentId,
    startDate: ytdRange.startDate,
    endDate: ytdRange.endDate,
  });
  const stats = statsRes?.data as
    | {
        total: number;
        present: number;
        absent: number;
        late: number;
        halfDay: number;
        attendancePercentage?: number;
      }
    | undefined;

  const presentLikePct = useMemo(() => {
    if (!stats || stats.total <= 0) return null;
    const like = stats.present + stats.late + stats.halfDay;
    return Math.round((like / stats.total) * 100);
  }, [stats]);

  const { data: feesRes, isLoading: loadingFees } = useStudentFees(studentId, {
    enabled: !!studentId,
  });
  const { data: ledgerRes, isLoading: loadingLedger } = useStudentFeeLedger(studentId, {
    enabled: !!studentId,
    limit: 200,
  });
  const feePayload = feesRes?.data;
  const installments = feePayload?.installments ?? [];
  const ledgerEntries = ledgerRes?.data?.entries ?? [];

  const { data: marksRes, isLoading: loadingMarks } = useMarks({ studentId });
  const marks = marksRes?.data ?? [];

  const { data: resultsRes } = useResults({ studentId });
  const results = resultsRes?.data ?? [];

  const { data: hwRes, isLoading: loadingHw } = useHomework({
    studentId,
    limit: 20,
    page: 1,
  });
  const homeworkList = hwRes?.data ?? [];

  const { data: emergencyRes } = useEmergencyContacts(studentId);
  const emergencyContacts = emergencyRes?.data ?? [];

  const [bonafideOpen, setBonafideOpen] = useState(false);
  const [bonafidePurpose, setBonafidePurpose] = useState("");
  const generateBonafide = useGenerateBonafide();
  const { toast } = useToast();

  const handleGenerateBonafide = async () => {
    if (!bonafidePurpose) {
      toast({ title: "Error", description: "Please select a purpose", variant: "destructive" });
      return;
    }
    try {
      const result = await generateBonafide.mutateAsync({ studentId, purpose: bonafidePurpose });
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Bonafide certificate downloaded" });
      setBonafideOpen(false);
      setBonafidePurpose("");
    } catch {
      toast({ title: "Error", description: "Failed to generate certificate", variant: "destructive" });
    }
  };

  if (loadingStudent) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Student not found.</p>
        <Button variant="outline" onClick={() => router.push("/admin/students")}>
          Back to students
        </Button>
      </div>
    );
  }

  const sp = student.studentProfile || {};
  const classLabel = sp.class
    ? `${sp.class.grade}${sp.class.division ? `-${sp.class.division}` : ""}`
    : "—";

  const totalDue = installments.reduce(
    (s: number, i: any) => s + Number(i.amount || 0),
    0,
  );
  const totalPaid = installments.reduce(
    (s: number, i: any) => s + Number(i.paidAmount || 0),
    0,
  );

  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/students")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Class {classLabel}
              {student.publicUserId ? ` · ID ${student.publicUserId}` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setBonafideOpen(true)}>
            <ScrollText className="h-4 w-4" />
            Generate Bonafide
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/admin/students/${studentId}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit student
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span className="text-right break-all">{student.email || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Contact</span>
              <span>{student.contact || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Roll number</span>
              <span>{sp.rollNumber || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Father</span>
              <span className="text-right">{sp.fatherName || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Fees summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {loadingFees ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Installments</span>
                  <span>{installments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total (installments)</span>
                  <span>₹{totalDue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Recorded paid</span>
                  <span>₹{totalPaid.toLocaleString("en-IN")}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Attendance (this month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {student.attendance?.percentage !== null &&
              student.attendance?.percentage !== undefined
                ? `${student.attendance.percentage}%`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Same metric as the students list: calendar month, present + late + half-day.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Year-to-date ({ytdRange.startDate} → {ytdRange.endDate})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingStats ? (
              <Skeleton className="h-12 w-full" />
            ) : stats && stats.total > 0 ? (
              <>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span>
                    <span className="text-muted-foreground">Total marks: </span>
                    <span className="font-medium tabular-nums">{stats.total}</span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Present rate: </span>
                    <span className="font-medium tabular-nums">
                      {stats.attendancePercentage != null ? `${stats.attendancePercentage}%` : "—"}
                    </span>
                  </span>
                  {presentLikePct != null && (
                    <span>
                      <span className="text-muted-foreground">Present-like: </span>
                      <span className="font-medium tabular-nums">{presentLikePct}%</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Counts include each class period row. Present rate = present ÷ total rows; present-like
                  includes late and half-day.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No attendance recorded in this range yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Attendance records ({ytdRange.startDate} → {ytdRange.endDate})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingAttendance ? (
            <Skeleton className="h-40 w-full" />
          ) : attendanceRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No rows in this date range. Record attendance under{" "}
              <Link href="/admin/attendance" className="text-primary underline underline-offset-2">
                Mark Attendance
              </Link>
              .
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Marked by</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRows.map((row: Record<string, unknown>, idx: number) => {
                    const rowId = String(row.id ?? `att-${idx}`);
                    const d = row.date as string | undefined;
                    const status = String(row.status ?? "—");
                    const cls = row.class as { grade?: string; division?: string } | undefined;
                    const period = row.period as { name?: string } | undefined;
                    const marker = row.markedByUser as
                      | { firstName?: string; lastName?: string }
                      | undefined;
                    const classStr =
                      cls?.grade != null
                        ? `${cls.grade}${cls.division ? ` ${cls.division}` : ""}`
                        : "—";
                    return (
                      <TableRow key={rowId}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {d ? format(new Date(d), "d MMM yyyy") : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(status)}>{status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{classStr}</TableCell>
                        <TableCell className="text-sm">{period?.name ?? "—"}</TableCell>
                        <TableCell className="text-sm">
                          {marker
                            ? `${marker.firstName ?? ""} ${marker.lastName ?? ""}`.trim()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Installment schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingFees ? (
            <Skeleton className="h-32 w-full" />
          ) : installments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fee records for this student.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last receipt</TableHead>
                    <TableHead>Paid at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((row: any, idx: number) => (
                    <TableRow key={row.id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>₹{Number(row.amount || 0).toLocaleString("en-IN")}</TableCell>
                      <TableCell>₹{Number(row.paidAmount || 0).toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{row.paymentStatus || "—"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.lastReceiptNumber || "—"}
                      </TableCell>
                      <TableCell>
                        {row.paidAt
                          ? new Date(row.paidAt).toLocaleDateString("en-IN")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Payment history
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLedger ? (
            <Skeleton className="h-32 w-full" />
          ) : ledgerEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments or adjustments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount (₹)</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Receipt link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {e.createdAt
                          ? new Date(e.createdAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{e.entryType || "—"}</Badge>
                      </TableCell>
                      <TableCell>{Number(e.amount || 0).toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-sm">{e.receiptNumber || "—"}</TableCell>
                      <TableCell className="text-sm">{e.paymentMethod || "—"}</TableCell>
                      <TableCell>
                        {e.receiptFileUrl ? (
                          <a
                            href={e.receiptFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-sm underline"
                          >
                            Open
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4" />
              Marks (recent)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMarks ? (
              <Skeleton className="h-24 w-full" />
            ) : !marks.length ? (
              <p className="text-sm text-muted-foreground">No marks entries found.</p>
            ) : (
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marks.slice(0, 25).map((m: any, i: number) => (
                      <TableRow key={m.id || i}>
                        <TableCell>{m.subject?.name || "—"}</TableCell>
                        <TableCell>
                          {m.marksObtained ?? "—"} / {m.maxMarks ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!results.length ? (
              <p className="text-sm text-muted-foreground">No published results for this student.</p>
            ) : (
              <ul className="text-sm space-y-1">
                {results.slice(0, 10).map((r: any, i: number) => (
                  <li key={r.id || i}>
                    {r.exam?.name || "Exam"} — {r.grade || r.status || "—"}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Homework
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHw ? (
            <Skeleton className="h-24 w-full" />
          ) : !homeworkList.length ? (
            <p className="text-sm text-muted-foreground">No homework items returned for this student.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {homeworkList.slice(0, 15).map((h: any) => (
                <li key={h.id} className="flex justify-between gap-4 border-b border-border/50 pb-2">
                  <span>{h.title || "Homework"}</span>
                  <span className="text-muted-foreground shrink-0">
                    {h.dueDate ? new Date(h.dueDate).toLocaleDateString("en-IN") : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!emergencyContacts.length ? (
              <p className="text-sm text-muted-foreground">No emergency contacts on file.</p>
            ) : (
              <div className="space-y-3">
                {emergencyContacts.map((ec: any) => (
                  <div key={ec.id} className="border rounded-md p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{ec.name}</p>
                      {ec.isPrimary && <Badge variant="default" className="text-xs">Primary</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{ec.relationship}</p>
                    <p className="text-sm">{ec.contact}</p>
                    {ec.alternateContact && <p className="text-sm text-muted-foreground">Alt: {ec.alternateContact}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bus className="h-4 w-4" />
              Transport Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {sp.transport ? (
              <div className="space-y-2">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Assigned vehicle</span>
                  <span className="text-right">{sp.transport}</span>
                </div>
                {sp.transportId && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Transport ID</span>
                    <span className="text-right font-mono text-xs">{sp.transportId}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No transport assigned.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={bonafideOpen} onOpenChange={setBonafideOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Generate Bonafide Certificate</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Purpose *</Label>
              <Select value={bonafidePurpose} onValueChange={setBonafidePurpose}>
                <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASSPORT">Passport</SelectItem>
                  <SelectItem value="SCHOLARSHIP">Scholarship</SelectItem>
                  <SelectItem value="BANK">Bank</SelectItem>
                  <SelectItem value="VISA">Visa</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateBonafide} disabled={generateBonafide.isPending} className="w-full">
              <ScrollText className="mr-2 h-4 w-4" />
              {generateBonafide.isPending ? "Generating..." : "Generate & Download"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
