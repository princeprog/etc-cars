"use client"

import { useQuery } from "@tanstack/react-query"

import { getNotificationUnreadCount } from "@/services/notifications.service"
import { notificationsQueryKeys } from "./notifications-query-keys"

export function useNotificationUnreadCountQuery() {
  return useQuery({
    queryKey: notificationsQueryKeys.unreadCount(),
    queryFn: getNotificationUnreadCount,
    refetchInterval: 5 * 60_000,
    retry: false,
  })
}
