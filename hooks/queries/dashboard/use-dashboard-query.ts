"use client"

import { useQuery } from "@tanstack/react-query"

import { getDashboard } from "@/services/dashboard.service"
import { dashboardQueryKeys } from "./dashboard-query-keys"

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardQueryKeys.summary,
    queryFn: getDashboard,
    retry: false,
  })
}
