import type { PaginatedResponseMeta } from "@/types/api"
import type { LeadPipelineState } from "@/types/lead-pipeline"

export const BUYER_LEAD_STATUSES = [
  "New Inquiry",
  "Contacted",
  "Interested",
  "Negotiating",
  "Reserved",
  "Won",
  "Lost",
] as const

export type BuyerLeadStatus = (typeof BUYER_LEAD_STATUSES)[number]

export interface BuyerLeadVehicleSummary {
  id: string
  stockNumber: string
  brand: string
  model: string
  year: number
  status: string
}

export interface BuyerLead {
  id: string
  buyerName: string
  contactNumber: string
  email: string | null
  facebookName: string | null
  inquirySource: string | null
  desiredBudget: string | null
  notes: string | null
  status: BuyerLeadStatus
  assigneeUserId: string | null
  latestActivityAt: string | null
  closingNote: string | null
  createdAt: string
  updatedAt: string
  vehicles: BuyerLeadVehicleSummary[]
  pipeline: LeadPipelineState | null
}

export interface CreateBuyerLeadPayload {
  buyerName: string
  contactNumber: string
  email?: string | null
  facebookName?: string | null
  inquirySource?: string | null
  desiredBudget?: string | null
  notes?: string | null
  status?: BuyerLeadStatus
  assigneeUserId?: string | null
  closingNote?: string | null
}

export type UpdateBuyerLeadPayload = Partial<CreateBuyerLeadPayload>

export interface BuyerLeadResponse {
  buyerLead: BuyerLead
}

export interface BuyerLeadListFilters {
  page?: number
  pageSize?: number
  search?: string
  eligibleForSale?: boolean
  pipelineState?: "blocked" | "stale" | "ready" | "ready_to_progress"
  status?: BuyerLeadStatus | "all"
  sortBy?: "updatedAt" | "createdAt" | "buyerName" | "status" | "desiredBudget"
  sortOrder?: "asc" | "desc"
}

export interface BuyerLeadsResponse extends PaginatedResponseMeta {
  buyerLeads: BuyerLead[]
}
