"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { vehicleCatalogQueryKeys } from "@/hooks/queries/vehicle-catalog/vehicle-catalog-query-keys";
import {
  createVehicleCatalogBrand,
  createVehicleCatalogModel,
  createVehicleCatalogVariant,
} from "@/services/vehicle-catalog.service";
import type {
  CreateVehicleCatalogBrandPayload,
  CreateVehicleCatalogModelPayload,
  CreateVehicleCatalogVariantPayload,
} from "@/types/vehicle-catalog";

export function useCreateVehicleCatalogBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehicleCatalogBrandPayload) =>
      createVehicleCatalogBrand(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleCatalogQueryKeys.brands(),
      });
    },
  });
}

export function useCreateVehicleCatalogModelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehicleCatalogModelPayload) =>
      createVehicleCatalogModel(payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: vehicleCatalogQueryKeys.models(variables.brandId),
      });
    },
  });
}

export function useCreateVehicleCatalogVariantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehicleCatalogVariantPayload) =>
      createVehicleCatalogVariant(payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: vehicleCatalogQueryKeys.variants(variables.modelId),
      });
    },
  });
}
