import { API_ENDPOINTS } from "@/constants/api-config";
import { apiRequest } from "@/services/api-service";
import type {
  CreateVehicleCatalogBrandPayload,
  CreateVehicleCatalogModelPayload,
  CreateVehicleCatalogVariantPayload,
  UpdateVehicleCatalogItemPayload,
  VehicleCatalogItemResponse,
  VehicleCatalogListResponse,
  VehicleCatalogListParams,
  VehicleCatalogModelsParams,
  VehicleCatalogVariantsParams,
} from "@/types/vehicle-catalog";

export function getVehicleCatalogBrands(params: VehicleCatalogListParams = {}) {
  const queryString = buildCatalogQueryString(params);

  return apiRequest<VehicleCatalogListResponse>(
    queryString
      ? `${API_ENDPOINTS.vehicleCatalog.brands}?${queryString}`
      : API_ENDPOINTS.vehicleCatalog.brands,
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

export function updateVehicleCatalogBrand(
  id: string,
  payload: UpdateVehicleCatalogItemPayload,
) {
  return apiRequest<
    VehicleCatalogItemResponse,
    UpdateVehicleCatalogItemPayload
  >(API_ENDPOINTS.vehicleCatalog.brandById(id), {
    method: "PATCH",
    body: payload,
  });
}

export function getVehicleCatalogModels(params: VehicleCatalogModelsParams) {
  const queryString = buildCatalogQueryString(params);

  return apiRequest<VehicleCatalogListResponse>(
    `${API_ENDPOINTS.vehicleCatalog.models}?${queryString}`,
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

export function updateVehicleCatalogModel(
  id: string,
  payload: UpdateVehicleCatalogItemPayload,
) {
  return apiRequest<
    VehicleCatalogItemResponse,
    UpdateVehicleCatalogItemPayload
  >(API_ENDPOINTS.vehicleCatalog.modelById(id), {
    method: "PATCH",
    body: payload,
  });
}

export function getVehicleCatalogVariants(
  params: VehicleCatalogVariantsParams,
) {
  const queryString = buildCatalogQueryString(params);

  return apiRequest<VehicleCatalogListResponse>(
    `${API_ENDPOINTS.vehicleCatalog.variants}?${queryString}`,
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

export function updateVehicleCatalogVariant(
  id: string,
  payload: UpdateVehicleCatalogItemPayload,
) {
  return apiRequest<
    VehicleCatalogItemResponse,
    UpdateVehicleCatalogItemPayload
  >(API_ENDPOINTS.vehicleCatalog.variantById(id), {
    method: "PATCH",
    body: payload,
  });
}

function buildCatalogQueryString(
  params:
    | VehicleCatalogListParams
    | VehicleCatalogModelsParams
    | VehicleCatalogVariantsParams,
) {
  const searchParams = new URLSearchParams();

  if ("brandId" in params && params.brandId) {
    searchParams.set("brandId", params.brandId);
  }

  if ("modelId" in params && params.modelId) {
    searchParams.set("modelId", params.modelId);
  }

  if (params.includeArchived) {
    searchParams.set("includeArchived", "true");
  }

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  return searchParams.toString();
}
