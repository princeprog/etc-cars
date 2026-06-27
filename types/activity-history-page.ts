import type { ActivityHistoryEvent } from "@/types/activity-history"
import type { PaginatedResponseMeta } from "@/types/api"

export interface ActivityHistoryListFilters {
  page?: number
  pageSize?: number
}

export interface ActivityHistoryListResponse extends PaginatedResponseMeta {
  events: ActivityHistoryEvent[]
}
