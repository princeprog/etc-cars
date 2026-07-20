"use client";

import * as React from "react";
import Link from "next/link";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import {
  BellIcon,
  CalendarIcon,
  CalendarClockIcon,
  CarFrontIcon,
  CheckCheckIcon,
  CircleAlertIcon,
  Clock3Icon,
  ExternalLinkIcon,
  InfoIcon,
  MoreVerticalIcon,
  ReceiptTextIcon,
  RefreshCcwIcon,
  SearchIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { EmptyState } from "@/components/operations/empty-state";
import { ListPagination } from "@/components/operations/list-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useMarkNotificationUnreadMutation,
} from "@/hooks/mutations/notifications/use-notification-mutations";
import { useNotificationUnreadCountQuery } from "@/hooks/queries/notifications/use-notification-unread-count-query";
import { useNotificationsQuery } from "@/hooks/queries/notifications/use-notifications-query";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/types/api";
import type { AppNotification, NotificationType } from "@/types/notifications";

const PAGE_SIZE = 10;
const ALL_VALUE = "all";

type NotificationCategoryFilter =
  "all" | "unread" | "follow-ups" | "sales" | "bills" | "system";

type NotificationTone = "blue" | "red" | "amber" | "green" | "gray";

const CATEGORY_FILTERS: Array<{
  label: string;
  value: NotificationCategoryFilter;
}> = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Follow-ups", value: "follow-ups" },
  { label: "Sales", value: "sales" },
  { label: "Bills", value: "bills" },
  { label: "System", value: "system" },
];

