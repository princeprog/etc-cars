import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type { CreateSalePayload, CreateSaleResponse, SaleResponse, SalesResponse } from "@/types/sales"

export function getSales() {
  return apiRequest<SalesResponse>(API_ENDPOINTS.sales.root)
}

export function getSale(id: string) {
  return apiRequest<SaleResponse>(API_ENDPOINTS.sales.byId(id))
}

export function createSale(payload: CreateSalePayload) {
  return apiRequest<CreateSaleResponse, CreateSalePayload>(API_ENDPOINTS.sales.root, {
    method: "POST",
    body: payload,
  })
}
