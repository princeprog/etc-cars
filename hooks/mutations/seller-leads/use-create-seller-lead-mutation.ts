"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { sellerLeadsQueryKeys } from "@/hooks/queries/seller-leads/seller-leads-query-keys"
import { createSellerLead } from "@/services/seller-leads.service"
import type { CreateSellerLeadPayload } from "@/types/seller-leads"

export function useCreateSellerLeadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSellerLeadPayload) => createSellerLead(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sellerLeadsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      ])
    },
  })
}
