export const roleQueryKeys = {
  all: ["roles"] as const,
  list: () => [...roleQueryKeys.all, "list"] as const,
  detail: (id: string) => [...roleQueryKeys.all, "detail", id] as const,
  permissions: () => [...roleQueryKeys.all, "permissions"] as const,
}
