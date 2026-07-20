"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys"
import { notificationsQueryKeys } from "@/hooks/queries/notifications/notifications-query-keys"
import { vehiclesQueryKeys } from "@/hooks/queries/vehicles/vehicles-query-keys"
import { updateVehicle } from "@/services/vehicles.service"
import type { UpdateVehiclePayload } from "@/types/vehicles"

export function useUpdateVehicleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVehiclePayload }) =>
      updateVehicle(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: vehiclesQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: vehiclesQueryKeys.detail(variables.id) }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
        queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all }),
      ])
    },
  })
}
