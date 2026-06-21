"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { sellerLeadsQueryKeys } from "@/hooks/queries/seller-leads/seller-leads-query-keys"
import { updateSellerLead } from "@/services/seller-leads.service"
import type { UpdateSellerLeadPayload } from "@/types/seller-leads"

export function useUpdateSellerLeadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSellerLeadPayload }) =>
      updateSellerLead(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sellerLeadsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      ])
    },
  })
}
