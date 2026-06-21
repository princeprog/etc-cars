"use client"

import { useQuery } from "@tanstack/react-query"

import { getVehicles, type GetVehiclesFilters } from "@/services/vehicles.service"
import { vehiclesQueryKeys } from "./vehicles-query-keys"

export function useVehiclesQuery(filters?: GetVehiclesFilters) {
  const hasFilters = Boolean(filters && Object.values(filters).some(Boolean))

  return useQuery({
    queryKey: hasFilters ? vehiclesQueryKeys.filteredList(filters ?? {}) : vehiclesQueryKeys.lists(),
    queryFn: () => getVehicles(filters),
    retry: false,
  })
}
