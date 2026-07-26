import type { FinancingApplicationFilters } from "@/services/financing.service"

export const financingQueryKeys = {
  all: ["financing"] as const,
  applications: (filters?: FinancingApplicationFilters) =>
    [...financingQueryKeys.all, "applications", filters] as const,
  application: (id: string) =>
    [...financingQueryKeys.all, "applications", id] as const,
  requirements: () => [...financingQueryKeys.all, "requirements"] as const,
}
