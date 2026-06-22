"use client"

import { useQuery } from "@tanstack/react-query"

import { getSalesSummary } from "@/services/sales.service"
import type { SalesListFilters } from "@/types/sales"
import { salesQueryKeys } from "./sales-query-keys"

export function useSalesSummaryQuery(filters: Omit<SalesListFilters, "page" | "pageSize"> = {}) {
  return useQuery({
    queryKey: salesQueryKeys.filteredSummary(filters),
    queryFn: () => getSalesSummary(filters),
    retry: false,
  })
}
