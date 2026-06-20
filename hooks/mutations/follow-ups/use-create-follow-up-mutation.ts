"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { followUpsQueryKeys } from "@/hooks/queries/follow-ups/follow-ups-query-keys"
import { createFollowUp } from "@/services/follow-ups.service"
import type { CreateFollowUpPayload } from "@/types/follow-ups"

export function useCreateFollowUpMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFollowUpPayload) => createFollowUp(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      ])
    },
  })
}
