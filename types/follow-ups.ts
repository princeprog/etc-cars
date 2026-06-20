export const FOLLOW_UP_STATUSES = ["Due", "Completed", "Overdue"] as const
export const LEAD_TYPES = ["seller", "buyer"] as const

export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number]
export type LeadType = (typeof LEAD_TYPES)[number]

export interface FollowUp {
  id: string
  leadType: LeadType
  sellerLeadId: string | null
  buyerLeadId: string | null
  assigneeUserId: string
  dueAt: string
  completedAt: string | null
  status: FollowUpStatus
  note: string
  outcomeNote: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateFollowUpPayload {
  leadType: LeadType
  sellerLeadId?: string
  buyerLeadId?: string
  assigneeUserId: string
  dueAt: string
  note: string
}

export interface CompleteFollowUpPayload {
  outcomeNote: string
}

export interface FollowUpResponse {
  followUp: FollowUp
}

export interface FollowUpsResponse {
  followUps: FollowUp[]
}
