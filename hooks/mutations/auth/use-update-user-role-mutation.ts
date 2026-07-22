"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateUserRole } from "@/services/auth.service"
import type { UpdateUserRolePayload } from "@/types/auth"

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateUserRolePayload
    }) => updateUserRole(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "users"] })
    },
  })
}
