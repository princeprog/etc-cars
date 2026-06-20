"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { buyerLeadsQueryKeys } from "@/hooks/queries/buyer-leads/buyer-leads-query-keys"
import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { createBuyerLead } from "@/services/buyer-leads.service"
import type { CreateBuyerLeadPayload } from "@/types/buyer-leads"

export function useCreateBuyerLeadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateBuyerLeadPayload) => createBuyerLead(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: buyerLeadsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      ])
    },
  })
}
