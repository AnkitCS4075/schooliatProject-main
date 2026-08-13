"use client";

import { useMemo, useState } from "react";
import {
  useCustomRoles,
  useCustomRole,
  useCreateCustomRole,
  useUpdateCustomRole,
  useDeleteCustomRole,
  usePermissionMatrix,
} from "@/lib/hooks/use-custom-roles";
import { useToast } from "@/hooks/use-toast";
import { RoleTemplates } from "@/components/admin/custom-roles/role-templates";
import { PermissionMatrixEditor, type MatrixEntry } from "@/components/admin/custom-roles/permission-matrix-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Shield, Loader2 } from "lucide-react";

type RoleRow = {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  permissions: string[];
  matrix?: MatrixEntry[];
  isSystem: boolean;
};

/**
 * Full RBAC manager: role templates + the complete feature permission matrix
 * (module × View/Create/Edit/Delete/Export/Approve). Used standalone at
 * /admin/custom-roles and embedded in Settings → Roles.
 */
export function CustomRolesManager() {
  const { toast } = useToast();
  const { data: rolesData, isLoading, refetch } = useCustomRoles();
  const { data: matrixData } = usePermissionMatrix();
  const createRole = useCreateCustomRole();
  const updateRole = useUpdateCustomRole();
  const deleteRole = useDeleteCustomRole();

  const roles: RoleRow[] = useMemo(() => {
    const system = (rolesData?.data?.systemRoles || []).map((r: Record<string, unknown>) => ({
      ...r,
      isSystem: true,
    }));
    const custom = (rolesData?.data?.customRoles || []).map((r: Record<string, unknown>) => ({
      ...r,
      isSystem: r.isSystem ?? false,
    }));
    return [...system, ...custom] as RoleRow[];
  }, [rolesData]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRow | null>(null);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [matrix, setMatrix] = useState<MatrixEntry[]>([]);
  /** True once the admin edits the matrix — stops the server matrix from overriding. */
  const [matrixDirty, setMatrixDirty] = useState(false);

  // Fetch the full role detail (with the granular matrix rows) when editing —
  // /roles/all only returns the flattened permission array.
  const { data: editDetail } = useCustomRole(
    dialogOpen && editingRole && !editingRole.isSystem ? editingRole.id : ""
  );
  const serverMatrix: MatrixEntry[] = Array.isArray(editDetail?.data?.matrix)
    ? editDetail.data.matrix
    : [];
  // While the admin hasn't touched the matrix, prefer the server's granular
  // rows; fall back to the local snapshot while /roles/:id is loading.
  const effectiveMatrix =
    !matrixDirty && serverMatrix.length > 0 ? serverMatrix : matrix;

  const openCreate = () => {
    setEditingRole(null);
    setName("");
    setDisplayName("");
    setDescription("");
    setMatrix([]);
    setMatrixDirty(false);
    setDialogOpen(true);
  };

  const openEdit = (role: RoleRow) => {
    setEditingRole(role);
    setName(role.name);
    setDisplayName(role.displayName || role.name);
    setDescription(role.description || "");
    // Start with the best available view (matrix if present, else a flat
    // conversion) — replaced by the server matrix once /roles/:id resolves.
    setMatrix(
      Array.isArray(role.matrix) && role.matrix.length > 0
        ? role.matrix
        : modulesFromPermissions(role.permissions || [])
    );
    setMatrixDirty(false);
    setDialogOpen(true);
  };

  const handleMatrixChange = (next: MatrixEntry[]) => {
    setMatrixDirty(true);
    setMatrix(next);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: name.trim(),
        displayName: displayName.trim() || name.trim(),
        description: description.trim() || undefined,
        matrix: effectiveMatrix,
      };
      if (editingRole) {
        await updateRole.mutateAsync({ id: editingRole.id, data: payload });
        toast({ title: "Updated", description: "Role permissions updated" });
      } else {
        await createRole.mutateAsync(payload);
        toast({ title: "Created", description: "Custom role created" });
      }
      setDialogOpen(false);
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: (err as { message?: string })?.message || "Failed to save role",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this role? Users keep their current permissions.")) return;
    try {
      await deleteRole.mutateAsync(id);
      toast({ title: "Deleted", description: "Role deleted" });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as { message?: string })?.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Roles</h1>
          <p className="text-muted-foreground text-sm">
            Create roles from the full feature permission matrix — every module
            with granular View / Create / Edit / Delete / Export / Approve levels
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Role
        </Button>
      </div>

      <RoleTemplates />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No custom roles yet
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <Shield className="inline h-4 w-4 mr-2 text-muted-foreground" />
                      {role.displayName || role.name}
                      <div className="text-xs text-muted-foreground font-normal">
                        {role.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {(role.permissions || []).slice(0, 4).map((p: string) => (
                          <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                        ))}
                        {(role.permissions || []).length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{(role.permissions || []).length - 4} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.isSystem ? "default" : "outline"}>
                        {role.isSystem ? "System" : "Custom"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!role.isSystem ? (
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(role)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>
                          <Pencil className="h-4 w-4 mr-1" /> Preview
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog — full feature permission matrix */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingRole
                ? editingRole.isSystem
                  ? `Preview — ${editingRole.displayName || editingRole.name}`
                  : "Edit Role"
                : "New Role"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-4 min-h-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Role Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gate Operator"
                  readOnly={editingRole?.isSystem}
                  className={editingRole?.isSystem ? "bg-muted" : ""}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Gate Operator"
                  readOnly={editingRole?.isSystem}
                  className={editingRole?.isSystem ? "bg-muted" : ""}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this role do?"
                readOnly={editingRole?.isSystem}
                className={editingRole?.isSystem ? "bg-muted" : ""}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Permission Matrix —{" "}
                {editingRole?.isSystem
                  ? "read-only preview"
                  : "select modules and levels"}
              </label>
              <PermissionMatrixEditor
                definition={matrixData?.data}
                value={effectiveMatrix}
                onChange={handleMatrixChange}
                readOnly={editingRole?.isSystem}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {editingRole?.isSystem ? "Close" : "Cancel"}
            </Button>
            {!editingRole?.isSystem && (
              <Button
                onClick={handleSave}
                disabled={!name.trim() || createRole.isPending || updateRole.isPending}
              >
                {(createRole.isPending || updateRole.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingRole ? "Save" : "Create"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Fallback: derive a module × level matrix from a flat permission array so
 * legacy roles (without granular rows) still render in the grid.
 */
function modulesFromPermissions(permissions: string[]): MatrixEntry[] {
  const grouped: Record<string, Set<string>> = {};
  const LEVEL_BY_PREFIX: Record<string, string> = {
    GET: "VIEW",
    CREATE: "CREATE",
    EDIT: "EDIT",
    UPDATE: "EDIT",
    DELETE: "DELETE",
    EXPORT: "EXPORT",
    APPROVE: "APPROVE",
    PUBLISH: "APPROVE",
    GENERATE: "CREATE",
    RECORD: "CREATE",
    MANAGE: "EDIT",
    ASSIGN: "EDIT",
    SEND: "CREATE",
    MARK: "CREATE",
    ENTER: "CREATE",
    GRADE: "EDIT",
    ISSUE: "CREATE",
    RETURN: "EDIT",
    RESERVE: "CREATE",
    SUBMIT: "CREATE",
    USE: "VIEW",
    VIEW: "VIEW",
    REQUEST: "VIEW",
    CANCEL: "EDIT",
    CONVERT: "EDIT",
    SCHEDULE: "CREATE",
  };
  for (const perm of permissions || []) {
    const parts = String(perm).split("_");
    const level = LEVEL_BY_PREFIX[parts[0]] || "VIEW";
    const mod =
      parts.length > 2 ? parts.slice(1).slice(0, -1).join("_") : parts.slice(1).join("_") || "OTHER";
    if (!grouped[mod]) grouped[mod] = new Set();
    grouped[mod].add(level);
  }
  return Object.entries(grouped).map(([mod, levels]) => ({
    module: mod,
    levels: [...levels],
  }));
}
