export const ACTIVITY_ENTITY_TYPES = ["seller_lead", "buyer_lead", "vehicle", "sale", "follow_up", "user"] as const

export type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number]

export interface ActivityHistoryEvent {
  id: string
  actorUserId: string | null
  actorDisplayName: string | null
  entityType: ActivityEntityType
  entityId: string
  actionType: string
  summary: string
  metadata: Record<string, unknown>
  timestamp: string
}

export interface ActivityHistoryResponse {
  events: ActivityHistoryEvent[]
}
