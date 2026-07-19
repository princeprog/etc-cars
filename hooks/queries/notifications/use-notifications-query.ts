"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { getNotifications } from "@/services/notifications.service"
import type { NotificationListFilters } from "@/types/notifications"
import { notificationsQueryKeys } from "./notifications-query-keys"

export function useNotificationsQuery(filters: NotificationListFilters = {}) {
  return useQuery({
    queryKey: notificationsQueryKeys.filteredList(filters),
    queryFn: () => getNotifications(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    retry: false,
  })
}
