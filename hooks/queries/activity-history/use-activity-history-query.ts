"use client"

import { useQuery } from "@tanstack/react-query"

import { getActivityHistory } from "@/services/activity-history.service"
import type { ActivityEntityType } from "@/types/activity-history"
import { activityHistoryQueryKeys } from "./activity-history-query-keys"

export function useActivityHistoryQuery(entityType: ActivityEntityType, entityId: string, limit = 50) {
  return useQuery({
    queryKey: activityHistoryQueryKeys.detail(entityType, entityId),
    queryFn: () => getActivityHistory(entityType, entityId, limit),
    enabled: Boolean(entityId),
    retry: false,
  })
}
