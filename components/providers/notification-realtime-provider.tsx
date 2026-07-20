"use client"

import * as React from "react"
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js"
import { useQueryClient } from "@tanstack/react-query"

import { notificationsQueryKeys } from "@/hooks/queries/notifications/notifications-query-keys"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { getSupabaseRealtimeClient } from "@/lib/supabase-realtime"
import { getRealtimeToken } from "@/services/auth.service"

const NOTIFICATION_INVALIDATION_DELAY_MS = 250
const TOKEN_REFRESH_BUFFER_MS = 60_000
const FALLBACK_TOKEN_REFRESH_MS = 9 * 60_000

export function NotificationRealtimeProvider() {
  const queryClient = useQueryClient()
  const authQuery = useAuthenticatedUserQuery()
  const userId = authQuery.data?.user.id
  const invalidateTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  const scheduleNotificationRefresh = React.useCallback(() => {
    if (invalidateTimerRef.current) {
      clearTimeout(invalidateTimerRef.current)
    }

    invalidateTimerRef.current = setTimeout(() => {
      void queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.all,
      })
      invalidateTimerRef.current = null
    }, NOTIFICATION_INVALIDATION_DELAY_MS)
  }, [queryClient])

  React.useEffect(() => {
    const supabase = getSupabaseRealtimeClient()

    if (!supabase || !userId) {
      return
    }

    const realtimeClient = supabase
    let isActive = true
    let refreshTokenTimer: ReturnType<typeof setTimeout> | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    const channel = realtimeClient.channel(`notifications:${userId}`, {
      config: {
        private: true,
      },
    })

    function clearTimers() {
      if (refreshTokenTimer) {
        clearTimeout(refreshTokenTimer)
        refreshTokenTimer = null
      }

      if (retryTimer) {
        clearTimeout(retryTimer)
        retryTimer = null
      }
    }

    function scheduleTokenRefresh(expiresAt: string) {
      const expiresAtMs = Date.parse(expiresAt)
      const refreshInMs = Number.isFinite(expiresAtMs)
        ? Math.max(expiresAtMs - Date.now() - TOKEN_REFRESH_BUFFER_MS, 30_000)
        : FALLBACK_TOKEN_REFRESH_MS

      refreshTokenTimer = setTimeout(() => {
        void refreshRealtimeToken()
      }, refreshInMs)
    }

    async function refreshRealtimeToken() {
      try {
        const { token, expiresAt } = await getRealtimeToken()

        if (!isActive) {
          return
        }

        realtimeClient.realtime.setAuth(token)
        scheduleTokenRefresh(expiresAt)
      } catch (error) {
        if (!isActive) {
          return
        }

        retryTimer = setTimeout(() => {
          void refreshRealtimeToken()
        }, 30_000)
      }
    }

    async function subscribe() {
      try {
        const { token, expiresAt } = await getRealtimeToken()

        if (!isActive) {
          return
        }

        realtimeClient.realtime.setAuth(token)
        scheduleTokenRefresh(expiresAt)

        channel
          .on(
            "broadcast",
            { event: "notification.changed" },
            scheduleNotificationRefresh,
          )
          .subscribe((status) => {
            if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
              scheduleNotificationRefresh()
            }
          })
      } catch (error) {
        if (!isActive) {
          return
        }

        retryTimer = setTimeout(() => {
          void subscribe()
        }, 30_000)
      }
    }

    void subscribe()

    return () => {
      isActive = false
      clearTimers()
      void realtimeClient.removeChannel(channel)
    }
  }, [scheduleNotificationRefresh, userId])

  React.useEffect(() => {
    return () => {
      if (invalidateTimerRef.current) {
        clearTimeout(invalidateTimerRef.current)
      }
    }
  }, [])

  return null
}
