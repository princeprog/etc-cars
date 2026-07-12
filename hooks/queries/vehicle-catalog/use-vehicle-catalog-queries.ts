"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getVehicleCatalogBrands,
  getVehicleCatalogModels,
  getVehicleCatalogVariants,
} from "@/services/vehicle-catalog.service";
import { vehicleCatalogQueryKeys } from "./vehicle-catalog-query-keys";

export function useVehicleCatalogBrandsQuery() {
  return useQuery({
    queryKey: vehicleCatalogQueryKeys.brands(),
    queryFn: getVehicleCatalogBrands,
  });
}

export function useVehicleCatalogModelsQuery(brandId?: string) {
  return useQuery({
    queryKey: vehicleCatalogQueryKeys.models(brandId),
    queryFn: () => getVehicleCatalogModels(brandId ?? ""),
    enabled: Boolean(brandId),
  });
}

export function useVehicleCatalogVariantsQuery(modelId?: string) {
  return useQuery({
    queryKey: vehicleCatalogQueryKeys.variants(modelId),
    queryFn: () => getVehicleCatalogVariants(modelId ?? ""),
    enabled: Boolean(modelId),
  });
}
