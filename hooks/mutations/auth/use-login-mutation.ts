"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { login } from "@/services/auth.service"
import type { LoginPayload } from "@/types/auth"
import { authQueryKeys } from "@/hooks/queries/auth/auth-query-keys"

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.authenticatedUser })
    },
  })
}
