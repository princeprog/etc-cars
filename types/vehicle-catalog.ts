export interface VehicleCatalogItem {
  id: string;
  name: string;
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
