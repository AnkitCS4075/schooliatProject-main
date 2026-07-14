"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Minus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StaffAttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";

/** Radix Select needs a stable value; must not collide with real statuses. */
const STAFF_ATT_UNMARKED = "__UNMARKED__" as const;

export interface StaffAttendanceRow {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  /** School-facing staff / teacher ID */
  publicUserId?: string;
  kind: "TEACHER" | "STAFF";
}

interface StaffAttendanceTableProps {
  members: StaffAttendanceRow[];
  getStatus: (id: string) => StaffAttendanceStatus | null;
  onSetStatus: (id: string, status: StaffAttendanceStatus) => void;
  /** When set, "Mark selected …" saves immediately via API (same as student attendance bulk). */
  onBulkMarkSelected?: (
    status: StaffAttendanceStatus,
    memberIds: string[]
  ) => void | Promise<void>;
  disabled?: boolean;
}

export function StaffAttendanceTable({
  members,
  getStatus,
  onSetStatus,
  onBulkMarkSelected,
  disabled = false,
}: StaffAttendanceTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => {
    return [...members].sort((a, b) => {
      const na = `${a.firstName} ${a.lastName || ""}`.trim().toLowerCase();
      const nb = `${b.firstName} ${b.lastName || ""}`.trim().toLowerCase();
      return na.localeCompare(nb);
    });
  }, [members]);

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === sorted.length && sorted.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sorted.map((m) => m.id)));
    }
  };

  const clearSelection = () => setSelected(new Set());

  return (
    <div className="space-y-4">
      {selected.size > 0 && (
        <div className="bg-white rounded-lg p-4 border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Badge variant="secondary">{selected.size} selected</Badge>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={async () => {
                const ids = Array.from(selected);
                if (onBulkMarkSelected) {
                  await onBulkMarkSelected("PRESENT", ids);
                } else {
                  ids.forEach((id) => onSetStatus(id, "PRESENT"));
                }
                clearSelection();
              }}
            >
              Mark selected present
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={async () => {
                const ids = Array.from(selected);
                if (onBulkMarkSelected) {
                  await onBulkMarkSelected("ABSENT", ids);
                } else {
                  ids.forEach((id) => onSetStatus(id, "ABSENT"));
                }
                clearSelection();
              }}
            >
              Mark selected absent
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={async () => {
                const ids = Array.from(selected);
                if (onBulkMarkSelected) {
                  await onBulkMarkSelected("LATE", ids);
                } else {
                  ids.forEach((id) => onSetStatus(id, "LATE"));
                }
                clearSelection();
              }}
            >
              Mark selected late
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={async () => {
                const ids = Array.from(selected);
                if (onBulkMarkSelected) {
                  await onBulkMarkSelected("HALF_DAY", ids);
                } else {
                  ids.forEach((id) => onSetStatus(id, "HALF_DAY"));
                }
                clearSelection();
              }}
            >
              Mark selected half day
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      sorted.length > 0 && selected.size === sorted.length
                    }
                    onCheckedChange={() => toggleAll()}
                  />
                </TableHead>
                <TableHead className="w-14">No</TableHead>
                <TableHead>Staff Name</TableHead>
                <TableHead className="w-32">Staff ID</TableHead>
                <TableHead className="w-28">Role</TableHead>
                <TableHead className="w-44">Status</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No people match your filters
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((member, idx) => {
                  const currentStatus = getStatus(member.id);
                  const selectValue =
                    currentStatus === "PRESENT" ||
                    currentStatus === "ABSENT" ||
                    currentStatus === "LATE" ||
                    currentStatus === "HALF_DAY"
                      ? currentStatus
                      : STAFF_ATT_UNMARKED;
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(member.id)}
                          onCheckedChange={() => toggleOne(member.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">
                        {String(idx + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <div className="font-medium text-foreground">
                              {member.firstName} {member.lastName || ""}
                            </div>
                            {member.email ? (
                              <div className="text-xs text-muted-foreground">
                                {member.email}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {member.publicUserId ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            member.kind === "TEACHER"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          )}
                        >
                          {member.kind === "TEACHER" ? "Teacher" : "Staff"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={selectValue}
                          onValueChange={(value) => {
                            if (value === STAFF_ATT_UNMARKED) return;
                            onSetStatus(member.id, value as StaffAttendanceStatus);
                          }}
                          disabled={disabled}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Not marked" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={STAFF_ATT_UNMARKED}>
                              <span className="text-muted-foreground">Not marked</span>
                            </SelectItem>
                            <SelectItem value="PRESENT">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                Present
                              </div>
                            </SelectItem>
                            <SelectItem value="ABSENT">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                Absent
                              </div>
                            </SelectItem>
                            <SelectItem value="LATE">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                Late
                              </div>
                            </SelectItem>
                            <SelectItem value="HALF_DAY">
                              <div className="flex items-center gap-2">
                                <Minus className="h-4 w-4 text-amber-700" />
                                Half day
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            disabled ||
                            !onBulkMarkSelected ||
                            selectValue === STAFF_ATT_UNMARKED
                          }
                          onClick={async () => {
                            if (!onBulkMarkSelected || selectValue === STAFF_ATT_UNMARKED) return;
                            await onBulkMarkSelected(
                              selectValue as StaffAttendanceStatus,
                              [member.id],
                            );
                          }}
                          className="border-[#4CAF50] text-[#2f6b1f] bg-[#eff9eb] hover:bg-[#e5f5df]"
                        >
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
