import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type { ActivityEntityType, ActivityHistoryResponse } from "@/types/activity-history"
import type { ActivityHistoryListFilters, ActivityHistoryListResponse } from "@/types/activity-history-page"

export function getAllActivityHistory(filters?: ActivityHistoryListFilters) {
  const searchParams = new URLSearchParams()

  if (filters?.page) {
    searchParams.set("page", String(filters.page))
  }

  if (filters?.pageSize) {
    searchParams.set("pageSize", String(filters.pageSize))
  }

  const queryString = searchParams.toString()
  const endpoint = queryString
    ? `${API_ENDPOINTS.activityHistory.root}?${queryString}`
    : API_ENDPOINTS.activityHistory.root

  return apiRequest<ActivityHistoryListResponse>(endpoint)
}

export function getActivityHistory(entityType: ActivityEntityType, entityId: string, limit = 50) {
  return apiRequest<ActivityHistoryResponse>(API_ENDPOINTS.activityHistory.byEntity(entityType, entityId, limit))
}
