import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type { ActivityEntityType, ActivityHistoryResponse } from "@/types/activity-history"
import type { ActivityHistoryListResponse } from "@/types/activity-history-page"

export function getAllActivityHistory(limit = 100) {
  const path = `${API_ENDPOINTS.activityHistory.root}?limit=${limit}`
  return apiRequest<ActivityHistoryListResponse>(path)
}

export function getActivityHistory(entityType: ActivityEntityType, entityId: string, limit = 50) {
  return apiRequest<ActivityHistoryResponse>(API_ENDPOINTS.activityHistory.byEntity(entityType, entityId, limit))
}
