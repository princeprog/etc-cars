"use client"

import { useQuery } from "@tanstack/react-query"

import { getBuyerLeads } from "@/services/buyer-leads.service"

const SALES_BUYER_LEAD_SEARCH_PAGE_SIZE = 8

export function useSalesBuyerLeadSearchQuery(search: string, open: boolean) {
  const normalizedSearch = search.trim()

  return useQuery({
    queryKey: ["sales", "buyer-leads", "search", normalizedSearch] as const,
    queryFn: () =>
      getBuyerLeads({
        page: 1,
        pageSize: SALES_BUYER_LEAD_SEARCH_PAGE_SIZE,
        search: normalizedSearch || undefined,
      }),
    enabled: open,
    retry: false,
  })
}
