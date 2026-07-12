import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  ConvertSellerLeadPayload,
  SellerLeadResponse,
  SellerLeadsResponse,
  SellerLeadListFilters,
  CreateSellerLeadPayload,
  UpdateSellerLeadPayload,
} from "@/types/seller-leads"
import type { VehicleResponse } from "@/types/vehicles"

export interface ConvertSellerLeadResponse {
  sellerLead: SellerLeadResponse["sellerLead"]
  vehicle: VehicleResponse["vehicle"]
}

export function getSellerLeads(filters: SellerLeadListFilters = {}) {
  const params = new URLSearchParams()

  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize))
  if (filters.search) params.set("search", filters.search)
  if (filters.status && filters.status !== "all") params.set("status", filters.status)
  if (filters.sortBy) params.set("sortBy", filters.sortBy)
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder)

  const query = params.toString()
  const path = query ? `${API_ENDPOINTS.sellerLeads.root}?${query}` : API_ENDPOINTS.sellerLeads.root

  return apiRequest<SellerLeadsResponse>(path)
}

export function getSellerLead(id: string) {
  return apiRequest<SellerLeadResponse>(API_ENDPOINTS.sellerLeads.byId(id))
}

export function createSellerLead(payload: CreateSellerLeadPayload) {
  return apiRequest<SellerLeadResponse, CreateSellerLeadPayload>(API_ENDPOINTS.sellerLeads.root, {
    method: "POST",
    body: payload,
  })
}

export function updateSellerLead(id: string, payload: UpdateSellerLeadPayload) {
  return apiRequest<SellerLeadResponse, UpdateSellerLeadPayload>(API_ENDPOINTS.sellerLeads.byId(id), {
    method: "PATCH",
    body: payload,
  })
}

export function convertSellerLead(id: string, payload: ConvertSellerLeadPayload) {
  return apiRequest<ConvertSellerLeadResponse, ConvertSellerLeadPayload>(
    API_ENDPOINTS.sellerLeads.convert(id),
    {
      method: "POST",
      body: payload,
    },
  )
}
