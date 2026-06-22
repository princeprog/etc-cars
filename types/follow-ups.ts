export const FOLLOW_UP_STATUSES = ["Due", "Completed", "Overdue"] as const
export const LEAD_TYPES = ["seller", "buyer"] as const
export const FOLLOW_UP_SORTS = ["dueAt", "-dueAt", "updatedAt", "-updatedAt"] as const

export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number]
export type LeadType = (typeof LEAD_TYPES)[number]
export type FollowUpSort = (typeof FOLLOW_UP_SORTS)[number]

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
  leadName: string | null
  leadSecondary: string | null
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

export interface UpdateFollowUpPayload {
  dueAt?: string
  note?: string
  assigneeUserId?: string
}

export interface CompleteFollowUpPayload {
  outcomeNote: string
}

export interface FollowUpListFilters {
  status?: FollowUpStatus
  leadType?: LeadType
  assigneeUserId?: string
  dueFrom?: string
  dueTo?: string
  search?: string
  page?: number
  pageSize?: number
  sort?: FollowUpSort
}

export interface FollowUpSummary {
  overdue: number
  dueToday: number
  upcoming: number
  completed: number
}

export interface FollowUpResponse {
  followUp: FollowUp
}

export interface FollowUpsResponse {
  followUps: FollowUp[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface FollowUpSummaryResponse {
  summary: FollowUpSummary
}
