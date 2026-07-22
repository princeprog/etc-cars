"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getInspectionChecklistSettings,
  getInspectionTemplate,
  getInspectionTemplates,
  getPublishedInspectionTemplates,
  getSellerLeadInspection,
} from "@/services/inspection-checklists.service";
import { inspectionChecklistsQueryKeys } from "./inspection-checklists-query-keys";

export function useInspectionTemplatesQuery() {
  return useQuery({
    queryKey: inspectionChecklistsQueryKeys.templates(),
    queryFn: getInspectionTemplates,
  });
}

export function useInspectionChecklistSettingsQuery() {
  return useQuery({
    queryKey: inspectionChecklistsQueryKeys.settings(),
    queryFn: getInspectionChecklistSettings,
  });
}

export function usePublishedInspectionTemplatesQuery() {
  return useQuery({
    queryKey: inspectionChecklistsQueryKeys.published(),
    queryFn: getPublishedInspectionTemplates,
  });
}

export function useInspectionTemplateQuery(id: string | null) {
  return useQuery({
    queryKey: inspectionChecklistsQueryKeys.detail(id ?? "unknown"),
    queryFn: () => getInspectionTemplate(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useSellerLeadInspectionQuery(leadId: string | null) {
  return useQuery({
    queryKey: inspectionChecklistsQueryKeys.sellerLeadInspection(
      leadId ?? "unknown",
    ),
    queryFn: () => getSellerLeadInspection(leadId ?? ""),
    enabled: Boolean(leadId),
    retry: false,
  });
}
