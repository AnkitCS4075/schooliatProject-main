"use client";

import { useRef, useState } from "react";
import {
  useRoleTemplates,
  useUserPicker,
  useApplyRole,
} from "@/lib/hooks/use-custom-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutTemplate, UserPlus, Users, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

export function RoleTemplates() {
  const { data: templatesData, isLoading } = useRoleTemplates();
  const applyRole = useApplyRole();
  const templates = templatesData?.data || [];

  const [applyTarget, setApplyTarget] = useState<any>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const searchTimer = useRef<any>(null);

  const openPicker = (template: any) => {
    setApplyTarget(template);
    setSelectedUser(null);
    setSearch("");
    setDebouncedSearch("");
    setPickerOpen(true);
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const { data: usersData, isLoading: usersLoading } = useUserPicker(
    debouncedSearch,
    pickerOpen
  );
  const users = usersData?.data || [];

  const handleApply = async () => {
    if (!applyTarget || !selectedUser) return;
    try {
      const res = await applyRole.mutateAsync({
        roleId: applyTarget.id,
        userId: selectedUser.id,
      });
      toast.success(res?.message || "Role applied to user");
      setPickerOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to apply role");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
          Role Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No role templates available
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template: any) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 flex flex-col gap-3"
              >
                <div>
                  <h3 className="font-semibold text-sm">
                    {template.displayName || template.name}
                  </h3>
                  {template.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {(template.permissions || []).length} permissions
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(template.permissions || [])
                    .slice(0, 6)
                    .map((p: string) => (
                      <Badge key={p} variant="secondary" className="text-[10px]">
                        {p}
                      </Badge>
                    ))}
                  {(template.permissions || []).length > 6 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{(template.permissions || []).length - 6} more
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  className="mt-auto"
                  onClick={() => openPicker(template)}
                >
                  <UserPlus className="mr-2 h-4 w-4" /> Apply
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Apply-to-user picker dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Apply &quot;{applyTarget?.displayName || applyTarget?.name}&quot;
            </DialogTitle>
            <DialogDescription>
              Choose a user to grant this role&apos;s permissions. Existing
              permissions are kept and merged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name, login ID or email..."
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-64 border rounded-lg">
              {usersLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  {debouncedSearch
                    ? "No users match your search"
                    : "Type to search for a user"}
                </p>
              ) : (
                <div className="divide-y">
                  {users.map((user: any) => {
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className={`w-full text-left px-4 py-3 hover:bg-muted flex items-center justify-between gap-3 ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.firstName} {user.lastName}
                              <span className="text-muted-foreground font-normal">
                                {" "}
                                ({user.publicUserId})
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email} • {user.role?.name || user.userType}
                              {user.school?.name ? ` • ${user.school.name}` : ""}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-primary text-sm font-medium">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPickerOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!selectedUser || applyRole.isPending}
            >
              {applyRole.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {selectedUser
                ? `Apply to ${selectedUser.firstName} ${selectedUser.lastName}`
                : "Select a user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
