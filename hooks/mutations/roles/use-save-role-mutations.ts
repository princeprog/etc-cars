"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { roleQueryKeys } from "@/hooks/queries/roles/role-query-keys"
import {
  archiveRole,
  createRole,
  restoreRole,
  updateRole,
} from "@/services/roles.service"
import type { ArchiveRolePayload, SaveRolePayload } from "@/types/roles"

export function useCreateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SaveRolePayload) => createRole(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roleQueryKeys.all })
      await queryClient.invalidateQueries({ queryKey: ["auth", "users"] })
    },
  })
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveRolePayload }) =>
      updateRole(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roleQueryKeys.all })
      await queryClient.invalidateQueries({ queryKey: ["auth", "users"] })
    },
  })
}

export function useArchiveRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ArchiveRolePayload
    }) => archiveRole(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roleQueryKeys.all })
      await queryClient.invalidateQueries({ queryKey: ["auth", "users"] })
    },
  })
}

export function useRestoreRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => restoreRole(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roleQueryKeys.all })
      await queryClient.invalidateQueries({ queryKey: ["auth", "users"] })
    },
  })
}
