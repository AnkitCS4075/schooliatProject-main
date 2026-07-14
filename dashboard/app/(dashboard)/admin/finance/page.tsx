"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndianRupee, Users, TrendingUp, AlertCircle, Plus, Loader2 } from "lucide-react";
import { useOtherIncomes, useOtherIncomeSummary, useCreateOtherIncome } from "@/lib/hooks/use-other-income";
import { useFeeDefaulters } from "@/lib/hooks/use-fees";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function formatCurrency(num: number | string | null | undefined): string {
  return `\u20B9${Number(num || 0).toLocaleString("en-IN")}`;
}

export default function MyFinancePage() {
  const [otherIncomeOpen, setOtherIncomeOpen] = useState(false);
  const [newIncome, setNewIncome] = useState({ title: "", amount: "", category: "", source: "", description: "" });

  const { data: summaryRes } = useOtherIncomeSummary();
  const { data: incomesRes, isLoading: loadingIncomes } = useOtherIncomes({ limit: 10 });
  const { data: defaultersRes } = useFeeDefaulters(1, 5);
  const createIncome = useCreateOtherIncome();

  const otherIncomeSummary = summaryRes?.data;
  const incomes = incomesRes?.data || [];
  const defaulters = defaultersRes?.data || [];
  const totalDefaulterAmount = defaulters.reduce((sum: number, d: any) => sum + Number(d.totalRemaining || 0), 0);

  const handleCreateIncome = async () => {
    if (!newIncome.title || !newIncome.amount) {
      toast.error("Title and amount are required");
      return;
    }
    try {
      await createIncome.mutateAsync({
        title: newIncome.title,
        amount: parseFloat(newIncome.amount),
        category: newIncome.category || undefined,
        source: newIncome.source || undefined,
        description: newIncome.description || undefined,
      });
      toast.success("Other income recorded");
      setOtherIncomeOpen(false);
      setNewIncome({ title: "", amount: "", category: "", source: "", description: "" });
    } catch {
      toast.error("Failed to record income");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Finance</h1>
          <p className="text-muted-foreground text-sm">Unified view of all school finances</p>
        </div>
        <Button onClick={() => setOtherIncomeOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Other Income
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Other Income (All Time)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(otherIncomeSummary?.totalAmount)}</p>
            <p className="text-xs text-muted-foreground">{otherIncomeSummary?.count || 0} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending Fee Defaulters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDefaulterAmount)}</p>
            <p className="text-xs text-muted-foreground">{defaulters.length} students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/admin/finance/fees">Fee Management</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/admin/finance/fee-defaulters">Fee Defaulters</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/admin/finance/salary">Salary Distribution</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="other-income" className="space-y-4">
        <TabsList>
          <TabsTrigger value="other-income">Other Income</TabsTrigger>
          <TabsTrigger value="recent-defaulters">Recent Defaulters</TabsTrigger>
        </TabsList>

        <TabsContent value="other-income">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Other Income Records</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingIncomes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : incomes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No other income recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {incomes.map((inc: any) => (
                    <div key={inc.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <p className="font-medium">{inc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {inc.category || "General"} {inc.source ? `\u00B7 ${inc.source}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(inc.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {inc.receivedAt ? new Date(inc.receivedAt).toLocaleDateString("en-IN") : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent-defaulters">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Fee Defaulters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {defaulters.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No fee defaulters.</p>
              ) : (
                <div className="space-y-3">
                  {defaulters.map((d: any) => (
                    <div key={d.student?.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <p className="font-medium">{d.student?.firstName} {d.student?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{d.student?.publicUserId}</p>
                      </div>
                      <Badge variant="destructive">{formatCurrency(d.totalRemaining)}</Badge>
                    </div>
                  ))}
                </div>
              )}
              <Button asChild variant="link" className="mt-4">
                <Link href="/admin/finance/fee-defaulters">View all defaulters</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={otherIncomeOpen} onOpenChange={setOtherIncomeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Other Income</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={newIncome.title}
                onChange={(e) => setNewIncome({ ...newIncome, title: e.target.value })}
                placeholder="e.g. Donation, Event Revenue"
              />
            </div>
            <div>
              <Label>Amount *</Label>
              <Input
                type="number"
                value={newIncome.amount}
                onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={newIncome.category}
                onChange={(e) => setNewIncome({ ...newIncome, category: e.target.value })}
                placeholder="e.g. Donation, Rent, Event"
              />
            </div>
            <div>
              <Label>Source</Label>
              <Input
                value={newIncome.source}
                onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                placeholder="e.g. Parent Association, Government Grant"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newIncome.description}
                onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
            <Button onClick={handleCreateIncome} disabled={createIncome.isPending} className="w-full">
              {createIncome.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Record Income
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
