"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { vehiclesQueryKeys } from "@/hooks/queries/vehicles/vehicles-query-keys"
import { createVehicle } from "@/services/vehicles.service"
import type { CreateVehiclePayload } from "@/types/vehicles"

export function useCreateVehicleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => createVehicle(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: vehiclesQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      ])
    },
  })
}
