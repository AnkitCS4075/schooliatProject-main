"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, ChevronRight, Search, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  useRegions,
  useSchools,
  type Region,
  type School,
} from "@/lib/hooks/use-super-admin";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MASTER_DATA_BASE_PATH,
  MASTER_DATA_ROUTES,
} from "@/lib/super-admin/master-data/routes";

export default function MasterDataRegionSchoolsPage({
  params,
}: {
  params: Promise<{ regionId: string }>;
}) {
  const { regionId } = use(params);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: regionsRes, isLoading: regionsLoading } = useRegions();
  const {
    data: schoolsRes,
    isLoading: schoolsLoading,
    isError: schoolsError,
    error: schoolsErr,
    refetch: refetchSchools,
  } = useSchools({
    regionId,
  });

  const regions = (regionsRes?.data || []) as Region[];
  const region = useMemo(
    () => regions.find((r) => r.id === regionId),
    [regions, regionId],
  );

  const schools = (schoolsRes?.data || []) as School[];
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return schools;
    const q = searchQuery.toLowerCase();
    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q),
    );
  }, [schools, searchQuery]);

  const loading = regionsLoading || schoolsLoading;
  const schoolsErrMessage =
    schoolsErr instanceof Error ? schoolsErr.message : "Something went wrong.";

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href={`${MASTER_DATA_BASE_PATH}?tab=regions`}>
            <ArrowLeft className="h-4 w-4" />
            Master data
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {region ? region.name : "Region"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Schools assigned to this region. Select a school to open its profile and stats.
        </p>
      </div>

      {schoolsError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not load schools</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 pt-1">
            <p>{schoolsErrMessage}</p>
            <div>
              <Button variant="outline" size="sm" onClick={() => refetchSchools()}>
                Try again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Schools in region</CardTitle>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or code…"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {schoolsError ? (
            <p className="py-6 text-center text-muted-foreground text-sm">
              Fix the error above to load the school list.
            </p>
          ) : loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              {schools.length === 0
                ? "No schools are assigned to this region. Schools without a region appear together with your platform default region (usually “General”—the same bucket used for new schools when no region is chosen)."
                : "No schools match your search."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {school.code}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-end gap-1 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {school.userCount ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild className="gap-1">
                        <Link href={MASTER_DATA_ROUTES.schoolProfile(school.id)}>
                          Profile
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