export function NotificationsScreen() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] =
    React.useState<NotificationCategoryFilter>("all");
  const [statusFilter, setStatusFilter] = React.useState(ALL_VALUE);
  const [dateFilter, setDateFilter] = React.useState("30");
  const [selectedNotificationId, setSelectedNotificationId] = React.useState<
    string | null
  >(null);

  const notificationsQuery = useNotificationsQuery({
    page,
    pageSize: PAGE_SIZE,
  });
  const unreadCountQuery = useNotificationUnreadCountQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markUnreadMutation = useMarkNotificationUnreadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const notifications = notificationsQuery.data?.notifications ?? [];
  const pagination = notificationsQuery.data?.pagination;
  const unreadCount = unreadCountQuery.data?.count ?? 0;
  const filteredNotifications = React.useMemo(
    () =>
      notifications.filter((notification) =>
        notificationMatchesFilters(
          notification,
          search,
          categoryFilter,
          statusFilter,
        ),
      ),
    [categoryFilter, notifications, search, statusFilter],
  );
  const selectedNotification =
    filteredNotifications.find(
      (notification) => notification.id === selectedNotificationId,
    ) ??
    filteredNotifications[0] ??
    null;

  React.useEffect(() => {
    if (
      selectedNotificationId &&
      filteredNotifications.some(
        (notification) => notification.id === selectedNotificationId,
      )
    ) {
      return;
    }

    setSelectedNotificationId(filteredNotifications[0]?.id ?? null);
  }, [filteredNotifications, selectedNotificationId]);

  async function toggleRead(notification: AppNotification) {
    try {
      if (notification.isRead) {
        await markUnreadMutation.mutateAsync(notification.id);
      } else {
        await markReadMutation.mutateAsync(notification.id);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update notification"));
    }
  }

  async function markRead(notification: AppNotification) {
    if (notification.isRead) {
      return;
    }

    try {
      await markReadMutation.mutateAsync(notification.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update notification"));
    }
  }

  async function markAllRead() {
    try {
      await markAllReadMutation.mutateAsync();
      toast.success("Notifications marked as read");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update notifications"));
    }
  }

  function handleCategoryChange(value: string) {
    if (!value) {
      return;
    }

    setCategoryFilter(value as NotificationCategoryFilter);
    setSelectedNotificationId(null);
  }

  const overdueCount = notifications.filter((notification) =>
    isOverdueNotification(notification.type),
  ).length;
  const dueTodayCount = notifications.filter((notification) =>
    isDueTodayNotification(notification.type),
  ).length;
  const systemCount = notifications.filter(
    (notification) => getNotificationCategory(notification.type) === "System",
  ).length;
  const groupedNotifications = groupNotifications(filteredNotifications);

  return (
    <AuthenticatedAppShell
      title="Notifications"
      breadcrumbs={[{ label: "Notifications" }]}
    >
      <main className="flex flex-1 flex-col gap-5 bg-background p-4 md:p-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground">
              Review reminders, assignments, and system updates that need
              attention.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 border-blue-600 px-5 font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              disabled={!unreadCount || markAllReadMutation.isPending}
              onClick={() => void markAllRead()}
            >
              Mark all as read
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Refresh notifications"
              disabled={notificationsQuery.isFetching}
              onClick={() => void notificationsQuery.refetch()}
            >
              <RefreshCcwIcon
                className={notificationsQuery.isFetching ? "animate-spin" : ""}
              />
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <NotificationSummaryCard
            title="Unread"
            value={unreadCount}
            caption="Need review"
            icon={BellIcon}
            tone="blue"
          />
          <NotificationSummaryCard
            title="Overdue"
            value={overdueCount}
            caption="Follow-ups past due"
            icon={CircleAlertIcon}
            tone="red"
          />
          <NotificationSummaryCard
            title="Due Today"
            value={dueTodayCount}
            caption="Scheduled for today"
            icon={Clock3Icon}
            tone="amber"
          />
          <NotificationSummaryCard
            title="System Updates"
            value={systemCount}
            caption="Recent changes"
            icon={InfoIcon}
            tone="gray"
          />
        </section>

        <Card className="rounded-lg border-border/80 p-0 shadow-xs">
          <CardContent className="p-0">
            <div className="grid gap-3 border-b p-3 xl:grid-cols-[minmax(260px,1fr)_minmax(360px,1.5fr)_200px_190px]">
              <div className="relative min-w-0">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search notifications"
                  className="h-11 pl-9"
                />
              </div>
              <ToggleGroup
                type="single"
                value={categoryFilter}
                onValueChange={handleCategoryChange}
                className="h-11 justify-start overflow-x-auto rounded-md border bg-background p-0"
              >
                {CATEGORY_FILTERS.map((filter) => (
                  <ToggleGroupItem
                    key={filter.value}
                    value={filter.value}
                    className="h-10 shrink-0 rounded-sm px-4 text-sm data-[state=on]:border data-[state=on]:border-blue-600 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-700"
                  >
                    {filter.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-11">
                  <CalendarIcon data-icon="inline-start" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {notificationsQuery.isPending ? (
              <NotificationsPageSkeleton />
            ) : notificationsQuery.error ? (
              <div className="p-5">
                <ApiErrorAlert
                  title="Unable to load notifications"
                  message={getApiErrorMessage(notificationsQuery.error, "")}
                />
              </div>
            ) : notifications.length ? (
              <div className="grid min-h-[520px] gap-0 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)]">
                <NotificationGroupedList
                  groupedNotifications={groupedNotifications}
                  selectedNotificationId={selectedNotification?.id ?? null}
                  onSelect={setSelectedNotificationId}
                  onToggleRead={toggleRead}
                />
                <NotificationDetailPanel
                  notification={selectedNotification}
                  onMarkRead={markRead}
                  onDismiss={markRead}
                  pending={markReadMutation.isPending}
                />
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No notifications found"
                  description="Active reminders will appear here as due dates approach."
                />
              </div>
            )}

            {pagination &&
            !notificationsQuery.isPending &&
            !notificationsQuery.error ? (
              <div className="border-t">
                <ListPagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  itemLabel="notifications"
                  onPageChange={setPage}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </AuthenticatedAppShell>
  );
}

function NotificationSummaryCard({
  title,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  caption: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: NotificationTone;
}) {
  return (
    <Card className="rounded-lg border-border/80 p-0 shadow-xs">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex size-16 shrink-0 items-center justify-center rounded-full",
            getNotificationToneIconClassName(tone),
          )}
        >
          <Icon className="size-8" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted-foreground">{title}</p>
          <p className="mt-1 text-4xl font-semibold leading-none tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{caption}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationGroupedList({
  groupedNotifications,
  selectedNotificationId,
  onSelect,
  onToggleRead,
}: {
  groupedNotifications: Array<{
    label: string;
    notifications: AppNotification[];
  }>;
  selectedNotificationId: string | null;
  onSelect: (id: string) => void;
  onToggleRead: (notification: AppNotification) => void;
}) {
  if (!groupedNotifications.length) {
    return (
      <div className="border-r p-6">
        <EmptyState
          title="No matching notifications"
          description="Try another search, category, or status filter."
        />
      </div>
    );
  }

  return (
    <div className="min-w-0 border-r">
      {groupedNotifications.map((group) => (
        <div key={group.label}>
          <div className="border-b bg-muted/25 px-4 py-2 text-sm font-semibold text-muted-foreground">
            {group.label}
          </div>
          <div>
            {group.notifications.map((notification) => (
              <NotificationListRow
                key={notification.id}
                notification={notification}
                selected={notification.id === selectedNotificationId}
                onSelect={() => onSelect(notification.id)}
                onToggleRead={() => void onToggleRead(notification)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationListRow({
  notification,
  selected,
  onSelect,
  onToggleRead,
}: {
  notification: AppNotification;
  selected: boolean;
  onSelect: () => void;
  onToggleRead: () => void;
}) {
  const category = getNotificationCategory(notification.type);
  const tone = getNotificationTone(notification.type);

  return (
    <div
      className={cn(
        "grid cursor-pointer grid-cols-[56px_minmax(0,1fr)_auto] gap-3 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/30",
        !notification.isRead && "bg-blue-50/45 dark:bg-blue-950/15",
        selected &&
          "border-l-2 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/25",
      )}
      onClick={onSelect}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          getNotificationToneIconClassName(tone),
        )}
      >
        {renderNotificationIcon(notification.type, "size-6")}
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <p className="truncate text-sm font-semibold text-foreground">
            {notification.title}
          </p>
          <p className="shrink-0 text-xs text-muted-foreground">
            {formatNotificationRelativeTime(notification.createdAt)}
          </p>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere]">
          {notification.message}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <NotificationCategoryBadge category={category} tone={tone} />
          <button
            type="button"
            aria-label={
              notification.isRead
                ? "Mark notification unread"
                : "Mark notification read"
            }
            className="flex size-5 items-center justify-center rounded-full"
            onClick={(event) => {
              event.stopPropagation();
              onToggleRead();
            }}
          >
            <span
              className={cn(
                "size-2.5 rounded-full transition-colors",
                notification.isRead
                  ? "bg-transparent hover:bg-muted-foreground/30"
                  : "bg-blue-600",
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationDetailPanel({
  notification,
  onMarkRead,
  onDismiss,
  pending,
}: {
  notification: AppNotification | null;
  onMarkRead: (notification: AppNotification) => void;
  onDismiss: (notification: AppNotification) => void;
  pending: boolean;
}) {
  if (!notification) {
    return (
      <div className="p-6">
        <EmptyState
          title="Select a notification"
          description="Notification details and actions will appear here."
        />
      </div>
    );
  }

  const tone = getNotificationTone(notification.type);
  const category = getNotificationCategory(notification.type);
  const details = getNotificationDetails(notification);

  return (
    <aside className="min-w-0 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-5">
          <div
            className={cn(
              "flex size-16 shrink-0 items-center justify-center rounded-full",
              getNotificationToneIconClassName(tone),
            )}
          >
            {renderNotificationIcon(notification.type, "size-8")}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {notification.title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium",
                  notification.isRead
                    ? "border-border bg-muted/30 text-muted-foreground"
                    : "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
                )}
              >
                {notification.isRead ? "Read" : "Unread"}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {format(new Date(notification.createdAt), "MMM d, h:mm a")}
              </p>
            </div>
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="More">
          <MoreVerticalIcon />
        </Button>
      </div>

      <div className="mt-8 border-t pt-5">
        <div className="grid gap-5">
          <NotificationDetailRow
            icon={UserRoundIcon}
            label="Related person"
            value={details.person}
          />
          <NotificationDetailRow
            icon={CarFrontIcon}
            label="Related record"
            value={details.record}
          />
          <NotificationDetailRow
            icon={Clock3Icon}
            label="Due time"
            value={details.dueTime}
            valueClassName={
              isOverdueNotification(notification.type)
                ? "text-red-600"
                : undefined
            }
          />
          <NotificationDetailRow
            icon={UserRoundIcon}
            label="Assigned to"
            value={details.assignee}
          />
        </div>
      </div>

      <div className="mt-8 border-t pt-5">
        <h3 className="text-sm font-semibold text-foreground">Message</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">
          {getDetailMessage(notification, category)}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        {notification.actionUrl ? (
          <Button
            asChild
            className="h-11 bg-blue-600 px-5 text-white hover:bg-blue-700"
          >
            <Link href={notification.actionUrl}>
              {getOpenActionLabel(category)}
              <ExternalLinkIcon />
            </Link>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="h-11 px-5"
          disabled={notification.isRead || pending}
          onClick={() => onMarkRead(notification)}
        >
          Mark as read
          <CheckCheckIcon />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 px-5"
          disabled={pending}
          onClick={() => onDismiss(notification)}
        >
          Dismiss
          <Trash2Icon />
        </Button>
      </div>
    </aside>
  );
}

function NotificationDetailRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[28px_130px_minmax(0,1fr)] items-start gap-4 text-sm">
      <Icon className="mt-0.5 size-5 text-muted-foreground" />
      <p className="text-muted-foreground">{label}</p>
      <p
        className={cn(
          "font-semibold text-foreground [overflow-wrap:anywhere]",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function NotificationsPageSkeleton() {
  return (
    <div className="grid min-h-[520px] xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)]">
      <div className="border-r">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 border-b px-4 py-4"
          >
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
      <div className="p-6">
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="mt-5 h-8 w-64" />
        <Skeleton className="mt-8 h-40 w-full" />
        <Skeleton className="mt-8 h-24 w-full" />
      </div>
    </div>
  );
}

function NotificationCategoryBadge({
  category,
  tone,
}: {
  category: string;
  tone: NotificationTone;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2.5 py-0.5 text-xs font-medium",
        getNotificationToneBadgeClassName(tone),
      )}
    >
      {category}
    </Badge>
  );
}

function renderNotificationIcon(type: NotificationType, className: string) {
  switch (type) {
    case "expense_overdue":
    case "follow_up_overdue":
      return <CircleAlertIcon className={className} />;
    case "expense_due_today":
      return <ReceiptTextIcon className={className} />;
    case "follow_up_due_today":
      return <Clock3Icon className={className} />;
    case "expense_due_soon":
      return <BellIcon className={className} />;
    case "follow_up_due_soon":
      return <CalendarClockIcon className={className} />;
  }
}

function getNotificationTone(type: NotificationType): NotificationTone {
  switch (type) {
    case "expense_overdue":
    case "follow_up_overdue":
      return "red";
    case "expense_due_today":
    case "expense_due_soon":
      return "amber";
    case "follow_up_due_today":
    case "follow_up_due_soon":
      return "blue";
  }
}

function getNotificationToneIconClassName(tone: NotificationTone) {
  return {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
    red: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300",
    amber:
      "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
    green:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
    gray: "bg-muted text-muted-foreground",
  }[tone];
}

function getNotificationToneBadgeClassName(tone: NotificationTone) {
  return {
    blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
    red: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
    amber:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    green:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    gray: "border-border bg-muted/40 text-muted-foreground",
  }[tone];
}

function getNotificationCategory(type: NotificationType): string {
  if (type.startsWith("expense")) return "Bills";
  if (type.startsWith("follow_up")) return "Follow-up";
  return "System";
}

function notificationMatchesFilters(
  notification: AppNotification,
  search: string,
  categoryFilter: NotificationCategoryFilter,
  statusFilter: string,
) {
  const normalizedSearch = search.trim().toLowerCase();
  const category = getNotificationCategory(notification.type);

  if (normalizedSearch) {
    const haystack =
      `${notification.title} ${notification.message}`.toLowerCase();
    if (!haystack.includes(normalizedSearch)) {
      return false;
    }
  }

  if (categoryFilter === "unread" && notification.isRead) return false;
  if (categoryFilter === "follow-ups" && category !== "Follow-up") return false;
  if (categoryFilter === "bills" && category !== "Bills") return false;
  if (categoryFilter === "sales" && category !== "Sales") return false;
  if (categoryFilter === "system" && category !== "System") return false;
  if (statusFilter === "unread" && notification.isRead) return false;
  if (statusFilter === "read" && !notification.isRead) return false;

  return true;
}

function groupNotifications(notifications: AppNotification[]) {
  const groups = [
    { label: "Today", notifications: [] as AppNotification[] },
    { label: "Yesterday", notifications: [] as AppNotification[] },
    { label: "Earlier", notifications: [] as AppNotification[] },
  ];

  for (const notification of notifications) {
    const createdAt = new Date(notification.createdAt);
    if (isToday(createdAt)) groups[0].notifications.push(notification);
    else if (isYesterday(createdAt)) groups[1].notifications.push(notification);
    else groups[2].notifications.push(notification);
  }

  return groups.filter((group) => group.notifications.length);
}

function isOverdueNotification(type: NotificationType) {
  return type.endsWith("overdue");
}

function isDueTodayNotification(type: NotificationType) {
  return type.endsWith("due_today");
}

function formatNotificationRelativeTime(createdAt: string) {
  return `${formatDistanceToNow(new Date(createdAt), { addSuffix: false })} ago`;
}

function getNotificationDetails(notification: AppNotification) {
  const [personCandidate, restCandidate] = notification.message.split(" - ");
  const recordCandidate = restCandidate
    ?.replace(/ had .*/i, "")
    .replace(/ is .*/i, "")
    .replace(/ was .*/i, "")
    .trim();
  const dueTime = notification.dueDateSnapshot
    ? format(new Date(notification.dueDateSnapshot), "MMM d, yyyy h:mm a")
    : isOverdueNotification(notification.type)
      ? "Past due"
      : "Not scheduled";

  return {
    person: personCandidate?.trim() || "Not specified",
    record: recordCandidate || notification.entityType.replaceAll("_", " "),
    dueTime,
    assignee: "Assigned staff",
  };
}

function getDetailMessage(notification: AppNotification, category: string) {
  if (isOverdueNotification(notification.type)) {
    return "This reminder is overdue. Open the related workflow and record the outcome once completed.";
  }

  if (isDueTodayNotification(notification.type)) {
    return "This reminder is scheduled for today. Review it and complete the next action on time.";
  }

  return `${category} notification: ${notification.message}`;
}

function getOpenActionLabel(category: string) {
  if (category === "Follow-up") return "Open follow-up";
  if (category === "Bills") return "Open bill";
  return "Open record";
}
