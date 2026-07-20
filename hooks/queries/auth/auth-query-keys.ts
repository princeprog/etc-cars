import type { ListUsersParams } from "@/types/auth"

export const authQueryKeys = {
  authenticatedUser: ["auth", "me"] as const,
  users: (params?: ListUsersParams) =>
    [
      "auth",
      "users",
      params?.search ?? "",
      params?.status ?? "all",
      params?.page ?? 1,
      params?.pageSize ?? 10,
    ] as const,
}
