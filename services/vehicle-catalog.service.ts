import { API_ENDPOINTS } from "@/constants/api-config";
import { apiRequest } from "@/services/api-service";
import type {
  CreateVehicleCatalogBrandPayload,
  CreateVehicleCatalogModelPayload,
  CreateVehicleCatalogVariantPayload,
  VehicleCatalogItemResponse,
  VehicleCatalogListResponse,
} from "@/types/vehicle-catalog";

export function getVehicleCatalogBrands() {
  return apiRequest<VehicleCatalogListResponse>(
    API_ENDPOINTS.vehicleCatalog.brands,
  );
}

export function createVehicleCatalogBrand(
  payload: CreateVehicleCatalogBrandPayload,
) {
  return apiRequest<
    VehicleCatalogItemResponse,
    CreateVehicleCatalogBrandPayload
  >(API_ENDPOINTS.vehicleCatalog.brands, {
    method: "POST",
    body: payload,
  });
}

export function getVehicleCatalogModels(brandId: string) {
  const searchParams = new URLSearchParams({ brandId });

  return apiRequest<VehicleCatalogListResponse>(
    `${API_ENDPOINTS.vehicleCatalog.models}?${searchParams.toString()}`,
  );
}

export function createVehicleCatalogModel(
  payload: CreateVehicleCatalogModelPayload,
) {
  return apiRequest<
    VehicleCatalogItemResponse,
    CreateVehicleCatalogModelPayload
  >(API_ENDPOINTS.vehicleCatalog.models, {
    method: "POST",
    body: payload,
  });
}

export function getVehicleCatalogVariants(modelId: string) {
  const searchParams = new URLSearchParams({ modelId });

  return apiRequest<VehicleCatalogListResponse>(
    `${API_ENDPOINTS.vehicleCatalog.variants}?${searchParams.toString()}`,
  );
}

export function createVehicleCatalogVariant(
  payload: CreateVehicleCatalogVariantPayload,
) {
  return apiRequest<
    VehicleCatalogItemResponse,
    CreateVehicleCatalogVariantPayload
  >(API_ENDPOINTS.vehicleCatalog.variants, {
    method: "POST",
    body: payload,
  });
}
