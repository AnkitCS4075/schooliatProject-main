"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BookOpen, Plus, Loader2, DollarSign, TrendingUp, TrendingDown, Scale,
} from "lucide-react";
import {
  useAccounts, useBootstrapAccounts, useCreateAccount,
  useJournalEntries, useCreateJournalEntry,
  useAccountBalances, useProfitAndLoss, useBalanceSheet,
  useOpeningBalances, useUpsertOpeningBalance,
} from "@/lib/hooks/use-accounting";
import { toast } from "sonner";

function formatCurrency(num: number | string | null | undefined): string {
  return `\u20B9${Number(num || 0).toLocaleString("en-IN")}`;
}

export default function AccountingPage() {
  const [showCreateEntry, setShowCreateEntry] = useState(false);
  const [entryForm, setEntryForm] = useState({
    entryDate: new Date().toISOString().split("T")[0],
    narration: "",
    lines: [
      { accountId: "", debitAmount: "0", creditAmount: "0" },
      { accountId: "", debitAmount: "0", creditAmount: "0" },
    ],
  });

  const { data: accountsRes, isLoading: loadingAccounts } = useAccounts();
  const bootstrapAcc = useBootstrapAccounts();
  const createAccount = useCreateAccount();
  const { data: journalRes, isLoading: loadingJournal } = useJournalEntries();
  const createEntry = useCreateJournalEntry();
  const { data: balancesRes, isLoading: loadingBalances } = useAccountBalances();
  const { data: plRes, isLoading: loadingPL } = useProfitAndLoss();
  const { data: bsRes, isLoading: loadingBS } = useBalanceSheet();
  const { data: obRes } = useOpeningBalances();
  const upsertOB = useUpsertOpeningBalance();

  const accounts = accountsRes?.data || [];
  const journalEntries = journalRes?.data || [];
  const balances = balancesRes?.data || [];
  const pl = plRes?.data;
  const bs = bsRes?.data;
  const openingBalances = obRes?.data || [];

  const handleBootstrap = async () => {
    try {
      await bootstrapAcc.mutateAsync();
      toast.success("Chart of accounts bootstrapped");
    } catch {
      toast.error("Failed to bootstrap accounts");
    }
  };

  const handleCreateEntry = async () => {
    const validLines = entryForm.lines.filter((l) => l.accountId);
    if (validLines.length < 2) {
      toast.error("At least 2 lines required");
      return;
    }
    try {
      await createEntry.mutateAsync({
        entryDate: entryForm.entryDate,
        narration: entryForm.narration,
        lines: validLines,
      });
      toast.success("Journal entry created");
      setShowCreateEntry(false);
      setEntryForm({
        entryDate: new Date().toISOString().split("T")[0],
        narration: "",
        lines: [
          { accountId: "", debitAmount: "0", creditAmount: "0" },
          { accountId: "", debitAmount: "0", creditAmount: "0" },
        ],
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create entry");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounting</h1>
          <p className="text-muted-foreground text-sm">Double-entry bookkeeping, reports &amp; trial balance</p>
        </div>
        <div className="flex gap-2">
          {accounts.length === 0 && (
            <Button variant="outline" onClick={handleBootstrap} disabled={bootstrapAcc.isPending}>
              {bootstrapAcc.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Initialize Chart of Accounts
            </Button>
          )}
          <Button onClick={() => setShowCreateEntry(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Journal Entry
          </Button>
        </div>
      </div>

      <Tabs defaultValue="trial-balance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="chart">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="pl">Profit &amp; Loss</TabsTrigger>
          <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="trial-balance">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Trial Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBalances ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : balances.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No accounts. Initialize chart of accounts first.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balances.filter((b: any) => b.debit > 0 || b.credit > 0 || b.openingBalance !== 0).map((b: any) => (
                        <TableRow key={b.code}>
                          <TableCell className="font-mono text-sm">{b.code}</TableCell>
                          <TableCell>{b.name}</TableCell>
                          <TableCell><Badge variant="outline">{b.type}</Badge></TableCell>
                          <TableCell className="text-right tabular-nums">{b.debit > 0 ? formatCurrency(b.debit) : "\u2014"}</TableCell>
                          <TableCell className="text-right tabular-nums">{b.credit > 0 ? formatCurrency(b.credit) : "\u2014"}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">{formatCurrency(b.closingBalance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Journal Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingJournal ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : journalEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No journal entries yet.</p>
              ) : (
                <div className="space-y-4">
                  {journalEntries.map((entry: any) => (
                    <div key={entry.id} className="border rounded-md p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{new Date(entry.entryDate).toLocaleDateString("en-IN")}</p>
                          {entry.narration && <p className="text-sm text-muted-foreground">{entry.narration}</p>}
                        </div>
                        {entry.reference && <Badge variant="secondary">{entry.reference}</Badge>}
                      </div>
                      <div className="ml-4 space-y-1">
                        {entry.lines?.map((line: any) => (
                          <div key={line.id} className="flex items-center gap-4 text-sm">
                            <span className="font-mono w-16">{line.account?.code}</span>
                            <span className="flex-1">{line.account?.name}</span>
                            {Number(line.debitAmount) > 0 && <span className="text-right w-24 tabular-nums">Dr {formatCurrency(line.debitAmount)}</span>}
                            {Number(line.creditAmount) > 0 && <span className="text-right w-24 tabular-nums">Cr {formatCurrency(line.creditAmount)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chart of Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAccounts ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No accounts. Click &quot;Initialize Chart of Accounts&quot; to start.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((acc: any) => (
                        <TableRow key={acc.id}>
                          <TableCell className="font-mono text-sm">{acc.code}</TableCell>
                          <TableCell>{acc.name}</TableCell>
                          <TableCell><Badge variant="outline">{acc.type}</Badge></TableCell>
                          <TableCell>{acc.isActive ? <Badge variant="default">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Profit &amp; Loss Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPL ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : !pl ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data available.</p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-green-700 mb-2">Income</h3>
                    {pl.income.filter((i: any) => i.amount !== 0).map((inc: any) => (
                      <div key={inc.code} className="flex justify-between text-sm py-1">
                        <span>{inc.name}</span>
                        <span className="tabular-nums">{formatCurrency(inc.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium border-t pt-1 mt-1">
                      <span>Total Income</span>
                      <span className="tabular-nums text-green-700">{formatCurrency(pl.totalIncome)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-red-700 mb-2">Expenses</h3>
                    {pl.expense.filter((e: any) => e.amount !== 0).map((exp: any) => (
                      <div key={exp.code} className="flex justify-between text-sm py-1">
                        <span>{exp.name}</span>
                        <span className="tabular-nums">{formatCurrency(exp.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium border-t pt-1 mt-1">
                      <span>Total Expenses</span>
                      <span className="tabular-nums text-red-700">{formatCurrency(pl.totalExpense)}</span>
                    </div>
                  </div>
                  <div className="border-t-2 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Net {pl.netProfit >= 0 ? "Profit" : "Loss"}</span>
                      <span className={`tabular-nums ${pl.netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {formatCurrency(Math.abs(pl.netProfit))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bs">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Balance Sheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBS ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : !bs ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data available.</p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Assets</h3>
                    {bs.assets.filter((a: any) => a.amount !== 0).map((asset: any) => (
                      <div key={asset.code} className="flex justify-between text-sm py-1">
                        <span>{asset.name}</span>
                        <span className="tabular-nums">{formatCurrency(asset.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium border-t pt-1 mt-1">
                      <span>Total Assets</span>
                      <span className="tabular-nums">{formatCurrency(bs.totalAssets)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Liabilities</h3>
                    {bs.liabilities.filter((l: any) => l.amount !== 0).map((liab: any) => (
                      <div key={liab.code} className="flex justify-between text-sm py-1">
                        <span>{liab.name}</span>
                        <span className="tabular-nums">{formatCurrency(liab.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium border-t pt-1 mt-1">
                      <span>Total Liabilities</span>
                      <span className="tabular-nums">{formatCurrency(bs.totalLiabilities)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Equity</h3>
                    {bs.equity.filter((e: any) => e.amount !== 0).map((eq: any) => (
                      <div key={eq.code} className="flex justify-between text-sm py-1">
                        <span>{eq.name}</span>
                        <span className="tabular-nums">{formatCurrency(eq.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium border-t pt-1 mt-1">
                      <span>Total Equity</span>
                      <span className="tabular-nums">{formatCurrency(bs.totalEquity)}</span>
                    </div>
                  </div>
                  <div className="border-t-2 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>L + E</span>
                      <span className="tabular-nums">{formatCurrency(bs.totalLiabilities + bs.totalEquity)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Journal Entry Dialog */}
      {showCreateEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Journal Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={entryForm.entryDate}
                    onChange={(e) => setEntryForm({ ...entryForm, entryDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Narration</Label>
                  <Input
                    value={entryForm.narration}
                    onChange={(e) => setEntryForm({ ...entryForm, narration: e.target.value })}
                    placeholder="Description of the entry"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Lines (debit + credit must be equal)</Label>
                {entryForm.lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_100px_100px] gap-2 items-end">
                    <div>
                      {idx < 2 && <span className="text-xs text-muted-foreground">Account</span>}
                      <Select
                        value={line.accountId}
                        onValueChange={(v) => {
                          const newLines = [...entryForm.lines];
                          newLines[idx].accountId = v;
                          setEntryForm({ ...entryForm, lines: newLines });
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc: any) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      {idx < 2 && <span className="text-xs text-muted-foreground">Debit</span>}
                      <Input
                        type="number"
                        value={line.debitAmount}
                        onChange={(e) => {
                          const newLines = [...entryForm.lines];
                          newLines[idx].debitAmount = e.target.value;
                          setEntryForm({ ...entryForm, lines: newLines });
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      {idx < 2 && <span className="text-xs text-muted-foreground">Credit</span>}
                      <Input
                        type="number"
                        value={line.creditAmount}
                        onChange={(e) => {
                          const newLines = [...entryForm.lines];
                          newLines[idx].creditAmount = e.target.value;
                          setEntryForm({ ...entryForm, lines: newLines });
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEntryForm({
                    ...entryForm,
                    lines: [...entryForm.lines, { accountId: "", debitAmount: "0", creditAmount: "0" }],
                  })}
                >
                  Add Line
                </Button>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateEntry(false)}>Cancel</Button>
                <Button onClick={handleCreateEntry} disabled={createEntry.isPending}>
                  {createEntry.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Create Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
