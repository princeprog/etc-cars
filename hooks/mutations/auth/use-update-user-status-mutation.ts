"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authQueryKeys } from "@/hooks/queries/auth/auth-query-keys"
import { updateUserStatus } from "@/services/auth.service"
import type { UpdateUserStatusPayload } from "@/types/auth"

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateUserStatusPayload
    }) => updateUserStatus(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.users })
    },
  })
}
