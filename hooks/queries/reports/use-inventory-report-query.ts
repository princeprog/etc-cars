"use client"

import { useQuery } from "@tanstack/react-query"

import { getInventoryReport } from "@/services/reports.service"
import type { ReportFilters } from "@/types/reports"
import { reportsQueryKeys } from "./reports-query-keys"

export function useInventoryReportQuery(
  filters: ReportFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: reportsQueryKeys.inventory(filters),
    queryFn: () => getInventoryReport(filters),
    enabled,
    retry: false,
  })
}
