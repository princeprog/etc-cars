import type { ReportFilters } from "@/types/reports"

export const reportsQueryKeys = {
  all: ["reports"] as const,
  overview: (filters: ReportFilters) =>
    [...reportsQueryKeys.all, "overview", filters] as const,
  sales: (filters: ReportFilters) =>
    [...reportsQueryKeys.all, "sales", filters] as const,
  inventory: (filters: ReportFilters) =>
    [...reportsQueryKeys.all, "inventory", filters] as const,
  leads: (filters: ReportFilters) =>
    [...reportsQueryKeys.all, "leads", filters] as const,
  profitability: (filters: ReportFilters) =>
    [...reportsQueryKeys.all, "profitability", filters] as const,
}
