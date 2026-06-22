"use client"

import { useQuery } from "@tanstack/react-query"

import { getSale } from "@/services/sales.service"
import { salesQueryKeys } from "./sales-query-keys"

export function useSaleQuery(id: string) {
  return useQuery({
    queryKey: salesQueryKeys.detail(id),
    queryFn: () => getSale(id),
    enabled: Boolean(id),
    retry: false,
  })
}
