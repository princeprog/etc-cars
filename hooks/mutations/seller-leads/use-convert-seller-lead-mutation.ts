"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { sellerLeadsQueryKeys } from "@/hooks/queries/seller-leads/seller-leads-query-keys"
import { vehiclesQueryKeys } from "@/hooks/queries/vehicles/vehicles-query-keys"
import { convertSellerLead } from "@/services/seller-leads.service"
import type { ConvertSellerLeadPayload } from "@/types/seller-leads"

export function useConvertSellerLeadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ConvertSellerLeadPayload }) =>
      convertSellerLead(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sellerLeadsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: vehiclesQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      ])
    },
  })
}
