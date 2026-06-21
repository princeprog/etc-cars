"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { buyerLeadsQueryKeys } from "@/hooks/queries/buyer-leads/buyer-leads-query-keys"
import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { updateBuyerLead } from "@/services/buyer-leads.service"
import type { UpdateBuyerLeadPayload } from "@/types/buyer-leads"

export function useUpdateBuyerLeadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBuyerLeadPayload }) =>
      updateBuyerLead(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: buyerLeadsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      ])
    },
  })
}
