"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { buyerLeadsQueryKeys } from "@/hooks/queries/buyer-leads/buyer-leads-query-keys";
import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys";
import { followUpsQueryKeys } from "@/hooks/queries/follow-ups/follow-ups-query-keys";
import { notificationsQueryKeys } from "@/hooks/queries/notifications/notifications-query-keys";
import { sellerLeadsQueryKeys } from "@/hooks/queries/seller-leads/seller-leads-query-keys";
import { updateFollowUp } from "@/services/follow-ups.service";
import type { UpdateFollowUpPayload } from "@/types/follow-ups";

export function useUpdateFollowUpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateFollowUpPayload;
    }) => updateFollowUp(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followUpsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: buyerLeadsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: sellerLeadsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
        queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all }),
      ]);
    },
  });
}
