import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  BuyerLeadResponse,
  BuyerLeadsResponse,
  BuyerLeadListFilters,
  CreateBuyerLeadPayload,
  LinkBuyerLeadVehiclePayload,
  UpdateBuyerLeadPayload,
} from "@/types/buyer-leads"

export function getBuyerLeads(filters: BuyerLeadListFilters = {}) {
  const params = new URLSearchParams()

  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize))
  if (filters.search) params.set("search", filters.search)
  if (filters.eligibleForSale) params.set("eligibleForSale", "true")
  if (filters.status && filters.status !== "all") params.set("status", filters.status)
  if (filters.sortBy) params.set("sortBy", filters.sortBy)
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder)

  const query = params.toString()
  const path = query ? `${API_ENDPOINTS.buyerLeads.root}?${query}` : API_ENDPOINTS.buyerLeads.root

  return apiRequest<BuyerLeadsResponse>(path)
}

export function getBuyerLead(id: string) {
  return apiRequest<BuyerLeadResponse>(API_ENDPOINTS.buyerLeads.byId(id))
}

export function createBuyerLead(payload: CreateBuyerLeadPayload) {
  return apiRequest<BuyerLeadResponse, CreateBuyerLeadPayload>(API_ENDPOINTS.buyerLeads.root, {
    method: "POST",
    body: payload,
  })
}

export function updateBuyerLead(id: string, payload: UpdateBuyerLeadPayload) {
  return apiRequest<BuyerLeadResponse, UpdateBuyerLeadPayload>(API_ENDPOINTS.buyerLeads.byId(id), {
    method: "PATCH",
    body: payload,
  })
}

export function linkBuyerLeadVehicle(id: string, payload: LinkBuyerLeadVehiclePayload) {
  return apiRequest<BuyerLeadResponse, LinkBuyerLeadVehiclePayload>(
    API_ENDPOINTS.buyerLeads.vehicleLinks(id),
    {
      method: "POST",
      body: payload,
    },
  )
}

export function unlinkBuyerLeadVehicle(id: string, vehicleId: string) {
  return apiRequest<BuyerLeadResponse>(API_ENDPOINTS.buyerLeads.vehicleLinkByVehicleId(id, vehicleId), {
    method: "DELETE",
  })
}
