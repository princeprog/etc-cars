import type { PaginatedResponseMeta } from "@/types/api"

export const SELLER_LEAD_STATUSES = [
  "New Inquiry",
  "Contacted",
  "Inspection Scheduled",
  "Evaluated",
  "Negotiating",
  "Approved to Buy",
  "Purchased",
  "Rejected",
] as const

export type SellerLeadStatus = (typeof SELLER_LEAD_STATUSES)[number]
export const SELLER_LEAD_DECISIONS = ["Buy", "Negotiate", "Walk Away"] as const
export type SellerLeadDecision = (typeof SELLER_LEAD_DECISIONS)[number]
export const SELLER_LEAD_ESTIMATED_COST_CATEGORIES = [
  "reconditioning",
  "repair",
  "detailing",
  "transport",
  "documentation",
  "miscellaneous",
] as const
export type SellerLeadEstimatedCostCategory =
  (typeof SELLER_LEAD_ESTIMATED_COST_CATEGORIES)[number]
export const SELLER_LEAD_INSPECTION_RATINGS = [
  "excellent",
  "good",
  "fair",
  "poor",
] as const
export type SellerLeadInspectionRating =
  (typeof SELLER_LEAD_INSPECTION_RATINGS)[number]

export interface SellerLeadInspectionItem {
  rating: SellerLeadInspectionRating
  notes: string | null
}

export interface SellerLeadInspectionFindings {
  engine?: SellerLeadInspectionItem
  transmission?: SellerLeadInspectionItem
  suspension?: SellerLeadInspectionItem
  brakes?: SellerLeadInspectionItem
  tires?: SellerLeadInspectionItem
  exterior?: SellerLeadInspectionItem
  interior?: SellerLeadInspectionItem
  ac?: SellerLeadInspectionItem
  electrical?: SellerLeadInspectionItem
  papers?: SellerLeadInspectionItem
}

export interface SellerLeadEstimatedCost {
  id: string
  category: SellerLeadEstimatedCostCategory
  amount: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface SellerLead {
  id: string
  sellerName: string
  contactNumber: string
  email: string | null
  facebookName: string | null
  inquirySource: string | null
  vehicleBrand: string
  vehicleModel: string
  vehicleYear: number | null
  vehicleVariant: string | null
  askingPrice: string | null
  region: string | null
  notes: string | null
  inspectionCompletedAt: string | null
  inspectionNotes: string | null
  inspectionFindings: SellerLeadInspectionFindings | null
  targetBuyPrice: string | null
  expectedResalePrice: string | null
  targetProfitAmount: string | null
  decision: SellerLeadDecision | null
  decisionNote: string | null
  approvedToBuyAt: string | null
  approvedByUserId: string | null
  status: SellerLeadStatus
  assigneeUserId: string | null
  latestActivityAt: string | null
  closingNote: string | null
  estimatedCosts: SellerLeadEstimatedCost[]
  estimatedCostsTotal: string
  estimatedTotalInvestment: string | null
  estimatedGrossProfit: string | null
  estimatedProfitMargin: string | null
  recommendedAction: SellerLeadDecision | null
  createdAt: string
  updatedAt: string
}

export interface CreateSellerLeadPayload {
  sellerName: string
  contactNumber: string
  email?: string | null
  facebookName?: string | null
  inquirySource?: string | null
  vehicleBrand: string
  vehicleModel: string
  vehicleYear?: number | null
  vehicleVariant?: string | null
  askingPrice?: string | null
  region?: string | null
  notes?: string | null
  inspectionCompletedAt?: string | null
  inspectionNotes?: string | null
  inspectionFindings?: SellerLeadInspectionFindings | null
  targetBuyPrice?: string | null
  expectedResalePrice?: string | null
  targetProfitAmount?: string | null
  decision?: SellerLeadDecision | null
  decisionNote?: string | null
  status?: SellerLeadStatus
  assigneeUserId?: string | null
  closingNote?: string | null
}

export type UpdateSellerLeadPayload = Partial<CreateSellerLeadPayload>

export interface SellerLeadEstimatedCostPayload {
  category: SellerLeadEstimatedCostCategory
  amount: string
  note: string
}

export interface ConvertSellerLeadPayload {
  year?: number
  variant?: string | null
  mileage?: number | null
  transmission?: string | null
  fuelType?: string | null
  color?: string | null
  region?: string | null
  features?: string | null
  remarks?: string | null
  purchasePrice?: string | null
  targetSellingPrice?: string | null
  minimumAcceptablePrice?: string | null
  acquisitionSource?: string | null
  status?: import("./vehicles").VehicleStatus
  photos?: import("./vehicles").VehiclePhoto[]
}

export interface SellerLeadResponse {
  sellerLead: SellerLead
}

export interface SellerLeadListFilters {
  page?: number
  pageSize?: number
  search?: string
  status?: SellerLeadStatus | "all"
  sortBy?: "updatedAt" | "createdAt" | "sellerName" | "status"
  sortOrder?: "asc" | "desc"
}

export interface SellerLeadsResponse extends PaginatedResponseMeta {
  sellerLeads: SellerLead[]
}
