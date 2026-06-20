"use client"

import { useQuery } from "@tanstack/react-query"

import { getFollowUps } from "@/services/follow-ups.service"
import type { FollowUpStatus } from "@/types/follow-ups"
import { followUpsQueryKeys } from "./follow-ups-query-keys"

export function useFollowUpsQuery(status?: FollowUpStatus) {
  return useQuery({
    queryKey: followUpsQueryKeys.lists(status),
    queryFn: () => getFollowUps(status),
    retry: false,
  })
}
