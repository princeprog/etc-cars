"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { buyerLeadsQueryKeys } from "@/hooks/queries/buyer-leads/buyer-leads-query-keys"
import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { followUpsQueryKeys } from "@/hooks/queries/follow-ups/follow-ups-query-keys"
import { sellerLeadsQueryKeys } from "@/hooks/queries/seller-leads/seller-leads-query-keys"
import { completeFollowUp } from "@/services/follow-ups.service"
import type { CompleteFollowUpPayload } from "@/types/follow-ups"

export function useCompleteFollowUpMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: CompleteFollowUpPayload
    }) => completeFollowUp(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: buyerLeadsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: sellerLeadsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      ])
    },
  })
}
