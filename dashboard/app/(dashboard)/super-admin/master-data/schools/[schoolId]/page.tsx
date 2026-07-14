"use client";

import Link from "next/link";
import { use, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Layers,
  Shield,
  UserCog,
  Users,
} from "lucide-react";
import {
  useSchoolMasterOverview,
  type SchoolMasterOverview,
} from "@/lib/hooks/use-super-admin";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MASTER_DATA_BASE_PATH,
  MASTER_DATA_ROUTES,
} from "@/lib/super-admin/master-data/routes";

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function MasterDataSchoolProfilePage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = use(params);
  const { data, isLoading, error } = useSchoolMasterOverview(schoolId);
  const overview = data as SchoolMasterOverview | null | undefined;

  const backHref =
    overview?.school?.regionId != null
      ? MASTER_DATA_ROUTES.regionSchools(overview.school.regionId)
      : `${MASTER_DATA_BASE_PATH}?tab=regions`;

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <p className="text-destructive">
          {(error as Error)?.message || "School not found or you lack access."}
        </p>
      </div>
    );
  }

  const { school, stats } = overview;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {school.region?.name ? `Back to ${school.region.name}` : "Master data"}
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{school.name}</h1>
        <p className="text-muted-foreground mt-1">
          {school.code}
          {school.region?.name ? ` · ${school.region.name}` : ""}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Students" value={stats.students} icon={GraduationCap} />
          <StatCard title="Teachers" value={stats.teachers} icon={Users} />
          <StatCard title="Staff" value={stats.staff} icon={UserCog} />
          <StatCard title="School admins" value={stats.schoolAdmins} icon={Shield} />
          <StatCard title="Classes" value={stats.classes} icon={BookOpen} />
          <StatCard title="Subjects" value={stats.subjects} icon={Layers} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About the school</CardTitle>
          <CardDescription>Registration and contact details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Email
            </p>
            <p className="text-sm">{school.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Phone
            </p>
            <p className="text-sm">{school.phone}</p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Address
            </p>
            <p className="text-sm">
              {school.address?.length ? school.address.join(", ") : "—"}
            </p>
          </div>
          {school.principalName ? (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Principal
              </p>
              <p className="text-sm">{school.principalName}</p>
              {school.principalEmail ? (
                <p className="text-xs text-muted-foreground">{school.principalEmail}</p>
              ) : null}
              {school.principalPhone ? (
                <p className="text-xs text-muted-foreground">{school.principalPhone}</p>
              ) : null}
            </div>
          ) : null}
          {school.boardAffiliation ? (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Board
              </p>
              <p className="text-sm">{school.boardAffiliation}</p>
            </div>
          ) : null}
          {school.establishedYear != null ? (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Established
              </p>
              <p className="text-sm">{school.establishedYear}</p>
            </div>
          ) : null}
          {school.studentStrength != null ? (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Declared strength
              </p>
              <p className="text-sm">{school.studentStrength}</p>
            </div>
          ) : null}
          {school.gstNumber ? (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                GST
              </p>
              <p className="text-sm">{school.gstNumber}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
