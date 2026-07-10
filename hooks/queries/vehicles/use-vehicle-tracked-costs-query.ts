"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { getVehicleTrackedCosts } from "@/services/vehicles.service"
import type { VehicleTrackedCostListFilters } from "@/types/vehicles"
import { vehiclesQueryKeys } from "./vehicles-query-keys"

export function useVehicleTrackedCostsQuery(
  id: string,
  filters: VehicleTrackedCostListFilters = {},
) {
  return useQuery({
    queryKey: vehiclesQueryKeys.trackedCosts(id, filters),
    queryFn: () => getVehicleTrackedCosts(id, filters),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
    retry: false,
  })
}
