export const salesQueryKeys = {
  all: ["sales"] as const,
  lists: () => [...salesQueryKeys.all, "list"] as const,
  detail: (id: string) => [...salesQueryKeys.all, "detail", id] as const,
}
