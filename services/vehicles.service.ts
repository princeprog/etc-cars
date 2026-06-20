import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleResponse,
  VehiclesResponse,
} from "@/types/vehicles"

export function getVehicles() {
  return apiRequest<VehiclesResponse>(API_ENDPOINTS.vehicles.root)
}

export function getVehicle(id: string) {
  return apiRequest<VehicleResponse>(API_ENDPOINTS.vehicles.byId(id))
}

export function createVehicle(payload: CreateVehiclePayload) {
  return apiRequest<VehicleResponse, CreateVehiclePayload>(API_ENDPOINTS.vehicles.root, {
    method: "POST",
    body: payload,
  })
}

export function updateVehicle(id: string, payload: UpdateVehiclePayload) {
  return apiRequest<VehicleResponse, UpdateVehiclePayload>(API_ENDPOINTS.vehicles.byId(id), {
    method: "PATCH",
    body: payload,
  })
}
