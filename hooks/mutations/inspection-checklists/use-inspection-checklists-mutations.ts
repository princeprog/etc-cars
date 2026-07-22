"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys";
import { inspectionChecklistsQueryKeys } from "@/hooks/queries/inspection-checklists/inspection-checklists-query-keys";
import { sellerLeadsQueryKeys } from "@/hooks/queries/seller-leads/seller-leads-query-keys";
import {
  archiveInspectionTemplate,
  completeSellerLeadInspection,
  createInspectionTemplate,
  publishInspectionTemplate,
  restoreInspectionTemplate,
  setDefaultInspectionTemplate,
  startSellerLeadInspection,
  updateInspectionChecklistSettings,
  updateInspectionTemplateDraft,
  updateSellerLeadInspection,
} from "@/services/inspection-checklists.service";
import type {
  CreateInspectionTemplatePayload,
  UpdateInspectionChecklistSettingsPayload,
  UpdateSellerLeadInspectionPayload,
  UpsertInspectionTemplateDraftPayload,
} from "@/types/inspection-checklists";

export function useUpdateInspectionChecklistSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateInspectionChecklistSettingsPayload) =>
      updateInspectionChecklistSettings(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: inspectionChecklistsQueryKeys.all,
      });
    },
  });
}

export function useCreateInspectionTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInspectionTemplatePayload) =>
      createInspectionTemplate(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: inspectionChecklistsQueryKeys.all,
      });
    },
  });
}

export function useUpdateInspectionTemplateDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpsertInspectionTemplateDraftPayload;
    }) => updateInspectionTemplateDraft(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: inspectionChecklistsQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: inspectionChecklistsQueryKeys.detail(variables.id),
        }),
      ]);
    },
  });
}

export function useInspectionTemplateActionMutation(
  action: "publish" | "default" | "archive" | "restore",
) {
  const queryClient = useQueryClient();
  const actionMap = {
    publish: publishInspectionTemplate,
    default: setDefaultInspectionTemplate,
    archive: archiveInspectionTemplate,
    restore: restoreInspectionTemplate,
  };

  return useMutation({
    mutationFn: (id: string) => actionMap[action](id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: inspectionChecklistsQueryKeys.all,
      });
    },
  });
}

export function useStartSellerLeadInspectionMutation(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startSellerLeadInspection(leadId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: inspectionChecklistsQueryKeys.sellerLeadInspection(leadId),
      });
    },
  });
}

export function useUpdateSellerLeadInspectionMutation(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSellerLeadInspectionPayload) =>
      updateSellerLeadInspection(leadId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: inspectionChecklistsQueryKeys.sellerLeadInspection(leadId),
      });
    },
  });
}

export function useCompleteSellerLeadInspectionMutation(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => completeSellerLeadInspection(leadId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: inspectionChecklistsQueryKeys.sellerLeadInspection(leadId),
        }),
        queryClient.invalidateQueries({
          queryKey: sellerLeadsQueryKeys.detail(leadId),
        }),
        queryClient.invalidateQueries({ queryKey: sellerLeadsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      ]);
    },
  });
}
