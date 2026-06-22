import type { ListUsersParams } from "@/types/auth"

export const authQueryKeys = {
  authenticatedUser: ["auth", "me"] as const,
  users: (params?: ListUsersParams) =>
    ["auth", "users", params?.search ?? "", params?.status ?? "all"] as const,
}
