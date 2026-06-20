"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { followUpsQueryKeys } from "@/hooks/queries/follow-ups/follow-ups-query-keys"
import { completeFollowUp } from "@/services/follow-ups.service"
import type { CompleteFollowUpPayload } from "@/types/follow-ups"

export function useCompleteFollowUpMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CompleteFollowUpPayload }) =>
      completeFollowUp(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      ])
    },
  })
}
