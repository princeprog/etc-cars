"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { notificationsQueryKeys } from "@/hooks/queries/notifications/notifications-query-keys"
import {
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from "@/services/notifications.service"

function useNotificationInvalidation() {
  const queryClient = useQueryClient()

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: notificationsQueryKeys.all,
    })
  }
}

export function useMarkNotificationReadMutation() {
  const invalidate = useNotificationInvalidation()

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: invalidate,
  })
}

export function useMarkNotificationUnreadMutation() {
  const invalidate = useNotificationInvalidation()

  return useMutation({
    mutationFn: (id: string) => markNotificationUnread(id),
    onSuccess: invalidate,
  })
}

export function useMarkAllNotificationsReadMutation() {
  const invalidate = useNotificationInvalidation()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  })
}
