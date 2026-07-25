"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import {
  getFinancingApplication,
  getFinancingApplications,
  getFinancingPartners,
  getFinancingTemplates,
  type FinancingApplicationFilters,
} from "@/services/financing.service"
import { financingQueryKeys } from "./financing-query-keys"

export function useFinancingApplicationsQuery(
  filters?: FinancingApplicationFilters,
) {
  return useQuery({
    queryKey: financingQueryKeys.applications(filters),
    queryFn: () => getFinancingApplications(filters),
    placeholderData: keepPreviousData,
    retry: false,
  })
}

export function useFinancingApplicationQuery(id: string) {
  return useQuery({
    queryKey: financingQueryKeys.application(id),
    queryFn: () => getFinancingApplication(id),
    retry: false,
  })
}

export function useFinancingPartnersQuery() {
  return useQuery({
    queryKey: financingQueryKeys.partners(),
    queryFn: getFinancingPartners,
    retry: false,
  })
}

export function useFinancingTemplatesQuery(partnerId?: string) {
  return useQuery({
    queryKey: financingQueryKeys.templates(partnerId),
    queryFn: () => getFinancingTemplates(partnerId),
    retry: false,
  })
}
