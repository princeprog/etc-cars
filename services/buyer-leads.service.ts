import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  BuyerLeadResponse,
  BuyerLeadsResponse,
  CreateBuyerLeadPayload,
  LinkBuyerLeadVehiclePayload,
  UpdateBuyerLeadPayload,
} from "@/types/buyer-leads"

export function getBuyerLeads() {
  return apiRequest<BuyerLeadsResponse>(API_ENDPOINTS.buyerLeads.root)
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
