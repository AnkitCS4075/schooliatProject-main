"use client";

import { useState } from "react";
import {
  usePlatformAccounts,
  usePlatformBootstrap,
  usePlatformBalances,
  usePlatformJournalEntries,
  useCreatePlatformJournalEntry,
  usePlatformProfitAndLoss,
  usePlatformBalanceSheet,
  usePlatformIncoming,
  usePlatformOutgoing,
} from "@/lib/hooks/use-platform-finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BookOpen,
  IndianRupee,
  Plus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export function PlatformFinanceManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showJournalEntry, setShowJournalEntry] = useState(false);
  const [jeForm, setJeForm] = useState({
    reference: "",
    narration: "",
    lines: [
      { accountId: "", debitAmount: "0", creditAmount: "0" },
      { accountId: "", debitAmount: "0", creditAmount: "0" },
    ],
  });

  const { data: accountsData, isLoading: accountsLoading } = usePlatformAccounts();
  const bootstrapMutation = usePlatformBootstrap();
  const { data: balancesData } = usePlatformBalances();
  const { data: jeData } = usePlatformJournalEntries();
  const createJe = useCreatePlatformJournalEntry();
  const { data: plData } = usePlatformProfitAndLoss();
  const { data: bsData } = usePlatformBalanceSheet();
  const { data: incomingData } = usePlatformIncoming();
  const { data: outgoingData } = usePlatformOutgoing();

  const accounts = accountsData?.data || [];
  const balances = balancesData?.data || [];
  const journalEntries = jeData?.data?.entries || [];
  const pl = plData?.data;
  const bs = bsData?.data;
  const incoming = incomingData?.data;
  const outgoing = outgoingData?.data;

  const handleBootstrap = async () => {
    try {
      await bootstrapMutation.mutateAsync({});
      toast.success("Platform accounts bootstrapped");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateJE = async () => {
    try {
      const lines = jeForm.lines
        .filter((l) => l.accountId)
        .map((l) => ({
          accountId: l.accountId,
          debitAmount: Number(l.debitAmount) || 0,
          creditAmount: Number(l.creditAmount) || 0,
        }));
      if (lines.length < 2) {
        toast.error("Need at least 2 lines");
        return;
      }
      const totalDr = lines.reduce((s, l) => s + l.debitAmount, 0);
      const totalCr = lines.reduce((s, l) => s + l.creditAmount, 0);
      if (Math.abs(totalDr - totalCr) > 0.01) {
        toast.error("Debits and credits must match");
        return;
      }
      await createJe.mutateAsync({
        entryDate: new Date().toISOString(),
        reference: jeForm.reference,
        narration: jeForm.narration,
        lines,
      });
      toast.success("Journal entry created");
      setShowJournalEntry(false);
      setJeForm({
        reference: "",
        narration: "",
        lines: [
          { accountId: "", debitAmount: "0", creditAmount: "0" },
          { accountId: "", debitAmount: "0", creditAmount: "0" },
        ],
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Finance & Accounting</h1>
          <p className="text-muted-foreground">Winforge Private Limited — Financial Overview</p>
        </div>
        <div className="flex gap-2">
          {accounts.length === 0 && (
            <Button onClick={handleBootstrap} disabled={bootstrapMutation.isPending}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {bootstrapMutation.isPending ? "Bootstrapping..." : "Initialize Accounts"}
            </Button>
          )}
          {accounts.length > 0 && (
            <Button onClick={() => setShowJournalEntry(true)}>
              <Plus className="w-4 h-4 mr-2" /> New Journal Entry
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="journal-entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <ArrowDownCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Incoming</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(incoming?.total)}</p>
                  </div>
                </div>
                {incoming?.entries?.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {incoming.entries.map((e: any) => (
                      <div key={e.code} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{e.name}</span>
                        <span className="font-medium">{fmt(e.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <ArrowUpCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Outgoing</p>
                    <p className="text-2xl font-bold text-red-600">{fmt(outgoing?.total)}</p>
                  </div>
                </div>
                {outgoing?.entries?.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {outgoing.entries.map((e: any) => (
                      <div key={e.code} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{e.name}</span>
                        <span className="font-medium">{fmt(e.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <IndianRupee className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <p className={`text-2xl font-bold ${(pl?.netProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {fmt(pl?.netProfit)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Income: {fmt(pl?.totalIncome)} | Expenses: {fmt(pl?.totalExpense)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader><CardTitle>Chart of Accounts</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono">{a.code}</TableCell>
                      <TableCell>{a.name}</TableCell>
                      <TableCell><Badge variant="outline">{a.type}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial-balance">
          <Card>
            <CardHeader><CardTitle>Trial Balance</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balances.map((b: any) => (
                    <TableRow key={b.accountId}>
                      <TableCell className="font-mono">{b.code}</TableCell>
                      <TableCell>{b.name}</TableCell>
                      <TableCell><Badge variant="outline">{b.type}</Badge></TableCell>
                      <TableCell className="text-right">{b.totalDebit > 0 ? fmt(b.totalDebit) : "-"}</TableCell>
                      <TableCell className="text-right">{b.totalCredit > 0 ? fmt(b.totalCredit) : "-"}</TableCell>
                      <TableCell className={`text-right font-medium ${b.balance >= 0 ? "" : "text-red-600"}`}>
                        {fmt(b.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal-entries">
          <Card>
            <CardHeader><CardTitle>Journal Entries</CardTitle></CardHeader>
            <CardContent>
              {journalEntries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No journal entries yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Narration</TableHead>
                      <TableHead className="text-right">Lines</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.map((je: any) => (
                      <TableRow key={je.id}>
                        <TableCell>{new Date(je.entryDate).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell className="font-mono">{je.reference || "-"}</TableCell>
                        <TableCell>{je.narration || "-"}</TableCell>
                        <TableCell className="text-right">{je.lines?.length || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pl">
          <Card>
            <CardHeader><CardTitle>Profit & Loss Statement</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-green-700 mb-3">Income</h3>
                {pl?.income?.length > 0 ? (
                  <Table>
                    <TableHeader><TableRow><TableHead>Account</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {pl.income.map((i: any) => (
                        <TableRow key={i.code}><TableCell>{i.name}</TableCell><TableCell className="text-right">{fmt(i.amount)}</TableCell></TableRow>
                      ))}
                      <TableRow className="font-bold"><TableCell>Total Income</TableCell><TableCell className="text-right">{fmt(pl.totalIncome)}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                ) : <p className="text-muted-foreground">No income recorded</p>}
              </div>
              <div>
                <h3 className="font-semibold text-red-700 mb-3">Expenses</h3>
                {pl?.expense?.length > 0 ? (
                  <Table>
                    <TableHeader><TableRow><TableHead>Account</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {pl.expense.map((e: any) => (
                        <TableRow key={e.code}><TableCell>{e.name}</TableCell><TableCell className="text-right">{fmt(e.amount)}</TableCell></TableRow>
                      ))}
                      <TableRow className="font-bold"><TableCell>Total Expenses</TableCell><TableCell className="text-right">{fmt(pl.totalExpense)}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                ) : <p className="text-muted-foreground">No expenses recorded</p>}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Profit / (Loss)</span>
                  <span className={(pl?.netProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}>{fmt(pl?.netProfit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader><CardTitle>Balance Sheet</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Assets</h3>
                {bs?.assets?.length > 0 ? (
                  <Table>
                    <TableHeader><TableRow><TableHead>Account</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {bs.assets.map((a: any) => (
                        <TableRow key={a.code}><TableCell>{a.name}</TableCell><TableCell className="text-right">{fmt(a.balance)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-muted-foreground">No assets</p>}
              </div>
              <div>
                <h3 className="font-semibold mb-3">Liabilities</h3>
                {bs?.liabilities?.length > 0 ? (
                  <Table>
                    <TableHeader><TableRow><TableHead>Account</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {bs.liabilities.map((l: any) => (
                        <TableRow key={l.code}><TableCell>{l.name}</TableCell><TableCell className="text-right">{fmt(l.balance)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-muted-foreground">No liabilities</p>}
              </div>
              <div>
                <h3 className="font-semibold mb-3">Equity</h3>
                {bs?.equity?.length > 0 ? (
                  <Table>
                    <TableHeader><TableRow><TableHead>Account</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {bs.equity.map((e: any) => (
                        <TableRow key={e.code}><TableCell>{e.name}</TableCell><TableCell className="text-right">{fmt(e.balance)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-muted-foreground">No equity</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showJournalEntry} onOpenChange={setShowJournalEntry}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Journal Entry</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Reference</Label>
                <Input value={jeForm.reference} onChange={(e) => setJeForm({ ...jeForm, reference: e.target.value })} placeholder="e.g. INV-2026-001" />
              </div>
              <div className="space-y-1">
                <Label>Narration</Label>
                <Input value={jeForm.narration} onChange={(e) => setJeForm({ ...jeForm, narration: e.target.value })} placeholder="Description of the entry" />
              </div>
            </div>
            {jeForm.lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2 items-end">
                <div className="space-y-1">
                  <Label>Account</Label>
                  <Select value={line.accountId} onValueChange={(v) => {
                    const lines = [...jeForm.lines];
                    lines[idx].accountId = v;
                    setJeForm({ ...jeForm, lines });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a: any) => (
                        <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Debit</Label>
                  <Input type="number" value={line.debitAmount} onChange={(e) => {
                    const lines = [...jeForm.lines];
                    lines[idx].debitAmount = e.target.value;
                    setJeForm({ ...jeForm, lines });
                  }} />
                </div>
                <div className="space-y-1">
                  <Label>Credit</Label>
                  <Input type="number" value={line.creditAmount} onChange={(e) => {
                    const lines = [...jeForm.lines];
                    lines[idx].creditAmount = e.target.value;
                    setJeForm({ ...jeForm, lines });
                  }} />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setJeForm({ ...jeForm, lines: [...jeForm.lines, { accountId: "", debitAmount: "0", creditAmount: "0" }] })}>
              Add Line
            </Button>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowJournalEntry(false)}>Cancel</Button>
              <Button onClick={handleCreateJE} disabled={createJe.isPending}>
                {createJe.isPending ? "Creating..." : "Create Entry"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
