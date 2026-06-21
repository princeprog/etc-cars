"use client"

import { useQuery } from "@tanstack/react-query"

import { authQueryKeys } from "@/hooks/queries/auth/auth-query-keys"
import { getUsers } from "@/services/auth.service"

export function useUsersQuery() {
  return useQuery({
    queryKey: authQueryKeys.users,
    queryFn: getUsers,
    staleTime: 30_000,
  })
}
