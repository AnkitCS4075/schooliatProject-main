"use client";

import { useGateCrmConversionReport } from "@/lib/hooks/use-gate-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DoorOpen, PhoneCall, Percent, CircleDot } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const STATUS_LABELS: Record<string, string> = { PENDING: "Pending", INTERESTED: "Interested", NOT_INTERESTED: "Not Interested", CONVERTED: "Converted", LOST: "Lost" };
const STATUS_COLORS: Record<string, string> = { PENDING: "bg-gray-100 text-gray-800", INTERESTED: "bg-green-100 text-green-800", NOT_INTERESTED: "bg-yellow-100 text-yellow-800", CONVERTED: "bg-blue-100 text-blue-800", LOST: "bg-red-100 text-red-800" };

export function GateCrmReport() {
  const { data, isLoading } = useGateCrmConversionReport();
  const report = (data as any)?.data;
  const status = report?.status ?? { PENDING: 0, INTERESTED: 0, NOT_INTERESTED: 0, CONVERTED: 0, LOST: 0 };
  const daily = report?.daily ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gate Entry → CRM Conversion Report</h1>
        <p className="text-muted-foreground text-sm mt-1">Walk-in gate entries automatically synced to CRM leads as source "Gate Walk-in".</p>
      </div>

      {isLoading ? <div className="text-center py-12 text-muted-foreground">Loading report...</div> : !report ? <div className="text-center py-12 text-muted-foreground">No data available</div> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Gate Entries</CardTitle><DoorOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{report.totalEntries}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">CRM Leads Created</CardTitle><PhoneCall className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{report.totalLeads}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Conversion Rate</CardTitle><Percent className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{report.overallConversionRate}%</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Leads Converted</CardTitle><CircleDot className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{status.CONVERTED}</div></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Follow-up Status Breakdown</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.keys(STATUS_LABELS).map((s) => (
                  <div key={s} className="rounded-lg border p-3 text-center">
                    <div className="text-xl font-bold">{status[s] ?? 0}</div>
                    <Badge className={STATUS_COLORS[s]}>{STATUS_LABELS[s]}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Daily Walk-in → Lead Trend</CardTitle></CardHeader>
              <CardContent className="h-64">
                {daily.length === 0 ? <div className="text-center text-muted-foreground py-16">No walk-ins recorded</div> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="entries" name="Gate Entries" fill="#6366f1" />
                      <Bar dataKey="leads" name="CRM Leads" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader><TableRow><TableHead>School</TableHead><TableHead>Gate Entries</TableHead><TableHead>CRM Leads</TableHead><TableHead>Conversion</TableHead><TableHead>Interested</TableHead><TableHead>Not Interested</TableHead><TableHead>Converted</TableHead><TableHead>Lost</TableHead><TableHead>Pending</TableHead></TableRow></TableHeader>
              <TableBody>
                {report.schools.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No gate entries in any school</TableCell></TableRow>
                : report.schools.map((s: any) => (
                  <TableRow key={s.schoolId}>
                    <TableCell className="font-medium">{s.schoolName}</TableCell>
                    <TableCell>{s.entries}</TableCell>
                    <TableCell>{s.leads}</TableCell>
                    <TableCell><Badge variant="outline">{s.conversionRate}%</Badge></TableCell>
                    <TableCell>{s.status?.INTERESTED ?? 0}</TableCell>
                    <TableCell>{s.status?.NOT_INTERESTED ?? 0}</TableCell>
                    <TableCell>{s.status?.CONVERTED ?? 0}</TableCell>
                    <TableCell>{s.status?.LOST ?? 0}</TableCell>
                    <TableCell>{s.status?.PENDING ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
