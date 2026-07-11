import type { ActivityHistoryEvent } from "@/types/activity-history"
import type { PaginatedResponseMeta } from "@/types/api"

export type ActivityHistoryDateRange =
  | "all"
  | "today"
  | "last_7_days"
  | "last_30_days"
  | "this_month"

export interface ActivityHistoryListFilters {
  page?: number
  pageSize?: number
  search?: string
  entityType?: string
  actionType?: string
  actor?: string
  dateRange?: ActivityHistoryDateRange
}

export interface ActivityHistoryListResponse extends PaginatedResponseMeta {
  events: ActivityHistoryEvent[]
}

export interface ActivityHistoryFilterOption {
  value: string
  label: string
}

export interface ActivityHistorySummaryResponse {
  totalActivities: number
  todaysEvents: number
  vehicleUpdates: number
  salesEvents: number
  userActions: number
  actors: ActivityHistoryFilterOption[]
  actionTypes: ActivityHistoryFilterOption[]
}
