"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { buyerLeadsQueryKeys } from "@/hooks/queries/buyer-leads/buyer-leads-query-keys"
import { linkBuyerLeadVehicle, unlinkBuyerLeadVehicle } from "@/services/buyer-leads.service"

export function useLinkBuyerLeadVehicleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, vehicleId }: { id: string; vehicleId: string }) =>
      linkBuyerLeadVehicle(id, { vehicleId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: buyerLeadsQueryKeys.all })
    },
  })
}

export function useUnlinkBuyerLeadVehicleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, vehicleId }: { id: string; vehicleId: string }) =>
      unlinkBuyerLeadVehicle(id, vehicleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: buyerLeadsQueryKeys.all })
    },
  })
}
