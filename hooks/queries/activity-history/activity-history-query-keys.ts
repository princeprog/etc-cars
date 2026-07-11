import type { ActivityEntityType } from "@/types/activity-history"
import type { ActivityHistoryListFilters } from "@/types/activity-history-page"

export const activityHistoryQueryKeys = {
  all: ["activity-history"] as const,
  list: (filters?: ActivityHistoryListFilters) =>
    [...activityHistoryQueryKeys.all, "global", filters] as const,
  summary: (filters?: ActivityHistoryListFilters) =>
    [...activityHistoryQueryKeys.all, "summary", filters] as const,
  detail: (entityType: ActivityEntityType, entityId: string) =>
    [...activityHistoryQueryKeys.all, entityType, entityId] as const,
}
