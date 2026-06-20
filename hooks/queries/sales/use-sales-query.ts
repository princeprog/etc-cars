"use client"

import { useQuery } from "@tanstack/react-query"

import { getSales } from "@/services/sales.service"
import { salesQueryKeys } from "./sales-query-keys"

export function useSalesQuery() {
  return useQuery({
    queryKey: salesQueryKeys.lists(),
    queryFn: getSales,
    retry: false,
  })
}
