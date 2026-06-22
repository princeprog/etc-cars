"use client"

import { useQuery } from "@tanstack/react-query"

import { getBuyerLeads } from "@/services/buyer-leads.service"
import type { BuyerLeadListFilters } from "@/types/buyer-leads"
import { buyerLeadsQueryKeys } from "./buyer-leads-query-keys"

export function useBuyerLeadsQuery(filters: BuyerLeadListFilters = {}) {
  return useQuery({
    queryKey: buyerLeadsQueryKeys.filteredList(filters),
    queryFn: () => getBuyerLeads(filters),
    retry: false,
  })
}
