export const buyerLeadsQueryKeys = {
  all: ["buyer-leads"] as const,
  lists: () => [...buyerLeadsQueryKeys.all, "list"] as const,
  detail: (id: string) => [...buyerLeadsQueryKeys.all, "detail", id] as const,
}
