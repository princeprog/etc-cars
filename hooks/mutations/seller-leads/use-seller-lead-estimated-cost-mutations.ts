"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { sellerLeadsQueryKeys } from "@/hooks/queries/seller-leads/seller-leads-query-keys"
import {
  createSellerLeadEstimatedCost,
  deleteSellerLeadEstimatedCost,
} from "@/services/seller-leads.service"
import type { SellerLeadEstimatedCostPayload } from "@/types/seller-leads"

function useInvalidateSellerLeadQueries() {
  const queryClient = useQueryClient()

  return async (sellerLeadId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: sellerLeadsQueryKeys.all }),
      queryClient.invalidateQueries({
        queryKey: sellerLeadsQueryKeys.detail(sellerLeadId),
      }),
    ])
  }
}

export function useCreateSellerLeadEstimatedCostMutation() {
  const invalidate = useInvalidateSellerLeadQueries()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: SellerLeadEstimatedCostPayload
    }) => createSellerLeadEstimatedCost(id, payload),
    onSuccess: async (_data, variables) => invalidate(variables.id),
  })
}

export function useDeleteSellerLeadEstimatedCostMutation() {
  const invalidate = useInvalidateSellerLeadQueries()

  return useMutation({
    mutationFn: ({ id, costId }: { id: string; costId: string }) =>
      deleteSellerLeadEstimatedCost(id, costId),
    onSuccess: async (_data, variables) => invalidate(variables.id),
  })
}
