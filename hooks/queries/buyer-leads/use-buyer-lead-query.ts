"use client"

import { useQuery } from "@tanstack/react-query"

import { getBuyerLead } from "@/services/buyer-leads.service"
import { buyerLeadsQueryKeys } from "./buyer-leads-query-keys"

export function useBuyerLeadQuery(id: string) {
  return useQuery({
    queryKey: buyerLeadsQueryKeys.detail(id),
    queryFn: () => getBuyerLead(id),
    enabled: Boolean(id),
    retry: false,
  })
}
