"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useTeacher } from "@/lib/hooks/use-teachers";
import { useAttendance } from "@/lib/hooks/use-attendance";
import { useFile, getFileUrl } from "@/lib/hooks/use-file-upload";
import { downloadFromApi, get } from "@/lib/api/client";
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
  Bus,
  IndianRupee,
  FileDown,
  Loader2,
  User,
  GraduationCap,
  MapPin,
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

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;

  const [downloadingCert, setDownloadingCert] = useState(false);

  const { data: teacherRes, isLoading: loadingTeacher } = useTeacher(teacherId);
  const teacher = teacherRes?.data;

  const ytdRange = useMemo(() => {
    const y = new Date().getFullYear();
    return {
      startDate: `${y}-01-01`,
      endDate: format(new Date(), "yyyy-MM-dd"),
    };
  }, []);

  const { data: attendanceRes, isLoading: loadingAttendance } = useAttendance({
    studentId: teacherId,
    startDate: ytdRange.startDate,
    endDate: ytdRange.endDate,
  });
  const attendanceRows = attendanceRes?.data ?? [];

  const { data: statsRes, isLoading: loadingStats } = useQuery({
    queryKey: ["attendance-statistics", "teacher", teacherId, ytdRange.startDate, ytdRange.endDate],
    queryFn: () =>
      get("/attendance/statistics", {
        studentId: teacherId,
        startDate: ytdRange.startDate,
        endDate: ytdRange.endDate,
      }),
    enabled: !!teacherId,
    staleTime: 60 * 1000,
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
    teacher?.registrationPhotoId ||
    teacher?.photoId ||
    teacher?.fileId ||
    teacher?.avatarId;

  const { data: userFile, isLoading: loadingUserFile } = useFile(fileId, {
    enabled: !!fileId && !!teacher,
  });
  const photoUrl = getFileUrl(userFile);

  const tp = teacher?.teacherProfile || {};
  const addressLines = parseAddressLines(teacher?.address);

  const handleDownloadExperienceCertificate = async () => {
    if (!teacher?.id) return;
    setDownloadingCert(true);
    try {
      const blob = await downloadFromApi(`/users/experience-certificate/${teacher.id}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Experience_Certificate_${teacher.firstName || ""}_${teacher.lastName || ""}.pdf`;
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

  if (loadingTeacher) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Teacher not found.</p>
        <Button variant="outline" onClick={() => router.push("/admin/teachers")}>
          Back to teachers
        </Button>
      </div>
    );
  }

  const classLabel =
    teacher.class ||
    (teacher.assignedClasses?.length ? teacher.assignedClasses.join(", ") : null);

  const monthAttendancePct = teacher.attendance?.percentage;
  const basicSalary = tp.basicSalary != null ? Number(tp.basicSalary) : null;

  const assignedPairs: { id: string; label: string }[] = [];
  const ids = (teacher.assignedClassIds as string[] | undefined) ?? [];
  const labels = (teacher.assignedClasses as string[] | undefined) ?? [];
  for (let i = 0; i < Math.max(ids.length, labels.length); i++) {
    assignedPairs.push({
      id: ids[i] ?? "",
      label: labels[i] ?? ids[i] ?? "—",
    });
  }

  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/teachers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            {loadingUserFile ? (
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse shrink-0" />
            ) : photoUrl ? (
              <Avatar className="h-16 w-16 border">
                <AvatarImage src={photoUrl} alt="" />
                <AvatarFallback>
                  {(teacher.firstName?.[0] ?? "") + (teacher.lastName?.[0] ?? "")}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-16 w-16 border">
                <AvatarFallback className="text-lg">
                  {(teacher.firstName?.[0] ?? "") + (teacher.lastName?.[0] ?? "")}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-2xl font-semibold">
                {teacher.firstName} {teacher.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {teacher.publicUserId ? `Employee ID ${teacher.publicUserId}` : "Teacher"}
                {classLabel ? ` · ${classLabel}` : ""}
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
            <Link href={`/admin/teachers/${teacherId}/edit`}>
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
              Same metric as the teachers list (calendar month, present + late + half-day).
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
                teacher.salary === "DUE"
                  ? "destructive"
                  : teacher.salary === "PAID"
                    ? "default"
                    : "secondary"
              }
            >
              {teacher.salary ?? "—"}
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
              <Bus className="h-4 w-4" />
              Transport
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{teacher.transport ?? "—"}</p>
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
              <span className="text-right break-all">{teacher.email || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Phone</span>
              <span>{formatPhoneDisplay(teacher.contact)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Gender</span>
              <span>{formatGender(teacher.gender)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Date of birth</span>
              <span>
                {teacher.dateOfBirth
                  ? format(new Date(teacher.dateOfBirth), "d MMM yyyy")
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Aadhaar</span>
              <span className="font-mono text-xs">{teacher.aadhaarId || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Professional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Designation</span>
              <span className="text-right">{tp.designation || teacher.designation || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Subjects</span>
              <span className="text-right">{teacher.subjects ?? tp.subjects ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Qualification</span>
              <span className="text-right">{tp.highestQualification || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">University</span>
              <span className="text-right break-words">{tp.university || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Year of passing</span>
              <span>{tp.yearOfPassing != null ? String(tp.yearOfPassing) : "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Grade / %</span>
              <span>{tp.grade || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">PAN</span>
              <span className="font-mono text-xs">{tp.panCardNumber || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Blood group</span>
              <span>{tp.bloodGroup || "—"}</span>
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
          <CardTitle className="text-base">Class teacher assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedPairs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not assigned as class teacher.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {assignedPairs.map((row, i) => (
                <li key={row.id || `c-${i}`}>
                  {row.id ? (
                    <Link
                      href={`/admin/classes/${row.id}`}
                      className="text-primary underline underline-offset-2"
                    >
                      {row.label}
                    </Link>
                  ) : (
                    row.label
                  )}
                </li>
              ))}
            </ul>
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
              No rows in this date range. Mark staff attendance under Staff Attendance in the admin
              menu.
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
                    const id = String(row.id ?? `att-${idx}`);
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
                      <TableRow key={id}>
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
