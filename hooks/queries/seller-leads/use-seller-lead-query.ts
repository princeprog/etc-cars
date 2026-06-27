"use client"

import { useQuery } from "@tanstack/react-query"

import { getSellerLead } from "@/services/seller-leads.service"
import { sellerLeadsQueryKeys } from "./seller-leads-query-keys"

export function useSellerLeadQuery(id: string | null) {
  return useQuery({
    queryKey: sellerLeadsQueryKeys.detail(id ?? "unknown"),
    queryFn: () => getSellerLead(id ?? ""),
    enabled: Boolean(id),
    retry: false,
  })
}
