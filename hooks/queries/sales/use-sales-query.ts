"use client"

import { useQuery } from "@tanstack/react-query"

import { getSales } from "@/services/sales.service"
import type { SalesListFilters } from "@/types/sales"
import { salesQueryKeys } from "./sales-query-keys"

export function useSalesQuery(filters: SalesListFilters = {}) {
  return useQuery({
    queryKey: salesQueryKeys.filteredList(filters),
    queryFn: () => getSales(filters),
    retry: false,
  })
}
