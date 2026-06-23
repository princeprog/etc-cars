import type { ActivityEntityType } from "@/types/activity-history"

export const activityHistoryQueryKeys = {
  all: ["activity-history"] as const,
  detail: (entityType: ActivityEntityType, entityId: string) =>
    [...activityHistoryQueryKeys.all, entityType, entityId] as const,
}
