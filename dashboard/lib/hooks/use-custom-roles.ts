import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";

function fetchCustomRoles() {
  return get("/roles/all");
}

function fetchCustomRole(id: string) {
  return get(`/roles/${id}`);
}

function createCustomRoleApi(data: any) {
  return post("/roles", { request: data });
}

function updateCustomRoleApi(id: string, data: any) {
  return patch(`/roles/${id}`, { request: data });
}

function deleteCustomRoleApi(id: string) {
  return del(`/roles/${id}`);
}

function fetchAvailablePermissions() {
  return get("/permissions");
}

function fetchRoleTemplates() {
  return get("/role-templates");
}

function fetchPermissionMatrix() {
  return get("/matrix");
}

function fetchUserPicker(search: string) {
  return get("/users/picker", { search, limit: 50 });
}

function applyRoleApi(roleId: string, userId: string) {
  return post(`/roles/${roleId}/apply`, { request: { userId } });
}

function fetchUserPermissions(userId: string) {
  return get(`/users/${userId}/permissions`);
}

function assignUserPermissionsApi(userId: string, permissions: string[]) {
  return patch(`/users/${userId}/permissions`, { request: { permissions } });
}

export function useCustomRoles() {
  return useQuery({
    queryKey: ["custom-roles"],
    queryFn: fetchCustomRoles,
    staleTime: 30_000,
  });
}

export function useCustomRole(id: string) {
  return useQuery({
    queryKey: ["custom-role", id],
    queryFn: () => fetchCustomRole(id),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });
}

export function useCreateCustomRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomRoleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
    },
  });
}

export function useUpdateCustomRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCustomRoleApi(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
      queryClient.invalidateQueries({ queryKey: ["custom-role", variables.id] });
    },
  });
}

export function useDeleteCustomRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomRoleApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
    },
  });
}

export function useAvailablePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: fetchAvailablePermissions,
    staleTime: 5 * 60_000,
  });
}

export function useRoleTemplates() {
  return useQuery({
    queryKey: ["role-templates"],
    queryFn: fetchRoleTemplates,
    staleTime: 5 * 60_000,
  });
}

/**
 * Feature permission matrix definition (modules × levels) served by GET /matrix.
 * Each module lists the permission levels that exist for it plus the runtime
 * Permission enum values granted by each level.
 */
export function usePermissionMatrix() {
  return useQuery({
    queryKey: ["permission-matrix"],
    queryFn: fetchPermissionMatrix,
    staleTime: 5 * 60_000,
  });
}

/**
 * Convert a matrix (array of { module, levels }) into the payload sent to
 * POST/PATCH /roles — the backend flattens it into runtime permissions.
 */
export function matrixToPayload(matrix: { module: string; levels: string[] }[]) {
  return matrix.filter((m) => m && Array.isArray(m.levels) && m.levels.length > 0);
}

export function useUserPicker(search: string, enabled: boolean) {
  return useQuery({
    queryKey: ["user-picker", search],
    queryFn: () => fetchUserPicker(search),
    enabled,
    staleTime: 15_000,
  });
}

export function useApplyRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, userId }: { roleId: string; userId: string }) =>
      applyRoleApi(roleId, userId),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions", variables.userId] });
    },
  });
}

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: ["user-permissions", userId],
    queryFn: () => fetchUserPermissions(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useAssignUserPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permissions }: { userId: string; permissions: string[] }) =>
      assignUserPermissionsApi(userId, permissions),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions", variables.userId] });
    },
  });
}
