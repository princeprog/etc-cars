import type { AuthenticatedUser } from "@/types/auth"

export function can(user: AuthenticatedUser | undefined, permission: string) {
  return Boolean(user?.permissions?.[permission])
}

export function scopeFor(
  user: AuthenticatedUser | undefined,
  permission: string,
) {
  return user?.permissions?.[permission] ?? null
}
