"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authQueryKeys } from "@/hooks/queries/auth/auth-query-keys"
import { changePassword } from "@/services/auth.service"
import type {
  AuthenticatedUserResponse,
  ChangePasswordPayload,
} from "@/types/auth"

export function useChangePasswordMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    onSuccess: async (response: AuthenticatedUserResponse) => {
      queryClient.setQueryData(authQueryKeys.authenticatedUser, response)
      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.authenticatedUser,
      })
    },
  })
}
