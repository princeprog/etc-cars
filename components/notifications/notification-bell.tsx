"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
  BellIcon,
  CheckCheckIcon,
  CircleAlertIcon,
  CircleIcon,
  Clock3Icon,
  ExternalLinkIcon,
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
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-foreground">
              Notifications
            </p>
            <p className="text-xs text-muted-foreground">
              Bills due soon, due today, and overdue.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!unreadCount || markAllReadMutation.isPending}
            onClick={markAllRead}
          >
            <CheckCheckIcon data-icon="inline-start" />
            Read All
          </Button>
        </div>
        <ScrollArea className="max-h-[420px]">
          {notificationsQuery.isPending ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
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
                Expense reminders appear here when bills need attention.
              </p>
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Button asChild variant="ghost" className="w-full justify-between">
            <Link href="/notifications">
              View notification center
              <ExternalLinkIcon data-icon="inline-end" />
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
        "grid grid-cols-[36px_minmax(0,1fr)_32px] gap-3 border-b px-4 py-3 last:border-b-0",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-full border",
          getNotificationIconClassName(notification.type),
        )}
      >
        {renderNotificationIcon(notification.type, "size-4")}
      </div>
      <button
        type="button"
        className="min-w-0 text-left"
        onClick={onOpen}
      >
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {notification.title}
          </p>
          {!notification.isRead ? (
            <span className="size-2 shrink-0 rounded-full bg-primary" />
          ) : null}
        </div>
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={
          notification.isRead ? "Mark notification unread" : "Mark notification read"
        }
        onClick={onToggleRead}
      >
        {notification.isRead ? <CircleIcon /> : <CheckCheckIcon />}
      </Button>
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
      return "border-rose-200 bg-rose-50 text-rose-700"
    case "expense_due_today":
      return "border-sky-200 bg-sky-50 text-sky-700"
    case "expense_due_soon":
      return "border-cyan-200 bg-cyan-50 text-cyan-700"
  }
}
