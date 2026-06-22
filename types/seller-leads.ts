import type { PaginatedResponseMeta } from "@/types/api"

export const SELLER_LEAD_STATUSES = [
  "New Inquiry",
  "Contacted",
  "Inspection Scheduled",
  "Negotiating",
  "Purchased",
  "Rejected",
] as const

export type SellerLeadStatus = (typeof SELLER_LEAD_STATUSES)[number]

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
  status: SellerLeadStatus
  assigneeUserId: string | null
  latestActivityAt: string | null
  closingNote: string | null
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
  status?: SellerLeadStatus
  assigneeUserId?: string | null
  closingNote?: string | null
}

export type UpdateSellerLeadPayload = Partial<CreateSellerLeadPayload>

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
