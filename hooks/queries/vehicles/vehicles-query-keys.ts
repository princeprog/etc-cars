export const vehiclesQueryKeys = {
  all: ["vehicles"] as const,
  lists: () => [...vehiclesQueryKeys.all, "list"] as const,
  filteredList: (filters: Record<string, string | undefined>) =>
    [...vehiclesQueryKeys.all, "list", "filtered", filters] as const,
  detail: (id: string) => [...vehiclesQueryKeys.all, "detail", id] as const,
}
