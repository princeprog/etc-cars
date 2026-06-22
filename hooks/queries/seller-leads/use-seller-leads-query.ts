"use client"

import { useQuery } from "@tanstack/react-query"

import { getSellerLeads } from "@/services/seller-leads.service"
import type { SellerLeadListFilters } from "@/types/seller-leads"
import { sellerLeadsQueryKeys } from "./seller-leads-query-keys"

export function useSellerLeadsQuery(filters: SellerLeadListFilters = {}) {
  return useQuery({
    queryKey: sellerLeadsQueryKeys.filteredList(filters),
    queryFn: () => getSellerLeads(filters),
    retry: false,
  })
}
