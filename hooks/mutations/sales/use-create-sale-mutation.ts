"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { buyerLeadsQueryKeys } from "@/hooks/queries/buyer-leads/buyer-leads-query-keys"
import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { salesQueryKeys } from "@/hooks/queries/sales/sales-query-keys"
import { vehiclesQueryKeys } from "@/hooks/queries/vehicles/vehicles-query-keys"
import { createSale } from "@/services/sales.service"
import type { CreateSalePayload } from "@/types/sales"

export function useCreateSaleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSalePayload) => createSale(payload),
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
