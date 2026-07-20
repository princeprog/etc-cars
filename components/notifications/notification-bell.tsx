"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BellIcon,
  CalendarClockIcon,
  CircleAlertIcon,
  Clock3Icon,
  ChevronRightIcon,
} from "lucide-react"
import { toast } from "@/components/ui/sileo"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useMarkNotificationUnreadMutation,
} from "@/hooks/mutations/notifications/use-notification-mutations"
import { useNotificationUnreadCountQuery } from "@/hooks/queries/notifications/use-notification-unread-count-query"
import { useNotificationsQuery } from "@/hooks/queries/notifications/use-notifications-query"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/types/api"
import type { AppNotification, NotificationType } from "@/types/notifications"

export function NotificationBell() {
  const router = useRouter()
  const unreadCountQuery = useNotificationUnreadCountQuery()
  const notificationsQuery = useNotificationsQuery({
    page: 1,
    pageSize: 5,
  })
  const markReadMutation = useMarkNotificationReadMutation()
  const markUnreadMutation = useMarkNotificationUnreadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()
  const notifications = notificationsQuery.data?.notifications ?? []
  const unreadCount = unreadCountQuery.data?.count ?? 0

  async function openNotification(notification: AppNotification) {
    try {
      if (!notification.isRead) {
        await markReadMutation.mutateAsync(notification.id)
      }
      if (notification.actionUrl) {
        router.push(notification.actionUrl)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to open notification"))
    }
  }

  async function toggleRead(notification: AppNotification) {
    try {
      if (notification.isRead) {
        await markUnreadMutation.mutateAsync(notification.id)
      } else {
        await markReadMutation.mutateAsync(notification.id)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update notification"))
    }
  }

  async function markAllRead() {
    try {
      await markAllReadMutation.mutateAsync()
      toast.success("Notifications marked as read")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update notifications"))
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            unreadCount
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
          className="relative"
        >
          <BellIcon />
          {unreadCount ? (
            <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(calc(100vw-1.5rem),390px)] overflow-hidden rounded-xl border-border/70 p-0 shadow-xl"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Notifications
          </h2>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0 text-xs font-medium text-primary"
            disabled={!unreadCount || markAllReadMutation.isPending}
            onClick={markAllRead}
          >
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="h-[280px]">
          {notificationsQuery.isPending ? (
            <div className="flex flex-col px-4 pb-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[40px_minmax(0,1fr)_34px] gap-2.5 border-b py-2.5 last:border-b-0"
                >
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                  <Skeleton className="h-3 w-7" />
                </div>
              ))}
            </div>
          ) : notifications.length ? (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <NotificationPreviewRow
                  key={notification.id}
                  notification={notification}
                  onOpen={() => {
                    void openNotification(notification)
                  }}
                  onToggleRead={() => {
                    void toggleRead(notification)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-6 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-full border bg-muted/30 text-muted-foreground">
                <BellIcon className="size-5" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No active notifications
              </p>
              <p className="text-xs text-muted-foreground">
                Reminders appear here when bills or follow-ups need attention.
              </p>
            </div>
          )}
        </ScrollArea>
        <div className="border-t px-4 py-2.5 text-center">
          <Button
            asChild
            variant="link"
            className="h-auto px-0 text-xs font-medium text-primary"
          >
            <Link href="/notifications">
              View all notifications
              <ChevronRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationPreviewRow({
  notification,
  onOpen,
  onToggleRead,
}: {
  notification: AppNotification
  onOpen: () => void
  onToggleRead: () => void
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[40px_minmax(0,1fr)_36px] items-start gap-2.5 border-b px-4 py-2.5 last:border-b-0",
        !notification.isRead && "bg-primary/[0.015]",
      )}
    >
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-lg",
          getNotificationIconClassName(notification.type),
        )}
      >
        {renderNotificationIcon(notification.type, "size-4")}
      </div>
      <button type="button" className="min-w-0 text-left" onClick={onOpen}>
        <p className="truncate text-xs font-semibold text-foreground">
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted-foreground break-words [overflow-wrap:anywhere]">
          {notification.message}
        </p>
      </button>
      <div className="flex flex-col items-end gap-2 pt-0.5">
        <p className="text-right text-xs text-muted-foreground">
          {formatNotificationAge(notification.createdAt)}
        </p>
        <button
          type="button"
          aria-label={
            notification.isRead
              ? "Mark notification unread"
              : "Mark notification read"
          }
          className="flex size-5 items-center justify-center rounded-full"
          onClick={onToggleRead}
        >
          <span
            className={cn(
              "size-1.5 rounded-full transition-colors",
              notification.isRead
                ? "bg-transparent hover:bg-muted-foreground/30"
                : "bg-primary",
            )}
          />
        </button>
      </div>
    </div>
  )
}

function formatNotificationAge(createdAt: string) {
  const elapsedMs = Math.max(0, Date.now() - new Date(createdAt).getTime())
  const elapsedMinutes = Math.floor(elapsedMs / 60_000)

  if (elapsedMinutes < 1) {
    return "now"
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m`
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60)

  if (elapsedHours < 24) {
    return `${elapsedHours}h`
  }

  const elapsedDays = Math.floor(elapsedHours / 24)

  if (elapsedDays < 30) {
    return `${elapsedDays}d`
  }

  const elapsedMonths = Math.floor(elapsedDays / 30)

  return `${elapsedMonths}mo`
}

function renderNotificationIcon(type: NotificationType, className: string) {
  switch (type) {
    case "expense_overdue":
      return <CircleAlertIcon className={className} />
    case "expense_due_today":
    case "follow_up_due_today":
      return <Clock3Icon className={className} />
    case "expense_due_soon":
      return <BellIcon className={className} />
    case "follow_up_due_soon":
      return <CalendarClockIcon className={className} />
    case "follow_up_overdue":
      return <CircleAlertIcon className={className} />
  }
}

function getNotificationIconClassName(type: NotificationType) {
  switch (type) {
    case "expense_overdue":
      return "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-300"
    case "expense_due_today":
      return "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300"
    case "expense_due_soon":
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300"
    case "follow_up_overdue":
      return "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300"
    case "follow_up_due_today":
      return "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300"
    case "follow_up_due_soon":
      return "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-300"
  }
}
