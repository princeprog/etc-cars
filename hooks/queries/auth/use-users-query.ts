"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { authQueryKeys } from "@/hooks/queries/auth/auth-query-keys"
import { getUsers } from "@/services/auth.service"
import type { ListUsersParams } from "@/types/auth"

export function useUsersQuery(params: ListUsersParams) {
  return useQuery({
    queryKey: authQueryKeys.users(params),
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}
