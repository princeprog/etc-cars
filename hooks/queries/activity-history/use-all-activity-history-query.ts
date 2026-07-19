"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getAllActivityHistory } from "@/services/activity-history.service";
import type { ActivityHistoryListFilters } from "@/types/activity-history-page";
import { activityHistoryQueryKeys } from "./activity-history-query-keys";

export function useAllActivityHistoryQuery(
  filters?: ActivityHistoryListFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: activityHistoryQueryKeys.list(filters),
    queryFn: () => getAllActivityHistory(filters),
    placeholderData: keepPreviousData,
    enabled,
    retry: false,
  });
}
