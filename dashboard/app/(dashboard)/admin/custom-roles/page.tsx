"use client";

import { useState } from "react";
import {
  useCustomRoles,
  useCreateCustomRole,
  useUpdateCustomRole,
  useDeleteCustomRole,
  useAvailablePermissions,
} from "@/lib/hooks/use-custom-roles";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";

export default function CustomRolesPage() {
  const { toast } = useToast();
  const { data: rolesData, isLoading, refetch } = useCustomRoles();
  const { data: permsData } = useAvailablePermissions();
  const createRole = useCreateCustomRole();
  const updateRole = useUpdateCustomRole();
  const deleteRole = useDeleteCustomRole();

  const roles = [
    ...((rolesData?.data?.systemRoles || []).map((r: any) => ({ ...r, isSystem: true }))),
    ...((rolesData?.data?.customRoles || []).map((r: any) => ({ ...r, isSystem: r.isSystem ?? false }))),
  ];
  const permissions = permsData?.data || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [name, setName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const openCreate = () => {
    setEditingRole(null);
    setName("");
    setSelectedPerms([]);
    setDialogOpen(true);
  };

  const openEdit = (role: any) => {
    setEditingRole(role);
    setName(role.name);
    setSelectedPerms(role.permissions || []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingRole) {
        await updateRole.mutateAsync({ id: editingRole.id, data: { name, permissions: selectedPerms } });
        toast({ title: "Updated", description: "Role updated" });
      } else {
        await createRole.mutateAsync({ name, permissions: selectedPerms });
        toast({ title: "Created", description: "Role created" });
      }
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this role?")) return;
    try {
      await deleteRole.mutateAsync(id);
      toast({ title: "Deleted", description: "Role deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  // Group permissions by category
  const permGroups: Record<string, string[]> = {};
  for (const perm of permissions) {
    const group = perm.split("_")[0] || "Other";
    if (!permGroups[group]) permGroups[group] = [];
    permGroups[group].push(perm);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Roles</h1>
          <p className="text-muted-foreground text-sm">Create and manage custom roles with specific permissions</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Role
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
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
                roles.map((role: any) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <Shield className="inline h-4 w-4 mr-2 text-muted-foreground" />
                      {role.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(role.permissions || []).slice(0, 5).map((p: string) => (
                          <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                        ))}
                        {(role.permissions || []).length > 5 && (
                          <Badge variant="outline" className="text-xs">+{(role.permissions || []).length - 5} more</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.isSystem ? "default" : "outline"}>
                        {role.isSystem ? "System" : "Custom"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!role.isSystem && (
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(role)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "New Role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Role Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Front Desk" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Permissions ({selectedPerms.length} selected)</label>
              <ScrollArea className="h-[300px] border rounded-lg p-4">
                {Object.entries(permGroups).map(([group, perms]) => (
                  <div key={group} className="mb-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{group}</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {perms.map((perm) => (
                        <label key={perm} className="flex items-center gap-2 text-xs cursor-pointer">
                          <Checkbox
                            checked={selectedPerms.includes(perm)}
                            onCheckedChange={() => togglePerm(perm)}
                          />
                          {perm}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name || createRole.isPending || updateRole.isPending}>
              {editingRole ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
