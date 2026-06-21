import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleResponse,
  VehiclesResponse,
} from "@/types/vehicles"

export type GetVehiclesFilters = {
  status?: string
}

export function getVehicles(filters?: GetVehiclesFilters) {
  const searchParams = new URLSearchParams()

  if (filters?.status) {
    searchParams.set("status", filters.status)
  }

  const queryString = searchParams.toString()
  const endpoint = queryString
    ? `${API_ENDPOINTS.vehicles.root}?${queryString}`
    : API_ENDPOINTS.vehicles.root

  return apiRequest<VehiclesResponse>(endpoint)
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
