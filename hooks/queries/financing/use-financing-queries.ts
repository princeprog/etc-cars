"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import {
  getFinancingApplication,
  getFinancingApplications,
  getFinancingRequirements,
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

export function useFinancingRequirementsQuery() {
  return useQuery({
    queryKey: financingQueryKeys.requirements(),
    queryFn: getFinancingRequirements,
    retry: false,
  })
}
