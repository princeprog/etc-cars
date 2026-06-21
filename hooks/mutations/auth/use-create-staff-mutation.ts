"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authQueryKeys } from "@/hooks/queries/auth/auth-query-keys"
import { createStaff } from "@/services/auth.service"
import type { CreateStaffPayload } from "@/types/auth"

export function useCreateStaffMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => createStaff(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.users })
    },
  })
}
