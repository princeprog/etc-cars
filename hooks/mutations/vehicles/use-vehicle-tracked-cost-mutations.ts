"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { salesQueryKeys } from "@/hooks/queries/sales/sales-query-keys";
import { vehiclesQueryKeys } from "@/hooks/queries/vehicles/vehicles-query-keys";
import {
  createVehicleTrackedCost,
  deleteVehicleTrackedCost,
  updateVehicleTrackedCost,
} from "@/services/vehicles.service";
import type { VehicleTrackedCostPayload } from "@/types/vehicles";

function useInvalidateProfitabilityQueries() {
  const queryClient = useQueryClient();

  return async (vehicleId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKeys.all }),
      queryClient.invalidateQueries({
        queryKey: vehiclesQueryKeys.detail(vehicleId),
      }),
      queryClient.invalidateQueries({ queryKey: salesQueryKeys.all }),
    ]);
  };
}

export function useCreateVehicleTrackedCostMutation() {
  const invalidate = useInvalidateProfitabilityQueries();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: VehicleTrackedCostPayload;
    }) => createVehicleTrackedCost(id, payload),
    onSuccess: async (_data, variables) => invalidate(variables.id),
  });
}

export function useDeleteVehicleTrackedCostMutation() {
  const invalidate = useInvalidateProfitabilityQueries();

  return useMutation({
    mutationFn: ({ id, costId }: { id: string; costId: string }) =>
      deleteVehicleTrackedCost(id, costId),
    onSuccess: async (_data, variables) => invalidate(variables.id),
  });
}

export function useUpdateVehicleTrackedCostMutation() {
  const invalidate = useInvalidateProfitabilityQueries();

  return useMutation({
    mutationFn: ({
      id,
      costId,
      payload,
    }: {
      id: string;
      costId: string;
      payload: VehicleTrackedCostPayload;
    }) => updateVehicleTrackedCost(id, costId, payload),
    onSuccess: async (_data, variables) => invalidate(variables.id),
  });
}
