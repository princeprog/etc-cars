"use client"

import { useQuery } from "@tanstack/react-query"

import { getBuyerLeads } from "@/services/buyer-leads.service"
import { buyerLeadsQueryKeys } from "./buyer-leads-query-keys"

export function useBuyerLeadsQuery() {
  return useQuery({
    queryKey: buyerLeadsQueryKeys.lists(),
    queryFn: getBuyerLeads,
    retry: false,
  })
}
