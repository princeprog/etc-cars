export interface VehicleCatalogItem {
  id: string;
  name: string;
  archivedAt: string | null;
  usageCount: number;
}

export interface VehicleCatalogListResponse {
  items: VehicleCatalogItem[];
}

export interface VehicleCatalogItemResponse {
  item: VehicleCatalogItem;
}

export interface CreateVehicleCatalogBrandPayload {
  name: string;
}

export interface CreateVehicleCatalogModelPayload {
  brandId: string;
  name: string;
}

export interface CreateVehicleCatalogVariantPayload {
  modelId: string;
  name: string;
}

export interface VehicleCatalogListParams {
  includeArchived?: boolean;
  search?: string;
}

export interface VehicleCatalogModelsParams extends VehicleCatalogListParams {
  brandId: string;
}

export interface VehicleCatalogVariantsParams extends VehicleCatalogListParams {
  modelId: string;
}

export interface UpdateVehicleCatalogItemPayload {
  name?: string;
  archived?: boolean;
}
