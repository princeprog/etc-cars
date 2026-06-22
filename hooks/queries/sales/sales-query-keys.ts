import type { SalesListFilters } from "@/types/sales"

export const salesQueryKeys = {
  all: ["sales"] as const,
  lists: () => [...salesQueryKeys.all, "list"] as const,
  filteredList: (filters: SalesListFilters) =>
    [...salesQueryKeys.all, "list", "filtered", filters] as const,
  summaries: () => [...salesQueryKeys.all, "summary"] as const,
  filteredSummary: (filters: Omit<SalesListFilters, "page" | "pageSize">) =>
    [...salesQueryKeys.all, "summary", "filtered", filters] as const,
  detail: (id: string) => [...salesQueryKeys.all, "detail", id] as const,
}
