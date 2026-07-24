"use client"

import { useQuery } from "@tanstack/react-query"

import { getPsgcRegions } from "@/services/psgc.service"

export function usePsgcRegionsQuery() {
  return useQuery({
    queryKey: ["psgc", "regions"],
    queryFn: getPsgcRegions,
    staleTime: 24 * 60 * 60 * 1000,
  })
}
