"use client"

import { useQuery } from "@tanstack/react-query"

import { roleQueryKeys } from "@/hooks/queries/roles/role-query-keys"
import { getRole } from "@/services/roles.service"

export function useRoleQuery(id: string) {
  return useQuery({
    queryKey: roleQueryKeys.detail(id),
    queryFn: () => getRole(id),
    enabled: id !== "new",
    staleTime: 30_000,
  })
}
