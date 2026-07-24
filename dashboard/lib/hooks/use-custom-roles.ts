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
    onSuccess: (_: any, variables: { id: string }) => {
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
    onSuccess: (_: any, variables: { userId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions", variables.userId] });
    },
  });
}
