"use client"

import { useQuery } from "@tanstack/react-query"

import { getVehicle } from "@/services/vehicles.service"
import { vehiclesQueryKeys } from "./vehicles-query-keys"

export function useVehicleQuery(id: string) {
  return useQuery({
    queryKey: vehiclesQueryKeys.detail(id),
    queryFn: () => getVehicle(id),
    enabled: Boolean(id),
    retry: false,
  })
}
