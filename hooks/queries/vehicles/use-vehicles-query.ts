"use client"

import { useQuery } from "@tanstack/react-query"

import { getVehicles } from "@/services/vehicles.service"
import { vehiclesQueryKeys } from "./vehicles-query-keys"

export function useVehiclesQuery() {
  return useQuery({
    queryKey: vehiclesQueryKeys.lists(),
    queryFn: getVehicles,
    retry: false,
  })
}
