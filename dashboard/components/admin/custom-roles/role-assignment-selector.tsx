"use client";

import { useMemo } from "react";
import {
  useCustomRoles,
  useCustomRole,
  usePermissionMatrix,
} from "@/lib/hooks/use-custom-roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PermissionMatrixPreview, type MatrixEntry } from "./permission-matrix-editor";
import { Shield, Loader2 } from "lucide-react";

interface RoleAssignmentSelectorProps {
  value: string;
  onChange: (roleId: string) => void;
  /** Optional helper text shown under the dropdown. */
  hint?: string;
}

/**
 * Inline role assignment for Teacher/Staff creation. Dropdown lists the
 * pre-built role templates + the school's custom roles; selecting one shows a
 * read-only preview of its full permission list (module × level matrix).
 */
export function RoleAssignmentSelector({
  value,
  onChange,
  hint,
}: RoleAssignmentSelectorProps) {
  const { data: rolesData } = useCustomRoles();
  const { data: roleDetail } = useCustomRole(value || "");
  const { data: matrixData } = usePermissionMatrix();

  const roles = useMemo(
    () =>
      (rolesData?.data?.customRoles || []).filter(
        (r: Record<string, unknown>) => !r.deletedAt && (r.schoolId || r.isSystem)
      ),
    [rolesData]
  );

  const selectedRole = roles.find(
    (r: Record<string, unknown>) => r.id === value
  );
  const matrix: MatrixEntry[] = Array.isArray(roleDetail?.data?.matrix)
    ? roleDetail.data.matrix
    : [];

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
          Assign Role (optional)
        </label>
        <Select
          value={value || undefined}
          onValueChange={(v) => onChange(v === "none" ? "" : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a role (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No role</SelectItem>
            {roles.map((role: Record<string, unknown>) => (
              <SelectItem key={String(role.id)} value={String(role.id)}>
                {String(role.displayName || role.name || "")}
                {role.isSystem ? " (Template)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>

      {value && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {selectedRole?.displayName || selectedRole?.name} — permission preview
            </p>
            <Badge variant="outline" className="text-xs">
              {((selectedRole?.permissions as string[]) || []).length} permissions
            </Badge>
          </div>

          {matrix.length > 0 && matrixData?.data ? (
            <ScrollArea className="h-52">
              <PermissionMatrixPreview
                definition={matrixData.data}
                value={matrix}
              />
            </ScrollArea>
          ) : (
            <div className="flex flex-wrap gap-1 max-h-52 overflow-y-auto">
              {((selectedRole?.permissions as string[]) || []).map((p: string) => (
                <Badge key={p} variant="secondary" className="text-[10px]">
                  {p}
                </Badge>
              ))}
              {!selectedRole && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading…
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
