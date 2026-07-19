import type { NotificationListFilters } from "@/types/notifications"

export const notificationsQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationsQueryKeys.all, "list"] as const,
  filteredList: (filters: NotificationListFilters) =>
    [...notificationsQueryKeys.lists(), filters] as const,
  unreadCount: () => [...notificationsQueryKeys.all, "unread-count"] as const,
}
