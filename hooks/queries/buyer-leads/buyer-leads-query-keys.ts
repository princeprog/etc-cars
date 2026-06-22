import type { BuyerLeadListFilters } from "@/types/buyer-leads"

export const buyerLeadsQueryKeys = {
  all: ["buyer-leads"] as const,
  lists: () => [...buyerLeadsQueryKeys.all, "list"] as const,
  filteredList: (filters: BuyerLeadListFilters) =>
    [...buyerLeadsQueryKeys.all, "list", "filtered", filters] as const,
  detail: (id: string) => [...buyerLeadsQueryKeys.all, "detail", id] as const,
}
