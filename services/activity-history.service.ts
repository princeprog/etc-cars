import { API_ENDPOINTS, buildApiUrl } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type { ActivityEntityType, ActivityHistoryResponse } from "@/types/activity-history"
import type {
  ActivityHistoryListFilters,
  ActivityHistoryListResponse,
  ActivityHistorySummaryResponse,
} from "@/types/activity-history-page"

export function getAllActivityHistory(filters?: ActivityHistoryListFilters) {
  const queryString = buildActivityHistoryQuery(filters)
  const endpoint = queryString
    ? `${API_ENDPOINTS.activityHistory.root}?${queryString}`
    : API_ENDPOINTS.activityHistory.root

  return apiRequest<ActivityHistoryListResponse>(endpoint)
}

export function getActivityHistorySummary(filters?: ActivityHistoryListFilters) {
  const queryString = buildActivityHistoryQuery({
    ...filters,
    page: undefined,
    pageSize: undefined,
  })
  const endpoint = queryString
    ? `${API_ENDPOINTS.activityHistory.summary}?${queryString}`
    : API_ENDPOINTS.activityHistory.summary

  return apiRequest<ActivityHistorySummaryResponse>(endpoint)
}

export async function exportActivityHistory(filters?: ActivityHistoryListFilters) {
  const queryString = buildActivityHistoryQuery({
    ...filters,
    page: undefined,
    pageSize: undefined,
  })
  const endpoint = queryString
    ? `${API_ENDPOINTS.activityHistory.export}?${queryString}`
    : API_ENDPOINTS.activityHistory.export

  const response = await fetch(buildApiUrl(endpoint), {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Unable to export activity logs")
  }

  const disposition = response.headers.get("content-disposition")
  const filenameMatch = disposition?.match(/filename="([^"]+)"/i)

  return {
    filename: filenameMatch?.[1] ?? "etc-activity-history-logs.csv",
    csv: await response.text(),
  }
}

export function getActivityHistory(entityType: ActivityEntityType, entityId: string, limit = 50) {
  return apiRequest<ActivityHistoryResponse>(API_ENDPOINTS.activityHistory.byEntity(entityType, entityId, limit))
}

function buildActivityHistoryQuery(filters?: ActivityHistoryListFilters) {
  const searchParams = new URLSearchParams()

  if (filters?.page) {
    searchParams.set("page", String(filters.page))
  }

  if (filters?.pageSize) {
    searchParams.set("pageSize", String(filters.pageSize))
  }

  appendOptionalParam(searchParams, "search", filters?.search)
  appendOptionalParam(searchParams, "entityType", filters?.entityType)
  appendOptionalParam(searchParams, "actionType", filters?.actionType)
  appendOptionalParam(searchParams, "actor", filters?.actor)
  appendOptionalParam(searchParams, "dateRange", filters?.dateRange)

  return searchParams.toString()
}

function appendOptionalParam(searchParams: URLSearchParams, key: string, value?: string) {
  if (value && value !== "all") {
    searchParams.set(key, value)
  }
}
