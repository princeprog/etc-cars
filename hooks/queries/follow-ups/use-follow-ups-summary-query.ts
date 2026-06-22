"use client"

import { useQuery } from "@tanstack/react-query"

import { getFollowUpsSummary } from "@/services/follow-ups.service"
import { followUpsQueryKeys } from "./follow-ups-query-keys"

export function useFollowUpsSummaryQuery(assigneeUserId?: string) {
  return useQuery({
    queryKey: followUpsQueryKeys.summary(assigneeUserId),
    queryFn: () => getFollowUpsSummary(assigneeUserId),
    retry: false,
  })
}
