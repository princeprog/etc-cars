"use client"

import { useQuery } from "@tanstack/react-query"

import { getSalesReport } from "@/services/reports.service"
import type { ReportFilters } from "@/types/reports"
import { reportsQueryKeys } from "./reports-query-keys"

export function useSalesReportQuery(filters: ReportFilters = {}, enabled = true) {
  return useQuery({
    queryKey: reportsQueryKeys.sales(filters),
    queryFn: () => getSalesReport(filters),
    enabled,
    retry: false,
  })
}
