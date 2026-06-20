"use client"

import { useQuery } from "@tanstack/react-query"

import { getSellerLeads } from "@/services/seller-leads.service"
import { sellerLeadsQueryKeys } from "./seller-leads-query-keys"

export function useSellerLeadsQuery() {
  return useQuery({
    queryKey: sellerLeadsQueryKeys.lists(),
    queryFn: getSellerLeads,
    retry: false,
  })
}
