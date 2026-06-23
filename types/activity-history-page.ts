import type { ActivityHistoryEvent } from "@/types/activity-history"

export interface ActivityHistoryListResponse {
  events: ActivityHistoryEvent[]
}
