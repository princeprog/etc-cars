"use client"

import { useQuery } from "@tanstack/react-query"

import { getAllActivityHistory } from "@/services/activity-history.service"
import { activityHistoryQueryKeys } from "./activity-history-query-keys"

export function useAllActivityHistoryQuery(limit = 100) {
  return useQuery({
    queryKey: [...activityHistoryQueryKeys.all, "global", limit] as const,
    queryFn: () => getAllActivityHistory(limit),
    retry: false,
  })
}
