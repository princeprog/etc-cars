"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { logout } from "@/services/auth.service"
import { authQueryKeys } from "@/hooks/queries/auth/auth-query-keys"

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.authenticatedUser })
      queryClient.removeQueries({ queryKey: authQueryKeys.authenticatedUser })
    },
  })
}
