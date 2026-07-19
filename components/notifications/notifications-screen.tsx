"use client"

import * as React from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  BellIcon,
  CheckCheckIcon,
  CircleAlertIcon,
  Clock3Icon,
  ExternalLinkIcon,
  RefreshCcwIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ListPagination } from "@/components/operations/list-pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useMarkNotificationUnreadMutation,
} from "@/hooks/mutations/notifications/use-notification-mutations"
import { useNotificationsQuery } from "@/hooks/queries/notifications/use-notifications-query"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/types/api"
import type { AppNotification, NotificationType } from "@/types/notifications"

const PAGE_SIZE = 12

export function NotificationsScreen() {
  const [page, setPage] = React.useState(1)
  const [unreadOnly, setUnreadOnly] = React.useState(false)
  const notificationsQuery = useNotificationsQuery({
    page,
    pageSize: PAGE_SIZE,
    unreadOnly,
  })
  const markReadMutation = useMarkNotificationReadMutation()
  const markUnreadMutation = useMarkNotificationUnreadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()
  const notifications = notificationsQuery.data?.notifications ?? []
  const pagination = notificationsQuery.data?.pagination

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
    <AuthenticatedAppShell
      title="Notifications"
      breadcrumbs={[{ label: "Notifications" }]}
    >
      <main className="flex flex-1 flex-col gap-5 bg-muted/15 p-4 md:p-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground">
              Review active expense reminders and open the related bill when it
              needs attention.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
              <Switch
                id="unreadOnly"
                checked={unreadOnly}
                onCheckedChange={(checked) => {
                  setUnreadOnly(checked)
                  setPage(1)
                }}
              />
              <label
                htmlFor="unreadOnly"
                className="text-sm text-muted-foreground"
              >
                Unread only
              </label>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={notificationsQuery.isFetching}
              onClick={() => void notificationsQuery.refetch()}
            >
              <RefreshCcwIcon
                data-icon="inline-start"
                className={notificationsQuery.isFetching ? "animate-spin" : ""}
              />
              Refresh
            </Button>
            <Button
              type="button"
              disabled={markAllReadMutation.isPending}
              onClick={() => void markAllRead()}
            >
              <CheckCheckIcon data-icon="inline-start" />
              Mark All Read
            </Button>
          </div>
        </header>

        <Card className="overflow-hidden rounded-lg p-0 shadow-none">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Reminder Feed</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notificationsQuery.isPending ? (
              <NotificationsSkeleton />
            ) : notificationsQuery.error ? (
              <div className="p-5">
                <ApiErrorAlert
                  title="Unable to load notifications"
                  message={getApiErrorMessage(notificationsQuery.error, "")}
                />
              </div>
            ) : notifications.length ? (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <NotificationListRow
                    key={notification.id}
                    notification={notification}
                    onToggleRead={() => void toggleRead(notification)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No notifications found"
                  description="Active bill reminders will appear here as due dates approach."
                />
              </div>
            )}
          </CardContent>
          {pagination && !notificationsQuery.isPending && !notificationsQuery.error ? (
            <ListPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              itemLabel="notifications"
              onPageChange={setPage}
            />
          ) : null}
        </Card>
      </main>
    </AuthenticatedAppShell>
  )
}

function NotificationListRow({
  notification,
  onToggleRead,
}: {
  notification: AppNotification
  onToggleRead: () => void
}) {
  return (
    <div
      className={cn(
        "grid gap-4 border-b px-5 py-4 last:border-b-0 md:grid-cols-[44px_minmax(0,1fr)_auto]",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-full border",
          getNotificationIconClassName(notification.type),
        )}
      >
        {renderNotificationIcon(notification.type, "size-5")}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {notification.title}
          </p>
          {!notification.isRead ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
              Unread
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
      <div className="flex items-center gap-2 md:justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onToggleRead}>
          <CheckCheckIcon data-icon="inline-start" />
          {notification.isRead ? "Mark Unread" : "Mark Read"}
        </Button>
        {notification.actionUrl ? (
          <Button asChild size="sm">
            <Link href={notification.actionUrl}>
              Open
              <ExternalLinkIcon data-icon="inline-end" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function NotificationsSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid gap-4 border-b px-5 py-4 md:grid-cols-[44px_1fr_220px]">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      ))}
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
