"use client"

import { useQuery } from "@tanstack/react-query"

import { getLeadsReport } from "@/services/reports.service"
import type { ReportFilters } from "@/types/reports"
import { reportsQueryKeys } from "./reports-query-keys"

export function useLeadsReportQuery(filters: ReportFilters = {}, enabled = true) {
  return useQuery({
    queryKey: reportsQueryKeys.leads(filters),
    queryFn: () => getLeadsReport(filters),
    enabled,
    retry: false,
  })
}
