"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Percent, DollarSign, Clock, TrendingDown, Calculator, Settings, Award } from "lucide-react";
import {
  useDiscounts,
  useDiscountStats,
  useCreateDiscount,
  useUpdateDiscount,
  useDeleteDiscount,
  useLateFeeRule,
  useSaveLateFeeRule,
  useCalculateLateFees,
  type FeeDiscount,
  type LateFeeRule,
} from "@/lib/hooks/use-fee-discounts";
import { toast } from "sonner";

const DISCOUNT_TYPES = [
  { value: "SCHOLARSHIP", label: "Scholarship" },
  { value: "DISCOUNT", label: "Discount" },
  { value: "SIBLING_DISCOUNT", label: "Sibling Discount" },
  { value: "STAFF_WARD", label: "Staff Ward" },
  { value: "EARLY_BIRD", label: "Early Bird" },
  { value: "OTHER", label: "Other" },
];

const LATE_FEE_TYPES = [
  { value: "FIXED", label: "Fixed Amount" },
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "PER_DAY", label: "Per Day" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function DiscountDialog({ open, onOpenChange, editDiscount }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editDiscount?: FeeDiscount | null;
}) {
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();
  const [name, setName] = useState(editDiscount?.name || "");
  const [description, setDescription] = useState(editDiscount?.description || "");
  const [type, setType] = useState(editDiscount?.type || "SCHOLARSHIP");
  const [value, setValue] = useState(String(editDiscount?.value || ""));
  const [isPercentage, setIsPercentage] = useState(editDiscount?.isPercentage ?? true);

  const handleSubmit = async () => {
    if (!name || !value) { toast.error("Name and value are required"); return; }
    try {
      if (editDiscount) {
        await updateDiscount.mutateAsync({ id: editDiscount.id, name, description, type, value: Number(value), isPercentage });
        toast.success("Discount updated");
      } else {
        await createDiscount.mutateAsync({ name, description, type, value: Number(value), isPercentage });
        toast.success("Discount created");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save discount");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editDiscount ? "Edit Discount" : "Create Discount / Scholarship"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Merit Scholarship" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DISCOUNT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label>Value *</Label>
              <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={isPercentage} onCheckedChange={setIsPercentage} />
              <Label className="whitespace-nowrap">{isPercentage ? "% Amount" : "Flat Amount"}</Label>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={createDiscount.isPending || updateDiscount.isPending} className="w-full">
            {(createDiscount.isPending || updateDiscount.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editDiscount ? "Update" : "Create"} Discount
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LateFeeRuleDialog({ open, onOpenChange, existingRule }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRule?: LateFeeRule | null;
}) {
  const saveRule = useSaveLateFeeRule();
  const [name, setName] = useState(existingRule?.name || "Default Late Fee");
  const [calculationType, setCalculationType] = useState(existingRule?.calculationType || "FIXED");
  const [fixedAmount, setFixedAmount] = useState(String(existingRule?.fixedAmount || ""));
  const [percentage, setPercentage] = useState(String(existingRule?.percentage || ""));
  const [amountPerDay, setAmountPerDay] = useState(String(existingRule?.amountPerDay || ""));
  const [gracePeriodDays, setGracePeriodDays] = useState(String(existingRule?.gracePeriodDays || "0"));
  const [maxLateFee, setMaxLateFee] = useState(String(existingRule?.maxLateFee || ""));

  const handleSubmit = async () => {
    if (!name) { toast.error("Name is required"); return; }
    try {
      await saveRule.mutateAsync({
        name,
        calculationType,
        fixedAmount: fixedAmount ? Number(fixedAmount) : undefined,
        percentage: percentage ? Number(percentage) : undefined,
        amountPerDay: amountPerDay ? Number(amountPerDay) : undefined,
        gracePeriodDays: Number(gracePeriodDays),
        maxLateFee: maxLateFee ? Number(maxLateFee) : undefined,
        isActive: true,
      });
      toast.success("Late fee rule saved");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save rule");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{existingRule ? "Edit Late Fee Rule" : "Configure Late Fee Rule"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rule Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Calculation Type</Label>
            <Select value={calculationType} onValueChange={setCalculationType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LATE_FEE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {calculationType === "FIXED" && (
            <div className="space-y-2">
              <Label>Fixed Amount (INR)</Label>
              <Input type="number" value={fixedAmount} onChange={(e) => setFixedAmount(e.target.value)} />
            </div>
          )}
          {calculationType === "PERCENTAGE" && (
            <div className="space-y-2">
              <Label>Percentage (%)</Label>
              <Input type="number" value={percentage} onChange={(e) => setPercentage(e.target.value)} />
            </div>
          )}
          {calculationType === "PER_DAY" && (
            <div className="space-y-2">
              <Label>Amount Per Day (INR)</Label>
              <Input type="number" value={amountPerDay} onChange={(e) => setAmountPerDay(e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Grace Period (Days)</Label>
            <Input type="number" value={gracePeriodDays} onChange={(e) => setGracePeriodDays(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Max Late Fee Cap (INR, optional)</Label>
            <Input type="number" value={maxLateFee} onChange={(e) => setMaxLateFee(e.target.value)} placeholder="No cap" />
          </div>
          <Button onClick={handleSubmit} disabled={saveRule.isPending} className="w-full">
            {saveRule.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Rule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FeeDiscountManagement() {
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [editDiscount, setEditDiscount] = useState<FeeDiscount | null>(null);
  const [lateFeeDialogOpen, setLateFeeDialogOpen] = useState(false);

  const { data: discountsData, isLoading: loadingDiscounts } = useDiscounts();
  const { data: statsData } = useDiscountStats();
  const { data: lateFeeData } = useLateFeeRule();
  const deleteDiscount = useDeleteDiscount();
  const calculateLateFees = useCalculateLateFees();

  const discounts = (discountsData as any)?.data || [];
  const stats = (statsData as any)?.data || {};
  const lateFeeRule: LateFeeRule | null = (lateFeeData as any)?.data || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scholarships, Discounts & Late Fees</h1>
        <p className="text-muted-foreground text-sm">Manage fee discounts, scholarships, and late fee rules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><Award className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Discounts</p>
                <p className="text-2xl font-bold">{stats.totalDiscounts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10"><TrendingDown className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{stats.totalApplications || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><DollarSign className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Discounted</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalDiscountAmount || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10"><Clock className="h-5 w-5 text-orange-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Late Fee Rule</p>
                <p className="text-lg font-bold">{lateFeeRule ? lateFeeRule.name : "Not Set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="discounts">
        <TabsList>
          <TabsTrigger value="discounts">Discounts & Scholarships</TabsTrigger>
          <TabsTrigger value="late-fees">Late Fee Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="discounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Discounts & Scholarships</h2>
            <Button onClick={() => { setEditDiscount(null); setDiscountDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Discount
            </Button>
          </div>

          {loadingDiscounts ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : discounts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No discounts or scholarships configured yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounts.map((d: FeeDiscount) => (
                <Card key={d.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{d.name}</h3>
                        {d.description && <p className="text-sm text-muted-foreground mt-1">{d.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={d.isPercentage ? "default" : "secondary"}>
                            {d.isPercentage ? `${d.value}%` : formatCurrency(d.value)}
                          </Badge>
                          <Badge variant="outline">{DISCOUNT_TYPES.find((t) => t.value === d.type)?.label || d.type}</Badge>
                        </div>
                        {d._count && <p className="text-xs text-muted-foreground mt-2">Applied {d._count.applications} times</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditDiscount(d); setDiscountDialogOpen(true); }}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                          if (confirm("Delete this discount?")) deleteDiscount.mutate(d.id);
                        }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="late-fees" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Late Fee Configuration</h2>
            <div className="flex gap-2">
              {lateFeeRule && (
                <Button variant="outline" onClick={() => {
                  if (confirm("Calculate late fees for all overdue installments now?")) {
                    calculateLateFees.mutate(undefined, {
                      onSuccess: (res: any) => {
                        toast.success(`Late fees applied to ${res.data?.processedInstallments || 0} installments (${formatCurrency(res.data?.totalLateFeeApplied || 0)})`);
                      },
                      onError: (err: any) => toast.error(err?.message || "Failed to calculate late fees"),
                    });
                  }
                }}>
                  <Calculator className="mr-2 h-4 w-4" /> Calculate Now
                </Button>
              )}
              <Button onClick={() => setLateFeeDialogOpen(true)}>
                <Settings className="mr-2 h-4 w-4" /> {lateFeeRule ? "Edit Rule" : "Configure Rule"}
              </Button>
            </div>
          </div>

          {!lateFeeRule ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No late fee rule configured</p>
                <p className="text-sm mt-1">Click &quot;Configure Rule&quot; to set up how late fees are calculated</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Calculation Type</p>
                    <p className="font-semibold">{LATE_FEE_TYPES.find((t) => t.value === lateFeeRule.calculationType)?.label || lateFeeRule.calculationType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="font-semibold">
                      {lateFeeRule.calculationType === "FIXED" && formatCurrency(Number(lateFeeRule.fixedAmount || 0))}
                      {lateFeeRule.calculationType === "PERCENTAGE" && `${lateFeeRule.percentage}%`}
                      {lateFeeRule.calculationType === "PER_DAY" && `${formatCurrency(Number(lateFeeRule.amountPerDay || 0))}/day`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grace Period</p>
                    <p className="font-semibold">{lateFeeRule.gracePeriodDays} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Cap</p>
                    <p className="font-semibold">{lateFeeRule.maxLateFee ? formatCurrency(Number(lateFeeRule.maxLateFee)) : "No cap"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <DiscountDialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen} editDiscount={editDiscount} />
      <LateFeeRuleDialog open={lateFeeDialogOpen} onOpenChange={setLateFeeDialogOpen} existingRule={lateFeeRule} />
    </div>
  );
}
