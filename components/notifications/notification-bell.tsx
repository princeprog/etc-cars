"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
  BellIcon,
  CircleAlertIcon,
  Clock3Icon,
  ChevronRightIcon,
} from "lucide-react"
import { toast } from "sonner"

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
    pageSize: 8,
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
        sideOffset={14}
        className="w-[min(calc(100vw-2rem),520px)] overflow-hidden rounded-2xl border-border/70 p-0 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 px-6 pt-6 pb-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Notifications
          </h2>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0 text-sm font-medium text-primary"
            disabled={!unreadCount || markAllReadMutation.isPending}
            onClick={markAllRead}
          >
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="max-h-[520px]">
          {notificationsQuery.isPending ? (
            <div className="flex flex-col px-6 pb-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[64px_minmax(0,1fr)_56px] gap-4 border-b py-5 last:border-b-0"
                >
                  <Skeleton className="size-14 rounded-2xl" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          ) : notifications.length ? (
            <div className="flex flex-col px-6">
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
                Expense reminders appear here when bills need attention.
              </p>
            </div>
          )}
        </ScrollArea>
        <div className="border-t px-6 py-4 text-center">
          <Button
            asChild
            variant="link"
            className="h-auto px-0 text-base font-medium text-primary"
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
        "grid grid-cols-[64px_minmax(0,1fr)_70px_12px] items-start gap-4 border-b py-5 last:border-b-0",
        !notification.isRead && "bg-primary/[0.015]",
      )}
    >
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl",
          getNotificationIconClassName(notification.type),
        )}
      >
        {renderNotificationIcon(notification.type, "size-7")}
      </div>
      <button
        type="button"
        className="min-w-0 text-left"
        onClick={onOpen}
      >
        <p className="truncate text-base font-semibold text-foreground">
          {notification.title}
        </p>
        <p className="mt-1 line-clamp-2 text-base leading-6 text-muted-foreground">
          {notification.message}
        </p>
      </button>
      <p className="pt-0.5 text-right text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(notification.createdAt), {
          addSuffix: false,
        })}
      </p>
      <button
        type="button"
        aria-label={
          notification.isRead
            ? "Mark notification unread"
            : "Mark notification read"
        }
        className="mt-9 flex size-3 items-center justify-center rounded-full"
        onClick={onToggleRead}
      >
        <span
          className={cn(
            "size-2 rounded-full transition-colors",
            notification.isRead
              ? "bg-transparent hover:bg-muted-foreground/30"
              : "bg-primary",
          )}
        />
      </button>
    </div>
  )
}

function renderNotificationIcon(type: NotificationType, className: string) {
  switch (type) {
    case "expense_overdue":
      return <CircleAlertIcon className={className} />
    case "expense_due_today":
      return <Clock3Icon className={className} />
    case "expense_due_soon":
      return <BellIcon className={className} />
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
  }
}
