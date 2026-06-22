import type { SellerLeadListFilters } from "@/types/seller-leads"

export const sellerLeadsQueryKeys = {
  all: ["seller-leads"] as const,
  lists: () => [...sellerLeadsQueryKeys.all, "list"] as const,
  filteredList: (filters: SellerLeadListFilters) =>
    [...sellerLeadsQueryKeys.all, "list", "filtered", filters] as const,
  detail: (id: string) => [...sellerLeadsQueryKeys.all, "detail", id] as const,
}
