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
import { toast } from "@/components/ui/sileo";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { EmptyState } from "@/components/operations/empty-state";
import { ListPagination } from "@/components/operations/list-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import type {
  AppNotification,
  NotificationListFilters,
  NotificationType,
} from "@/types/notifications";

const DEFAULT_PAGE_SIZE = 10;
const ALL_VALUE = "all";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

type NotificationCategoryFilter =
  "all" | "unread" | "follow-ups" | "sales" | "bills" | "system";

type NotificationTone = "blue" | "red" | "amber" | "green" | "gray";
type NotificationStatusFilter = NonNullable<NotificationListFilters["status"]>;
type NotificationDateRangeFilter = NonNullable<
  NotificationListFilters["dateRange"]
>;

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
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] =
    React.useState<NotificationCategoryFilter>("all");
  const [statusFilter, setStatusFilter] =
    React.useState<NotificationStatusFilter>("all");
  const [dateFilter, setDateFilter] =
    React.useState<NotificationDateRangeFilter>("30");
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [selectedNotificationId, setSelectedNotificationId] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const notificationFilters = React.useMemo<NotificationListFilters>(
    () => ({
      page,
      pageSize,
      search: debouncedSearch || undefined,
      category: categoryFilter === "unread" ? "all" : categoryFilter,
      status: categoryFilter === "unread" ? "unread" : statusFilter,
      dateRange: dateFilter,
    }),
    [categoryFilter, dateFilter, debouncedSearch, page, pageSize, statusFilter],
  );

  const notificationsQuery = useNotificationsQuery(notificationFilters);
  const unreadCountQuery = useNotificationUnreadCountQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markUnreadMutation = useMarkNotificationUnreadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const notificationRows = notificationsQuery.data?.notifications;
  const notifications = React.useMemo(
    () => notificationRows ?? [],
    [notificationRows],
  );
  const pagination = notificationsQuery.data?.pagination;
  const unreadCount = unreadCountQuery.data?.count ?? 0;
  const selectedNotification =
    notifications.find(
      (notification) => notification.id === selectedNotificationId,
    ) ??
    notifications[0] ??
    null;

  async function toggleRead(notification: AppNotification) {
    try {
      if (notification.isRead) {
        await markUnreadMutation.mutateAsync(notification.id);
      } else {
        await markReadMutation.mutateAsync(notification.id);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update notification"), {
        details: `The notification "${notification.title}" could not be marked ${notification.isRead ? "unread" : "read"}.`,
      });
    }
  }

  async function markRead(notification: AppNotification) {
    if (notification.isRead) {
      return;
    }

    try {
      await markReadMutation.mutateAsync(notification.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update notification"), {
        details: `The notification "${notification.title}" could not be marked read.`,
      });
    }
  }

  async function markAllRead() {
    try {
      await markAllReadMutation.mutateAsync();
      toast.success("Notifications marked as read", {
        details: `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"} were cleared.`,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update notifications"), {
        details:
          "The unread notification queue could not be cleared. Try again from the notifications screen.",
      });
    }
  }

  function handleCategoryChange(value: string) {
    if (!value) {
      return;
    }

    setCategoryFilter(value as NotificationCategoryFilter);
    setPage(1);
    setSelectedNotificationId(null);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value as NotificationStatusFilter);
    setPage(1);
    setSelectedNotificationId(null);
  }

  function handleDateFilterChange(value: string) {
    setDateFilter(value as NotificationDateRangeFilter);
    setPage(1);
    setSelectedNotificationId(null);
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value));
    setPage(1);
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
  const groupedNotifications = groupNotifications(notifications);

  return (
    <AuthenticatedAppShell
      title="Notifications"
      breadcrumbs={[{ label: "Notifications" }]}
    >
      <main className="flex flex-1 flex-col gap-6 bg-background p-4 md:p-6">
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

        <Card>
          <CardHeader className="border-b">
            <div className="grid gap-3 xl:grid-cols-[minmax(240px,1fr)_minmax(360px,1.4fr)_180px_170px_150px]">
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
                variant="outline"
                spacing={0}
                value={categoryFilter}
                onValueChange={handleCategoryChange}
                className="max-w-full justify-start overflow-x-auto"
              >
                {CATEGORY_FILTERS.map((filter) => (
                  <ToggleGroupItem
                    key={filter.value}
                    value={filter.value}
                    className="shrink-0 px-4"
                  >
                    {filter.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                <SelectTrigger className="h-11">
                  <CalendarIcon data-icon="inline-start" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={ALL_VALUE}>All time</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option} per page
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
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
          </CardContent>
          {pagination &&
          !notificationsQuery.isPending &&
          !notificationsQuery.error ? (
            <CardFooter className="p-0">
              <ListPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                itemLabel="notifications"
                onPageChange={setPage}
              />
            </CardFooter>
          ) : null}
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
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{caption}</CardDescription>
        <CardAction>
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              getNotificationToneIconClassName(tone),
            )}
          >
            <Icon className="size-5" />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
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
    <ScrollArea className="min-w-0 border-r">
      {groupedNotifications.map((group) => (
        <div key={group.label}>
          <div className="border-b bg-muted/30 px-4 py-2 text-sm font-medium text-muted-foreground">
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
    </ScrollArea>
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
      role="button"
      tabIndex={0}
      className={cn(
        "grid w-full cursor-pointer grid-cols-[48px_minmax(0,1fr)] gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        selected && "bg-muted",
        !notification.isRead && !selected && "bg-muted/30",
      )}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-full",
          getNotificationToneIconClassName(tone),
        )}
      >
        {renderNotificationIcon(notification.type, "size-5")}
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <p className="truncate text-sm font-medium text-foreground">
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
            className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-background"
            onClick={(event) => {
              event.stopPropagation();
              onToggleRead();
            }}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                notification.isRead ? "bg-muted-foreground/30" : "bg-primary",
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
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full",
              getNotificationToneIconClassName(tone),
            )}
          >
            {renderNotificationIcon(notification.type, "size-6")}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {notification.title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Badge variant={notification.isRead ? "secondary" : "default"}>
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

      <Separator className="my-6" />

      <div>
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
                ? "text-destructive"
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

      <Separator className="my-6" />

      <div>
        <h3 className="text-sm font-semibold text-foreground">Message</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">
          {getDetailMessage(notification, category)}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        {notification.actionUrl ? (
          <Button asChild>
            <Link href={notification.actionUrl}>
              {getOpenActionLabel(category)}
              <ExternalLinkIcon data-icon="inline-end" />
            </Link>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          disabled={notification.isRead || pending}
          onClick={() => onMarkRead(notification)}
        >
          Mark as read
          <CheckCheckIcon data-icon="inline-end" />
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => onDismiss(notification)}
        >
          Dismiss
          <Trash2Icon data-icon="inline-end" />
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
    <Badge variant={tone === "red" ? "destructive" : "secondary"}>
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
    case "vehicle_available":
      return <CarFrontIcon className={className} />;
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
    case "vehicle_available":
      return "gray";
  }
}

function getNotificationToneIconClassName(tone: NotificationTone) {
  return {
    blue: "bg-primary/10 text-primary",
    red: "bg-destructive/10 text-destructive",
    amber: "bg-muted text-muted-foreground",
    green: "bg-muted text-muted-foreground",
    gray: "bg-muted text-muted-foreground",
  }[tone];
}

function getNotificationCategory(type: NotificationType): string {
  if (type.startsWith("expense")) return "Bills";
  if (type.startsWith("follow_up")) return "Follow-up";
  if (type.startsWith("vehicle")) return "Vehicle";
  return "System";
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
    person:
      notification.entityType === "vehicle"
        ? "All users"
        : personCandidate?.trim() || "Not specified",
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

  if (notification.type === "vehicle_available") {
    return "This inventory update was sent to all users because the vehicle is now available for buyer matching and sales activity.";
  }

  return `${category} notification: ${notification.message}`;
}

function getOpenActionLabel(category: string) {
  if (category === "Follow-up") return "Open follow-up";
  if (category === "Bills") return "Open bill";
  if (category === "Vehicle") return "Open vehicle";
  return "Open record";
}
