export const vehiclesQueryKeys = {
  all: ["vehicles"] as const,
  lists: () => [...vehiclesQueryKeys.all, "list"] as const,
  detail: (id: string) => [...vehiclesQueryKeys.all, "detail", id] as const,
}
