import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  NotificationListFilters,
  NotificationResponse,
  NotificationUnreadCountResponse,
  NotificationsResponse,
} from "@/types/notifications"

function withQuery(path: string, params: URLSearchParams) {
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

function buildNotificationParams(filters: NotificationListFilters = {}) {
  const params = new URLSearchParams()

  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize))
  if (filters.unreadOnly) params.set("unreadOnly", "true")
  if (filters.includeResolved) params.set("includeResolved", "true")

  return params
}

export function getNotifications(filters: NotificationListFilters = {}) {
  return apiRequest<NotificationsResponse>(
    withQuery(API_ENDPOINTS.notifications.root, buildNotificationParams(filters)),
  )
}

export function getNotificationUnreadCount() {
  return apiRequest<NotificationUnreadCountResponse>(
    API_ENDPOINTS.notifications.unreadCount,
  )
}

export function markNotificationRead(id: string) {
  return apiRequest<NotificationResponse>(API_ENDPOINTS.notifications.byIdRead(id), {
    method: "PATCH",
  })
}

export function markNotificationUnread(id: string) {
  return apiRequest<NotificationResponse>(
    API_ENDPOINTS.notifications.byIdUnread(id),
    {
      method: "PATCH",
    },
  )
}

export function markAllNotificationsRead() {
  return apiRequest<NotificationUnreadCountResponse>(
    API_ENDPOINTS.notifications.markAllRead,
    {
      method: "POST",
    },
  )
}
