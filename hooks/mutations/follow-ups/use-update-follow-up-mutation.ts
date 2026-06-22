"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { followUpsQueryKeys } from "@/hooks/queries/follow-ups/follow-ups-query-keys"
import { updateFollowUp } from "@/services/follow-ups.service"
import type { UpdateFollowUpPayload } from "@/types/follow-ups"

export function useUpdateFollowUpMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFollowUpPayload }) =>
      updateFollowUp(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      ])
    },
  })
}
