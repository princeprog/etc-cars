"use client"

import { useQuery } from "@tanstack/react-query"

import { getVehicleModelOptions } from "@/services/vehicles.service"
import { vehiclesQueryKeys } from "./vehicles-query-keys"

export function useVehicleModelOptionsQuery() {
  return useQuery({
    queryKey: vehiclesQueryKeys.modelOptions(),
    queryFn: getVehicleModelOptions,
    retry: false,
  })
}
