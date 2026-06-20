export const sellerLeadsQueryKeys = {
  all: ["seller-leads"] as const,
  lists: () => [...sellerLeadsQueryKeys.all, "list"] as const,
  detail: (id: string) => [...sellerLeadsQueryKeys.all, "detail", id] as const,
}
