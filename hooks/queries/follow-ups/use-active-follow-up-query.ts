"use client";

import { useQuery } from "@tanstack/react-query";

import { getActiveFollowUp } from "@/services/follow-ups.service";
import type { LeadType } from "@/types/follow-ups";
import { followUpsQueryKeys } from "./follow-ups-query-keys";

export function useActiveFollowUpQuery(leadType: LeadType, leadId: string) {
  return useQuery({
    queryKey: followUpsQueryKeys.active(leadType, leadId),
    queryFn: () => getActiveFollowUp(leadType, leadId),
    retry: false,
  });
}
