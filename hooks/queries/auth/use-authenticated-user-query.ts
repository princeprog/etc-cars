"use client"

import { useQuery } from "@tanstack/react-query"

import { getAuthenticatedUser } from "@/services/auth.service"
import { authQueryKeys } from "./auth-query-keys"

export function useAuthenticatedUserQuery() {
  return useQuery({
    queryKey: authQueryKeys.authenticatedUser,
    queryFn: getAuthenticatedUser,
    retry: false,
    staleTime: 60_000,
  })
}
