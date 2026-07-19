"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getDashboard } from "@/services/dashboard.service";
import type { DashboardRange } from "@/types/dashboard";
import { dashboardQueryKeys } from "./dashboard-query-keys";

export function useDashboardQuery(range: DashboardRange) {
  return useQuery({
    queryKey: dashboardQueryKeys.detail(range),
    queryFn: () => getDashboard(range),
    placeholderData: keepPreviousData,
    retry: false,
  });
}
