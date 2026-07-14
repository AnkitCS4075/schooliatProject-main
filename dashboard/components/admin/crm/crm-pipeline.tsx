"use client";

import { useCrmFunnel } from "@/lib/hooks/use-crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STAGE_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTABLE: "Contactable",
  CONTACTED: "Contacted",
  CONNECTED: "Connected",
  FOLLOW_UP_SCHEDULED: "Follow-up",
  ADMISSION_DONE: "Admitted",
  LOST: "Lost",
};

export function CrmPipeline() {
  const { data, isLoading } = useCrmFunnel();
  const funnel = (data as any)?.data;

  if (isLoading) return <div className="text-center py-4 text-muted-foreground">Loading CRM data...</div>;
  if (!funnel) return null;

  const stages = Object.entries(funnel.stages);
  const maxCount = Math.max(...stages.map(([, v]) => v), 1);

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">CRM Pipeline</CardTitle></CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-3">Total Leads: {funnel.total}</div>
        <div className="space-y-2">
          {stages.map(([stage, count]) => (
            <div key={stage} className="flex items-center gap-3">
              <div className="w-24 text-xs text-muted-foreground truncate">{STAGE_LABELS[stage] || stage}</div>
              <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${((count as number) / maxCount) * 100}%` }} />
              </div>
              <div className="w-8 text-xs font-medium text-right">{count as number}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}