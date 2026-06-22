"use client"

import { useQuery } from "@tanstack/react-query"

import { getFollowUps } from "@/services/follow-ups.service"
import type { FollowUpListFilters } from "@/types/follow-ups"
import { followUpsQueryKeys } from "./follow-ups-query-keys"

export function useFollowUpsQuery(filters?: FollowUpListFilters) {
  return useQuery({
    queryKey: followUpsQueryKeys.lists(filters),
    queryFn: () => getFollowUps(filters),
    retry: false,
  })
}
