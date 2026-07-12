"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { vehicleCatalogQueryKeys } from "@/hooks/queries/vehicle-catalog/vehicle-catalog-query-keys";
import {
  createVehicleCatalogBrand,
  createVehicleCatalogModel,
  createVehicleCatalogVariant,
  updateVehicleCatalogBrand,
  updateVehicleCatalogModel,
  updateVehicleCatalogVariant,
} from "@/services/vehicle-catalog.service";
import type {
  CreateVehicleCatalogBrandPayload,
  CreateVehicleCatalogModelPayload,
  CreateVehicleCatalogVariantPayload,
  UpdateVehicleCatalogItemPayload,
} from "@/types/vehicle-catalog";

export function useCreateVehicleCatalogBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehicleCatalogBrandPayload) =>
      createVehicleCatalogBrand(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleCatalogQueryKeys.all,
      });
    },
  });
}

export function useCreateVehicleCatalogModelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehicleCatalogModelPayload) =>
      createVehicleCatalogModel(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleCatalogQueryKeys.all,
      });
    },
  });
}

export function useCreateVehicleCatalogVariantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehicleCatalogVariantPayload) =>
      createVehicleCatalogVariant(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleCatalogQueryKeys.all,
      });
    },
  });
}

export function useUpdateVehicleCatalogBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateVehicleCatalogItemPayload;
    }) => updateVehicleCatalogBrand(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleCatalogQueryKeys.all,
      });
    },
  });
}

export function useUpdateVehicleCatalogModelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateVehicleCatalogItemPayload;
    }) => updateVehicleCatalogModel(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleCatalogQueryKeys.all,
      });
    },
  });
}

export function useUpdateVehicleCatalogVariantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateVehicleCatalogItemPayload;
    }) => updateVehicleCatalogVariant(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleCatalogQueryKeys.all,
      });
    },
  });
}
