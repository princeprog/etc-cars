"use client"

import { useQuery } from "@tanstack/react-query"

import { getReportsOverview } from "@/services/reports.service"
import type { ReportFilters } from "@/types/reports"
import { reportsQueryKeys } from "./reports-query-keys"

export function useReportsOverviewQuery(
  filters: ReportFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: reportsQueryKeys.overview(filters),
    queryFn: () => getReportsOverview(filters),
    enabled,
    retry: false,
  })
}
