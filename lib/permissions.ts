import type { AuthenticatedUser } from "@/types/auth"

type PermissionCarrier =
  | Pick<AuthenticatedUser, "permissions">
  | { permissions?: AuthenticatedUser["permissions"] }
  | undefined

export function can(user: PermissionCarrier, permission: string) {
  return Boolean(user?.permissions?.[permission])
}

export function scopeFor(
  user: PermissionCarrier,
  permission: string,
) {
  return user?.permissions?.[permission] ?? null
}
