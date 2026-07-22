"use client"

import { useQuery } from "@tanstack/react-query"

import { roleQueryKeys } from "@/hooks/queries/roles/role-query-keys"
import { getRoles } from "@/services/roles.service"

export function useRolesQuery() {
  return useQuery({
    queryKey: roleQueryKeys.list(),
    queryFn: getRoles,
    staleTime: 30_000,
  })
}
