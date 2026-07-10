import { API_ENDPOINTS } from "@/constants/api-config";
import { apiRequest } from "@/services/api-service";
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleResponse,
  VehicleTrackedCostListFilters,
  VehicleTrackedCostPayload,
  VehicleTrackedCostsResponse,
  VehiclesResponse,
} from "@/types/vehicles";

export type GetVehiclesFilters = {
  status?: string;
};

export function getVehicles(filters?: GetVehiclesFilters) {
  const searchParams = new URLSearchParams();

  if (filters?.status) {
    searchParams.set("status", filters.status);
  }

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `${API_ENDPOINTS.vehicles.root}?${queryString}`
    : API_ENDPOINTS.vehicles.root;

  return apiRequest<VehiclesResponse>(endpoint);
}

export function getVehicle(id: string) {
  return apiRequest<VehicleResponse>(API_ENDPOINTS.vehicles.byId(id));
}

export function getVehicleTrackedCosts(
  id: string,
  filters: VehicleTrackedCostListFilters = {},
) {
  const searchParams = new URLSearchParams();

  if (filters.page) {
    searchParams.set("page", String(filters.page));
  }

  if (filters.pageSize) {
    searchParams.set("pageSize", String(filters.pageSize));
  }

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `${API_ENDPOINTS.vehicles.trackedCosts(id)}?${queryString}`
    : API_ENDPOINTS.vehicles.trackedCosts(id);

  return apiRequest<VehicleTrackedCostsResponse>(endpoint);
}

export function createVehicle(payload: CreateVehiclePayload) {
  return apiRequest<VehicleResponse, CreateVehiclePayload>(
    API_ENDPOINTS.vehicles.root,
    {
      method: "POST",
      body: payload,
    },
  );
}

export function updateVehicle(id: string, payload: UpdateVehiclePayload) {
  return apiRequest<VehicleResponse, UpdateVehiclePayload>(
    API_ENDPOINTS.vehicles.byId(id),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export function createVehicleTrackedCost(
  id: string,
  payload: VehicleTrackedCostPayload,
) {
  return apiRequest<VehicleResponse, VehicleTrackedCostPayload>(
    API_ENDPOINTS.vehicles.trackedCosts(id),
    { method: "POST", body: payload },
  );
}

export function updateVehicleTrackedCost(
  id: string,
  costId: string,
  payload: VehicleTrackedCostPayload,
) {
  return apiRequest<VehicleResponse, VehicleTrackedCostPayload>(
    API_ENDPOINTS.vehicles.trackedCostById(id, costId),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export function deleteVehicleTrackedCost(id: string, costId: string) {
  return apiRequest<VehicleResponse>(
    API_ENDPOINTS.vehicles.trackedCostById(id, costId),
    {
      method: "DELETE",
    },
  );
}
