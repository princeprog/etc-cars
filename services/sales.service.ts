import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  CreateSalePayload,
  CreateSaleResponse,
  DeleteSaleDraftResponse,
  SaleResponse,
  SaleDraftResponse,
  SalesListFilters,
  SalesSummaryResponse,
  SalesResponse,
  SaveSaleDraftPayload,
  UpdateSaleDraftPayload,
} from "@/types/sales"

export function getSales(filters: SalesListFilters = {}) {
  const params = new URLSearchParams()

  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize))
  if (filters.search) params.set("search", filters.search)
  if (filters.status && filters.status !== "all") params.set("status", filters.status)
  if (filters.agentName) params.set("agentName", filters.agentName)
  if (filters.dateRange && filters.dateRange !== "all") params.set("dateRange", filters.dateRange)
  if (filters.sortBy) params.set("sortBy", filters.sortBy)
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder)

  const query = params.toString()
  const path = query ? `${API_ENDPOINTS.sales.root}?${query}` : API_ENDPOINTS.sales.root

  return apiRequest<SalesResponse>(path)
}

export function getSale(id: string) {
  return apiRequest<SaleResponse>(API_ENDPOINTS.sales.byId(id))
}

export function getSalesSummary(filters: SalesListFilters = {}) {
  const params = new URLSearchParams()

  if (filters.search) params.set("search", filters.search)
  if (filters.status && filters.status !== "all") params.set("status", filters.status)
  if (filters.agentName) params.set("agentName", filters.agentName)
  if (filters.dateRange && filters.dateRange !== "all") params.set("dateRange", filters.dateRange)

  const query = params.toString()
  const path = query ? `${API_ENDPOINTS.sales.summary}?${query}` : API_ENDPOINTS.sales.summary

  return apiRequest<SalesSummaryResponse>(path)
}

export function createSale(payload: CreateSalePayload) {
  return apiRequest<CreateSaleResponse, CreateSalePayload>(API_ENDPOINTS.sales.root, {
    method: "POST",
    body: payload,
  })
}

export function saveSaleDraft(payload: SaveSaleDraftPayload) {
  return apiRequest<SaleDraftResponse, SaveSaleDraftPayload>(API_ENDPOINTS.sales.drafts, {
    method: "POST",
    body: payload,
  })
}

export function updateSaleDraft(id: string, payload: UpdateSaleDraftPayload) {
  return apiRequest<SaleDraftResponse, UpdateSaleDraftPayload>(API_ENDPOINTS.sales.draftById(id), {
    method: "PATCH",
    body: payload,
  })
}

export function deleteSaleDraft(id: string) {
  return apiRequest<DeleteSaleDraftResponse>(API_ENDPOINTS.sales.draftById(id), {
    method: "DELETE",
  })
}

export function finalizeSaleDraft(id: string) {
  return apiRequest<CreateSaleResponse>(API_ENDPOINTS.sales.finalizeDraft(id), {
    method: "POST",
  })
}
