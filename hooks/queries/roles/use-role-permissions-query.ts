"use client"

import { useQuery } from "@tanstack/react-query"

import { roleQueryKeys } from "@/hooks/queries/roles/role-query-keys"
import { getRolePermissions } from "@/services/roles.service"

export function useRolePermissionsQuery() {
  return useQuery({
    queryKey: roleQueryKeys.permissions(),
    queryFn: getRolePermissions,
    staleTime: 5 * 60_000,
  })
}
