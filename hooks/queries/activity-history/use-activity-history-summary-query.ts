"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { getActivityHistorySummary } from "@/services/activity-history.service"
import type { ActivityHistoryListFilters } from "@/types/activity-history-page"
import { activityHistoryQueryKeys } from "./activity-history-query-keys"

export function useActivityHistorySummaryQuery(filters?: ActivityHistoryListFilters) {
  return useQuery({
    queryKey: activityHistoryQueryKeys.summary(filters),
    queryFn: () => getActivityHistorySummary(filters),
    placeholderData: keepPreviousData,
    retry: false,
  })
}
