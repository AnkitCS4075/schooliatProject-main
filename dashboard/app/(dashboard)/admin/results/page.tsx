"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultManagement } from "@/components/results/result-management";
import { MarksEntry } from "@/components/results/marks-entry";
import { Button } from "@/components/ui/button";
import { BarChart3, ClipboardPenLine } from "lucide-react";

export default function ResultsPage() {
  return (
    <div className="space-y-6 pb-8 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Results</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review exam outcomes, generate and publish results. Enter marks here or on the dedicated marks page (same
            as teachers use in the mobile app).
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2 shrink-0 w-fit">
          <Link href="/admin/marks/entry">
            <ClipboardPenLine className="h-4 w-4" />
            Full marks entry
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="results" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="results" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Results overview
          </TabsTrigger>
          <TabsTrigger value="marks" className="gap-2">
            <ClipboardPenLine className="h-4 w-4" />
            Enter marks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-6">
          <ResultManagement />
        </TabsContent>

        <TabsContent value="marks" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Quick entry by subject below. For a full class grid (all subjects at once), open{" "}
            <Link href="/admin/marks/entry" className="text-primary font-medium underline underline-offset-2">
              Full marks entry
            </Link>
            .
          </p>
          <MarksEntry />
        </TabsContent>
      </Tabs>
    </div>
  );
}
