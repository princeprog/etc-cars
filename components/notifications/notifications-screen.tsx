"use client"

import * as React from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  BellIcon,
  CalendarClockIcon,
  CheckCheckIcon,
  CircleAlertIcon,
  Clock3Icon,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

const PAGE_SIZE = 12
type NotificationTab = "all" | "unread"

export function NotificationsScreen() {
  const [page, setPage] = React.useState(1)
  const [activeTab, setActiveTab] = React.useState<NotificationTab>("all")
  const unreadOnly = activeTab === "unread"
  const notificationsQuery = useNotificationsQuery({
    page,
    pageSize: PAGE_SIZE,
    unreadOnly,
  })
  const unreadCountQuery = useNotificationUnreadCountQuery()
  const markReadMutation = useMarkNotificationReadMutation()
  const markUnreadMutation = useMarkNotificationUnreadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()
  const notifications = notificationsQuery.data?.notifications ?? []
  const pagination = notificationsQuery.data?.pagination
  const unreadCount = unreadCountQuery.data?.count ?? 0
  const totalCount = unreadOnly
    ? unreadCount
    : (notificationsQuery.data?.pagination.total ?? unreadCount)

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
              Review active expense and follow-up reminders, then open the
              related workflow when it needs attention.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Refresh notifications"
              disabled={notificationsQuery.isFetching}
              onClick={() => void notificationsQuery.refetch()}
            >
              <RefreshCcwIcon
                data-icon="inline-start"
                className={notificationsQuery.isFetching ? "animate-spin" : ""}
              />
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={markAllReadMutation.isPending}
              onClick={() => void markAllRead()}
            >
              <CheckCheckIcon data-icon="inline-start" />
              Mark All Read
            </Button>
          </div>
        </header>

        <Card className="overflow-hidden rounded-2xl border-border/70 p-0 shadow-sm">
          <CardHeader className="gap-0 border-b p-0">
            <div className="flex flex-col gap-4 px-5 pt-5 pb-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 flex-col gap-1">
                <CardTitle className="text-xl">Notifications</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Active reminders from finance and follow-up workflows.
                </p>
              </div>
              <Button
                type="button"
                variant="link"
                className="h-auto justify-start px-0 text-primary md:justify-center"
                disabled={!unreadCount || markAllReadMutation.isPending}
                onClick={() => void markAllRead()}
              >
                Mark all as read
              </Button>
            </div>
            <div className="px-5">
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  setActiveTab(value as NotificationTab)
                  setPage(1)
                }}
              >
                <TabsList
                  variant="line"
                  className="h-12 w-full justify-start gap-7 rounded-none p-0"
                >
                  <TabsTrigger
                    value="all"
                    className="h-12 flex-none px-0 text-base"
                  >
                    All
                    <NotificationCount count={totalCount} />
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="h-12 flex-none px-0 text-base"
                  >
                    Unread
                    <NotificationCount count={unreadCount} />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
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
                  description="Active reminders will appear here as due dates approach."
                />
              </div>
            )}
          </CardContent>
          {pagination &&
          !notificationsQuery.isPending &&
          !notificationsQuery.error ? (
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
  const content = (
    <>
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl",
          getNotificationIconClassName(notification.type),
        )}
      >
        {renderNotificationIcon(notification.type, "size-7")}
      </div>
      <div className="min-w-0">
        <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <p className="truncate text-base font-semibold text-foreground">
            {notification.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: false,
            })}
          </p>
        </div>
        <p className="mt-1 max-w-3xl text-base leading-7 text-muted-foreground">
          {notification.message}
        </p>
      </div>
    </>
  )

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_28px] items-center gap-4 border-b px-5 py-5 last:border-b-0",
        !notification.isRead && "bg-primary/[0.025]",
      )}
    >
      {notification.actionUrl ? (
        <Link
          href={notification.actionUrl}
          className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-4"
        >
          {content}
        </Link>
      ) : (
        <div className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-4">
          {content}
        </div>
      )}
      <button
        type="button"
        aria-label={
          notification.isRead
            ? "Mark notification unread"
            : "Mark notification read"
        }
        className="flex size-7 items-center justify-center rounded-full"
        onClick={onToggleRead}
      >
        <span
          className={cn(
            "size-2.5 rounded-full transition-colors",
            notification.isRead
              ? "bg-transparent hover:bg-muted-foreground/30"
              : "bg-primary",
          )}
        />
      </button>
    </div>
  )
}

function NotificationsSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[64px_minmax(0,1fr)_28px] gap-4 border-b px-5 py-5"
        >
          <Skeleton className="size-14 rounded-2xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="size-3 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function NotificationCount({ count }: { count: number }) {
  if (!count) {
    return null
  }

  return (
    <span className="ml-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {count > 99 ? "99+" : count}
    </span>
  )
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
