"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getVehicleCatalogBrands,
  getVehicleCatalogModels,
  getVehicleCatalogVariants,
} from "@/services/vehicle-catalog.service";
import type { VehicleCatalogListParams } from "@/types/vehicle-catalog";
import { vehicleCatalogQueryKeys } from "./vehicle-catalog-query-keys";

export function useVehicleCatalogBrandsQuery(
  filters: VehicleCatalogListParams = {},
) {
  return useQuery({
    queryKey: vehicleCatalogQueryKeys.brands(filters),
    queryFn: () => getVehicleCatalogBrands(filters),
  });
}

export function useVehicleCatalogModelsQuery(
  brandId?: string,
  filters: VehicleCatalogListParams = {},
) {
  return useQuery({
    queryKey: vehicleCatalogQueryKeys.models(brandId, filters),
    queryFn: () =>
      getVehicleCatalogModels({
        ...filters,
        brandId: brandId ?? "",
      }),
    enabled: Boolean(brandId),
  });
}

export function useVehicleCatalogVariantsQuery(
  modelId?: string,
  filters: VehicleCatalogListParams = {},
) {
  return useQuery({
    queryKey: vehicleCatalogQueryKeys.variants(modelId, filters),
    queryFn: () =>
      getVehicleCatalogVariants({
        ...filters,
        modelId: modelId ?? "",
      }),
    enabled: Boolean(modelId),
  });
}
