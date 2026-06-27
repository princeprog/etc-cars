"use client"

import { useQuery } from "@tanstack/react-query"

import { getProfitabilityReport } from "@/services/reports.service"
import type { ReportFilters } from "@/types/reports"
import { reportsQueryKeys } from "./reports-query-keys"

export function useProfitabilityReportQuery(
  filters: ReportFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: reportsQueryKeys.profitability(filters),
    queryFn: () => getProfitabilityReport(filters),
    enabled,
    retry: false,
  })
}
