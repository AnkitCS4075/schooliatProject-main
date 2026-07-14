"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useStaffMember } from "@/lib/hooks/use-staff";
import { useAttendance, useAttendanceStatistics } from "@/lib/hooks/use-attendance";
import { useFile, getFileUrl } from "@/lib/hooks/use-file-upload";
import { downloadFromApi } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Pencil,
  CalendarCheck,
  IndianRupee,
  FileDown,
  Loader2,
  User,
  MapPin,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

function parseAddressLines(address: unknown): string[] {
  if (!Array.isArray(address)) return [];
  return address
    .map((line) => String(line ?? "").trim())
    .filter((line) => line.length > 0 && line !== "," && line !== "-");
}

function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) return "—";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

function formatGender(g: string | null | undefined): string {
  if (!g) return "—";
  const m: Record<string, string> = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
  };
  return m[g] ?? g.replace(/_/g, " ");
}

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

export default function StaffProfilePage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

  const [downloadingCert, setDownloadingCert] = useState(false);

  const ytdRange = useMemo(() => {
    const y = new Date().getFullYear();
    return {
      startDate: `${y}-01-01`,
      endDate: format(new Date(), "yyyy-MM-dd"),
    };
  }, []);

  const { data: staffRes, isLoading: loadingStaff } = useStaffMember(staffId);
  const staff = staffRes?.data;

  const { data: attendanceRes, isLoading: loadingAttendance } = useAttendance({
    studentId: staffId,
    startDate: ytdRange.startDate,
    endDate: ytdRange.endDate,
  });
  const attendanceRows = attendanceRes?.data ?? [];

  const { data: statsRes, isLoading: loadingStats } = useAttendanceStatistics({
    studentId: staffId,
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

  const fileId =
    staff?.registrationPhotoId ||
    staff?.photoId ||
    staff?.fileId ||
    staff?.avatarId;

  const { data: userFile, isLoading: loadingUserFile } = useFile(fileId, {
    enabled: !!fileId && !!staff,
  });
  const photoUrl = getFileUrl(userFile);

  const sp = staff?.staffProfile || {};
  const addressLines = parseAddressLines(staff?.address);

  const handleDownloadExperienceCertificate = async () => {
    if (!staff?.id) return;
    setDownloadingCert(true);
    try {
      const blob = await downloadFromApi(`/users/experience-certificate/${staff.id}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Experience_Certificate_${staff.firstName || ""}_${staff.lastName || ""}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Experience certificate downloaded!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to download";
      toast.error(message);
    } finally {
      setDownloadingCert(false);
    }
  };

  if (loadingStaff) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Staff member not found.</p>
        <Button variant="outline" onClick={() => router.push("/admin/staff")}>
          Back to staff
        </Button>
      </div>
    );
  }

  const monthAttendancePct = staff.attendance?.percentage;
  const basicSalary = sp.basicSalary != null ? Number(sp.basicSalary) : null;

  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/staff")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            {loadingUserFile ? (
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse shrink-0" />
            ) : photoUrl ? (
              <Avatar className="h-16 w-16 border">
                <AvatarImage src={photoUrl} alt="" />
                <AvatarFallback>
                  {(staff.firstName?.[0] ?? "") + (staff.lastName?.[0] ?? "")}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-16 w-16 border">
                <AvatarFallback className="text-lg">
                  {(staff.firstName?.[0] ?? "") + (staff.lastName?.[0] ?? "")}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-2xl font-semibold">
                {staff.firstName} {staff.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {staff.publicUserId ? `Employee ID ${staff.publicUserId}` : "Staff"}
                {sp.designation ? ` · ${sp.designation}` : ""}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleDownloadExperienceCertificate}
            disabled={downloadingCert}
          >
            {downloadingCert ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Experience certificate
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/admin/staff/${staffId}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Attendance (this month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {monthAttendancePct !== null && monthAttendancePct !== undefined
                ? `${monthAttendancePct}%`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Calendar month; present + late + half-day (same as staff list metrics).
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Salary status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Badge
              variant={
                staff.salary === "DUE"
                  ? "destructive"
                  : staff.salary === "PAID"
                    ? "default"
                    : "secondary"
              }
            >
              {staff.salary ?? "—"}
            </Badge>
            {basicSalary != null && !Number.isNaN(basicSalary) && (
              <p className="text-sm text-muted-foreground">
                Basic salary ₹{basicSalary.toLocaleString("en-IN")}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Designation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{sp.designation || "—"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact & identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span className="text-right break-all">{staff.email || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Phone</span>
              <span>{formatPhoneDisplay(staff.contact)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Gender</span>
              <span>{formatGender(staff.gender)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Date of birth</span>
              <span>
                {staff.dateOfBirth
                  ? format(new Date(staff.dateOfBirth), "d MMM yyyy")
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Aadhaar</span>
              <span className="font-mono text-xs">{staff.aadhaarId || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Employment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Designation</span>
              <span className="text-right">{sp.designation || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Basic salary</span>
              <span>
                {basicSalary != null && !Number.isNaN(basicSalary)
                  ? `₹${basicSalary.toLocaleString("en-IN")}`
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          {addressLines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No address on file.</p>
          ) : (
            <p className="text-sm whitespace-pre-line">{addressLines.join("\n")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Staff attendance ({ytdRange.startDate} → {ytdRange.endDate})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingStats ? (
            <Skeleton className="h-16 w-full" />
          ) : stats && stats.total > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total marks</p>
                <p className="font-semibold tabular-nums">{stats.total}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Present</p>
                <p className="font-semibold tabular-nums">{stats.present}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Late</p>
                <p className="font-semibold tabular-nums">{stats.late}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Half day</p>
                <p className="font-semibold tabular-nums">{stats.halfDay}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Absent</p>
                <p className="font-semibold tabular-nums">{stats.absent}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No attendance records in this period.</p>
          )}
          {!loadingStats && stats && stats.total > 0 && (
            <div className="flex flex-wrap gap-4 text-sm">
              <span>
                <span className="text-muted-foreground">Present rate: </span>
                <span className="font-medium tabular-nums">
                  {stats.attendancePercentage != null ? `${stats.attendancePercentage}%` : "—"}
                </span>
                <span className="text-muted-foreground"> (present ÷ total)</span>
              </span>
              {presentLikePct != null && (
                <span>
                  <span className="text-muted-foreground">Present-like: </span>
                  <span className="font-medium tabular-nums">{presentLikePct}%</span>
                  <span className="text-muted-foreground"> (incl. late & half-day)</span>
                </span>
              )}
            </div>
          )}

          {loadingAttendance ? (
            <Skeleton className="h-40 w-full" />
          ) : attendanceRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No rows in this date range. Record attendance under{" "}
              <Link href="/admin/attendance/staff" className="text-primary underline underline-offset-2">
                Staff Attendance
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
    </div>
  );
}
