"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClassItem } from "@/lib/schemas/class-schema";
import type { FeeComponentRow } from "@/lib/class-fee-structure";
import { sumFeeComponentRows, getClassAnnualFeeDisplay } from "@/lib/class-fee-structure";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const DIVISION_OPTIONS = ["A", "B", "C", "D", "E", "F"].map((div) => ({
  value: div,
  label: div,
}));

interface ClassFormTableProps {
  classes: ClassItem[];
  teachers: Array<{ id: string; firstName: string; lastName: string }>;
  errors: Record<string, string>;
  onChange: (classes: ClassItem[]) => void;
  onFieldChange: (index: number, field: keyof ClassItem, value: any) => void;
}

export function ClassFormTable({
  classes,
  teachers,
  errors,
  onChange,
  onFieldChange,
}: ClassFormTableProps) {
  const [feeDialogIndex, setFeeDialogIndex] = useState<number | null>(null);
  const [feeDraft, setFeeDraft] = useState<FeeComponentRow[]>([]);

  const addRow = () => {
    onChange([
      ...classes,
      {
        id: null,
        grade: "",
        division: "",
        classTeacherId: null,
        defaultAnnualFee: null,
        defaultMonthlyFee: null,
        defaultFeeComponents: null,
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (classes.length > 1) {
      onChange(classes.filter((_, i) => i !== index));
    }
  };

  const teacherOptions = teachers.map((teacher) => ({
    value: teacher.id,
    label: `${teacher.firstName} ${teacher.lastName}`,
  }));

  const openFeeDialog = (index: number) => {
    const cls = classes[index];
    let draft: FeeComponentRow[];
    if (cls.defaultFeeComponents && cls.defaultFeeComponents.length > 0) {
      draft = cls.defaultFeeComponents.map((r) => ({
        label: r.label,
        amount: Number(r.amount) || 0,
      }));
    } else if (cls.defaultAnnualFee != null && cls.defaultAnnualFee > 0) {
      draft = [{ label: "Annual fee", amount: cls.defaultAnnualFee }];
    } else {
      draft = [{ label: "", amount: 0 }];
    }
    setFeeDraft(draft);
    setFeeDialogIndex(index);
  };

  const applyFeeDraft = () => {
    if (feeDialogIndex === null) return;
    const finalRows = feeDraft
      .map((r) => ({
        label: r.label.trim(),
        amount: Math.max(0, Math.round(Number(r.amount) || 0)),
      }))
      .filter((r) => r.label.length > 0 && r.amount > 0);

    const newClasses = [...classes];
    if (finalRows.length === 0) {
      newClasses[feeDialogIndex] = {
        ...newClasses[feeDialogIndex],
        defaultFeeComponents: null,
        defaultAnnualFee: null,
      };
    } else {
      newClasses[feeDialogIndex] = {
        ...newClasses[feeDialogIndex],
        defaultFeeComponents: finalRows,
        defaultAnnualFee: null,
      };
    }
    onChange(newClasses);
    setFeeDialogIndex(null);
  };

  const addFeeLine = () => {
    setFeeDraft((d) => [...d, { label: "", amount: 0 }]);
  };

  const removeFeeLine = (i: number) => {
    setFeeDraft((d) => (d.length <= 1 ? d : d.filter((_, j) => j !== i)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Class Information</h3>
        <Button type="button" onClick={addRow} variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Class
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[180px]">
                  Grade *
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[180px]">
                  Division *
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[220px]">
                  Class Teacher
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[220px]">
                  Annual fee structure
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[140px]">
                  Monthly fee (₹)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[60px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls, index) => (
                <tr key={cls.id || index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Select
                      value={cls.grade || ""}
                      onValueChange={(value) => onFieldChange(index, "grade", value)}
                    >
                      <SelectTrigger
                        className={errors[`grade_${index}`] ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`grade_${index}`] && (
                      <p className="text-sm text-red-500 mt-1">{errors[`grade_${index}`]}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={cls.division || ""}
                      onValueChange={(value) => onFieldChange(index, "division", value)}
                    >
                      <SelectTrigger
                        className={errors[`division_${index}`] ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select Division" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIVISION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`division_${index}`] && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors[`division_${index}`]}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={cls.classTeacherId || "none"}
                      onValueChange={(value) =>
                        onFieldChange(index, "classTeacherId", value === "none" ? null : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {teacherOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="space-y-1 min-w-[200px]">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => openFeeDialog(index)}
                      >
                        {cls.defaultFeeComponents && cls.defaultFeeComponents.length > 0
                          ? "Edit fee lines"
                          : "Set fee lines"}
                      </Button>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {getClassAnnualFeeDisplay(cls).primary}
                        {cls.defaultFeeComponents && cls.defaultFeeComponents.length > 0 ? (
                          <span className="block mt-0.5 tabular-nums">
                            Total ₹{sumFeeComponentRows(cls.defaultFeeComponents).toLocaleString("en-IN")}
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="× installments"
                      value={cls.defaultMonthlyFee ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        onFieldChange(
                          index,
                          "defaultMonthlyFee",
                          v === "" ? null : Math.max(0, parseInt(v, 10) || 0),
                        );
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {classes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={feeDialogIndex !== null} onOpenChange={(o) => !o && setFeeDialogIndex(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Annual fee structure</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Add named fee lines (e.g. tuition, transport). The total is used as the annual fee for new
            student fee plans in this class. Leave empty to use school defaults from Settings → Fees.
          </p>
          <div className="space-y-3 py-2">
            {feeDraft.map((row, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    placeholder="e.g. Tuition"
                    value={row.label}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFeeDraft((d) => {
                        const next = [...d];
                        next[i] = { ...next[i], label: v };
                        return next;
                      });
                    }}
                  />
                </div>
                <div className="w-28 space-y-1">
                  <Label className="text-xs">Amount (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={row.amount === 0 ? "" : row.amount}
                    onChange={(e) => {
                      const v = e.target.value;
                      const n = v === "" ? 0 : Math.max(0, parseInt(v, 10) || 0);
                      setFeeDraft((d) => {
                        const next = [...d];
                        next[i] = { ...next[i], amount: n };
                        return next;
                      });
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6 shrink-0 text-muted-foreground"
                  onClick={() => removeFeeLine(i)}
                  disabled={feeDraft.length <= 1}
                  aria-label="Remove line"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addFeeLine}>
            <Plus className="w-4 h-4" />
            Add fee line
          </Button>
          <p className="text-sm font-medium tabular-nums">
            Sum: ₹{sumFeeComponentRows(feeDraft).toLocaleString("en-IN")}
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setFeeDialogIndex(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyFeeDraft}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
