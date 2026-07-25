export const FOLLOW_UP_STATUSES = [
  "Due",
  "Completed",
  "Overdue",
  "Cancelled",
] as const;
export const LEAD_TYPES = ["seller", "buyer"] as const;
export const FOLLOW_UP_SORT_KEYS = [
  "note",
  "leadType",
  "leadName",
  "dueAt",
  "status",
  "updatedAt",
] as const;

export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];
export type FollowUpStatusFilter = FollowUpStatus | "DueToday";
export type LeadType = (typeof LEAD_TYPES)[number];
export type FollowUpSortKey = (typeof FOLLOW_UP_SORT_KEYS)[number];
export type FollowUpSort = FollowUpSortKey | `-${FollowUpSortKey}`;

export interface FollowUpAssigneeSummary {
  id: string;
  fullName: string;
  email: string;
  roleName: string;
}

export interface FollowUp {
  id: string;
  leadType: LeadType;
  sellerLeadId: string | null;
  buyerLeadId: string | null;
  assigneeUserId: string;
  assignee: FollowUpAssigneeSummary | null;
  dueAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  status: FollowUpStatus;
  note: string;
  outcomeNote: string | null;
  leadName: string | null;
  leadSecondary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFollowUpPayload {
  leadType: LeadType;
  sellerLeadId?: string;
  buyerLeadId?: string;
  assigneeUserId: string;
  dueAt: string;
  note: string;
}

export interface UpdateFollowUpPayload {
  dueAt?: string;
  note?: string;
  assigneeUserId?: string;
}

export interface CompleteFollowUpPayload {
  outcomeNote: string;
}

export interface FollowUpListFilters {
  status?: FollowUpStatusFilter;
  leadType?: LeadType;
  assigneeUserId?: string;
  dueFrom?: string;
  dueTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: FollowUpSort;
}

export interface FollowUpSummary {
  overdue: number;
  dueToday: number;
  upcoming: number;
  completed: number;
}

export interface FollowUpResponse {
  followUp: FollowUp;
}

export interface ActiveFollowUpResponse {
  followUp: FollowUp | null;
}

export interface FollowUpsResponse {
  followUps: FollowUp[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FollowUpSummaryResponse {
  summary: FollowUpSummary;
}
