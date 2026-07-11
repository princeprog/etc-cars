"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { buyerLeadsQueryKeys } from "@/hooks/queries/buyer-leads/buyer-leads-query-keys"
import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { salesQueryKeys } from "@/hooks/queries/sales/sales-query-keys"
import { vehiclesQueryKeys } from "@/hooks/queries/vehicles/vehicles-query-keys"
import {
  deleteSaleDraft,
  finalizeSaleDraft,
  saveSaleDraft,
  updateSaleDraft,
} from "@/services/sales.service"
import type {
  SaveSaleDraftPayload,
  UpdateSaleDraftPayload,
} from "@/types/sales"

export function useSaveSaleDraftMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SaveSaleDraftPayload) => saveSaleDraft(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: salesQueryKeys.all })
    },
  })
}

export function useUpdateSaleDraftMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateSaleDraftPayload
    }) => updateSaleDraft(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: salesQueryKeys.all })
    },
  })
}

export function useDeleteSaleDraftMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSaleDraft(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: salesQueryKeys.all })
    },
  })
}

export function useFinalizeSaleDraftMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => finalizeSaleDraft(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: salesQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: vehiclesQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: buyerLeadsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      ])
    },
  })
}
