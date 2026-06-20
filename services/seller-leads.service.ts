import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  ConvertSellerLeadPayload,
  SellerLeadResponse,
  SellerLeadsResponse,
  CreateSellerLeadPayload,
  UpdateSellerLeadPayload,
} from "@/types/seller-leads"
import type { VehicleResponse } from "@/types/vehicles"

export interface ConvertSellerLeadResponse {
  sellerLead: SellerLeadResponse["sellerLead"]
  vehicle: VehicleResponse["vehicle"]
}

export function getSellerLeads() {
  return apiRequest<SellerLeadsResponse>(API_ENDPOINTS.sellerLeads.root)
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
