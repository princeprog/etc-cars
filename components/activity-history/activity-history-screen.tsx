"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  CalendarDaysIcon,
  CarIcon,
  DownloadIcon,
  FileTextIcon,
  HistoryIcon,
  ImageIcon,
  ListChecksIcon,
  LockIcon,
  MoreVerticalIcon,
  RefreshCcwIcon,
  SearchIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TagIcon,
  Trash2Icon,
  UserIcon,
  UsersIcon,
} from "lucide-react"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { ListPagination } from "@/components/operations/list-pagination"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useActivityHistorySummaryQuery } from "@/hooks/queries/activity-history/use-activity-history-summary-query"
import { useAllActivityHistoryQuery } from "@/hooks/queries/activity-history/use-all-activity-history-query"
import { exportActivityHistory } from "@/services/activity-history.service"
import { getApiErrorMessage } from "@/types/api"
import type { ActivityHistoryEvent } from "@/types/activity-history"
import type { ActivityHistoryDateRange, ActivityHistoryListFilters } from "@/types/activity-history-page"

const ACTIVITY_HISTORY_PAGE_SIZE = 10

const DATE_RANGE_OPTIONS: Array<{ value: ActivityHistoryDateRange; label: string }> = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
]

const MODULE_OPTIONS = [
  { value: "all", label: "All Modules" },
  { value: "vehicle", label: "Vehicle" },
  { value: "sale", label: "Sales" },
  { value: "buyer_lead", label: "Buyer Lead" },
  { value: "seller_lead", label: "Seller Lead" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "expense", label: "Expenses" },
  { value: "expense_category", label: "Expense Categories" },
  { value: "expense_recurring_rule", label: "Recurring Expenses" },
  { value: "user", label: "System" },
]

type ActivitySeverity = "success" | "warning" | "danger" | "info"

function getActionLabel(actionType: string) {
  return actionType
    .split(".")
    .at(-1)
    ?.replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? actionType
}

function getModuleLabel(entityType: string) {
  return MODULE_OPTIONS.find((option) => option.value === entityType)?.label ?? entityType.replaceAll("_", " ")
}

function getActivitySeverity(actionType: string): ActivitySeverity {
  const normalized = actionType.toLowerCase()

  if (/(delete|remove|fail|error|void|cancel)/.test(normalized)) {
    return "danger"
  }

  if (/(status|review|warning|eligibility|requirement)/.test(normalized)) {
    return "warning"
  }

  if (/(login|logout|auth|system|permission)/.test(normalized)) {
    return "info"
  }

  return "success"
}

function getModuleIcon(entityType: string) {
  switch (entityType) {
    case "vehicle":
      return CarIcon
    case "sale":
      return ShoppingCartIcon
    case "buyer_lead":
    case "seller_lead":
      return UserIcon
    case "follow_up":
      return CalendarDaysIcon
    case "expense":
      return ShoppingCartIcon
    case "expense_category":
      return TagIcon
    case "expense_recurring_rule":
      return RefreshCcwIcon
    case "user":
      return ShieldCheckIcon
    default:
      return HistoryIcon
  }
}

function getActionIcon(actionType: string) {
  const normalized = actionType.toLowerCase()

  if (normalized.includes("delete") || normalized.includes("remove")) {
    return Trash2Icon
  }

  if (normalized.includes("photo") || normalized.includes("upload")) {
    return ImageIcon
  }

  if (normalized.includes("pricing") || normalized.includes("cost")) {
    return TagIcon
  }

  if (normalized.includes("sale") || normalized.includes("final")) {
    return ShoppingCartIcon
  }

  if (normalized.includes("login") || normalized.includes("permission")) {
    return LockIcon
  }

  return FileTextIcon
}

function getModuleBadgeClassName(entityType: string) {
  switch (entityType) {
    case "vehicle":
      return "border-blue-200 bg-blue-50 text-blue-700"
    case "sale":
      return "border-violet-200 bg-violet-50 text-violet-700"
    case "buyer_lead":
    case "seller_lead":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "follow_up":
      return "border-cyan-200 bg-cyan-50 text-cyan-700"
    case "expense":
      return "border-rose-200 bg-rose-50 text-rose-700"
    case "expense_category":
      return "border-indigo-200 bg-indigo-50 text-indigo-700"
    case "expense_recurring_rule":
      return "border-teal-200 bg-teal-50 text-teal-700"
    case "user":
      return "border-slate-200 bg-slate-100 text-slate-700"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

function getIconFrameClassName(entityType: string, severity: ActivitySeverity) {
  if (severity === "danger") {
    return "bg-red-50 text-red-600"
  }

  switch (entityType) {
    case "vehicle":
      return "bg-blue-50 text-blue-600"
    case "sale":
      return "bg-violet-50 text-violet-600"
    case "buyer_lead":
    case "seller_lead":
      return "bg-amber-50 text-amber-600"
    case "follow_up":
      return "bg-cyan-50 text-cyan-600"
    case "expense":
      return "bg-rose-50 text-rose-600"
    case "expense_category":
      return "bg-indigo-50 text-indigo-600"
    case "expense_recurring_rule":
      return "bg-teal-50 text-teal-600"
    case "user":
      return "bg-slate-100 text-slate-600"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getSeverityBadgeClassName(severity: ActivitySeverity) {
  switch (severity) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "danger":
      return "border-red-200 bg-red-50 text-red-700"
    case "info":
    default:
      return "border-blue-200 bg-blue-50 text-blue-700"
  }
}

function getSeverityLabel(severity: ActivitySeverity) {
  switch (severity) {
    case "danger":
      return "Danger"
    case "warning":
      return "Warning"
    case "info":
      return "Info"
    case "success":
    default:
      return "Success"
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? "S"
  const last = parts.length > 1 ? parts.at(-1)?.[0] : ""

  return `${first}${last ?? ""}`.toUpperCase()
}

function formatDateTime(timestamp: string) {
  return format(new Date(timestamp), "MMM d, yyyy hh:mm a")
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function ActivityHistoryScreen() {
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [actionType, setActionType] = React.useState("all")
  const [entityType, setEntityType] = React.useState("all")
  const [actor, setActor] = React.useState("all")
  const [dateRange, setDateRange] = React.useState<ActivityHistoryDateRange>("all")
  const [selectedEvent, setSelectedEvent] = React.useState<ActivityHistoryEvent | null>(null)
  const [exportError, setExportError] = React.useState<string | null>(null)
  const [isExporting, setIsExporting] = React.useState(false)

  const filterValues = React.useMemo<ActivityHistoryListFilters>(
    () => ({
      search: search.trim() || undefined,
      actionType,
      entityType,
      actor,
      dateRange,
    }),
    [actor, actionType, dateRange, entityType, search],
  )
  const listFilters = React.useMemo<ActivityHistoryListFilters>(
    () => ({
      ...filterValues,
      page,
      pageSize: ACTIVITY_HISTORY_PAGE_SIZE,
    }),
    [filterValues, page],
  )
  const summaryFilters = React.useMemo<ActivityHistoryListFilters>(
    () => filterValues,
    [filterValues],
  )

  const activityQuery = useAllActivityHistoryQuery(listFilters)
  const summaryQuery = useActivityHistorySummaryQuery(summaryFilters)
  const events = activityQuery.data?.events ?? []
  const total = activityQuery.data?.total ?? 0
  const totalPages = activityQuery.data?.totalPages ?? 1
  const isLoading = activityQuery.isPending

  const resetFilters = () => {
    setSearch("")
    setActionType("all")
    setEntityType("all")
    setActor("all")
    setDateRange("all")
    setPage(1)
  }

  const updateSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const updateActionType = (value: string) => {
    setActionType(value)
    setPage(1)
  }

  const updateEntityType = (value: string) => {
    setEntityType(value)
    setPage(1)
  }

  const updateActor = (value: string) => {
    setActor(value)
    setPage(1)
  }

  const updateDateRange = (value: ActivityHistoryDateRange) => {
    setDateRange(value)
    setPage(1)
  }

  const refresh = () => {
    void activityQuery.refetch()
    void summaryQuery.refetch()
  }

  const handleExport = async () => {
    try {
      setExportError(null)
      setIsExporting(true)
      const exportResult = await exportActivityHistory(summaryFilters)
      downloadCsv(exportResult.filename, exportResult.csv)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Unable to export activity logs")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AuthenticatedAppShell title="Activity History">
      <div className="flex flex-1 flex-col gap-5 bg-background p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>Dashboard</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Activity History</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Activity History</h1>
              <p className="max-w-4xl text-sm text-muted-foreground">
                Monitor user actions, inventory updates, sales events, lead changes, and system activity across the dealership.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={handleExport} disabled={isExporting}>
              <DownloadIcon data-icon className="size-4" />
              {isExporting ? "Exporting" : "Export Logs"}
            </Button>
            <Button type="button" variant="outline" onClick={refresh}>
              <RefreshCcwIcon data-icon className="size-4" />
              Refresh
            </Button>
          </div>
        </div>

        {exportError ? (
          <ApiErrorAlert title="Unable to export logs" message={exportError} />
        ) : null}

        <Card className="py-0">
          <CardContent className="p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.8fr)_repeat(4,minmax(160px,1fr))_auto]">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => updateSearch(event.target.value)}
                  placeholder="Search activity, user, vehicle, lead, or record ID"
                  className="pl-9"
                />
              </div>

              <Select value={actionType} onValueChange={updateActionType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {(summaryQuery.data?.actionTypes ?? []).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {getActionLabel(option.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={entityType} onValueChange={updateEntityType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  {MODULE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={actor} onValueChange={updateActor}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {(summaryQuery.data?.actors ?? []).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={(value) => updateDateRange(value as ActivityHistoryDateRange)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="button" variant="outline" onClick={resetFilters}>
                <RefreshCcwIcon data-icon className="size-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <ActivitySummaryCard
            title="Total Activities"
            value={summaryQuery.data?.totalActivities}
            description="All time"
            icon={ListChecksIcon}
            tone="blue"
            isLoading={summaryQuery.isPending}
          />
          <ActivitySummaryCard
            title="Today's Events"
            value={summaryQuery.data?.todaysEvents}
            description={format(new Date(), "MMM d, yyyy")}
            icon={CalendarDaysIcon}
            tone="green"
            isLoading={summaryQuery.isPending}
          />
          <ActivitySummaryCard
            title="Vehicle Updates"
            value={summaryQuery.data?.vehicleUpdates}
            description="All time"
            icon={CarIcon}
            tone="purple"
            isLoading={summaryQuery.isPending}
          />
          <ActivitySummaryCard
            title="Sales Events"
            value={summaryQuery.data?.salesEvents}
            description="All time"
            icon={TagIcon}
            tone="orange"
            isLoading={summaryQuery.isPending}
          />
          <ActivitySummaryCard
            title="User Actions"
            value={summaryQuery.data?.userActions}
            description="All time"
            icon={UsersIcon}
            tone="blue"
            isLoading={summaryQuery.isPending}
          />
        </div>

        <Card className="overflow-hidden py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>Backend-filtered audit trail for dealership operations.</CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {activityQuery.error ? (
              <div className="p-4">
                <ApiErrorAlert
                  title="Unable to load activity history"
                  message={getApiErrorMessage(activityQuery.error, "")}
                />
              </div>
            ) : isLoading ? (
              <ActivityTableSkeleton />
            ) : events.length ? (
              <ActivityTable events={events} onViewDetails={setSelectedEvent} />
            ) : (
              <Empty className="border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HistoryIcon className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>No activity logs found</EmptyTitle>
                  <EmptyDescription>
                    Adjust the filters or reset them to view dealership activity.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>

          {!isLoading && !activityQuery.error && total > 0 ? (
            <ListPagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="activity logs"
              onPageChange={setPage}
            />
          ) : null}
        </Card>
      </div>

      <ActivityDetailsDialog event={selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)} />
    </AuthenticatedAppShell>
  )
}

function ActivitySummaryCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
  isLoading,
}: {
  title: string
  value?: number
  description: string
  icon: React.ComponentType<{ className?: string }>
  tone: "blue" | "green" | "purple" | "orange"
  isLoading: boolean
}) {
  const toneClassName = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
  }[tone]

  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex size-12 items-center justify-center rounded-full ${toneClassName}`}>
          <Icon className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {(value ?? 0).toLocaleString()}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityTable({
  events,
  onViewDetails,
}: {
  events: ActivityHistoryEvent[]
  onViewDetails: (event: ActivityHistoryEvent) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30">
          <TableHead className="px-4">Event</TableHead>
          <TableHead>Module</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead className="pr-4 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => {
          const severity = getActivitySeverity(event.actionType)
          const ModuleIcon = getModuleIcon(event.entityType)
          const ActionIcon = getActionIcon(event.actionType)
          const actorName = event.actorDisplayName ?? "System"

          return (
            <TableRow key={event.id}>
              <TableCell className="min-w-[320px] px-4 whitespace-normal">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${getIconFrameClassName(event.entityType, severity)}`}>
                    <ActionIcon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{getActionLabel(event.actionType)}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.summary}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`rounded-md ${getModuleBadgeClassName(event.entityType)}`}>
                  <ModuleIcon className="size-3.5" />
                  {getModuleLabel(event.entityType)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{getInitials(actorName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="max-w-[180px] truncate text-sm font-medium text-foreground">{actorName}</p>
                    <p className="text-xs text-muted-foreground">{actorName === "System" ? "System" : "Staff"}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-foreground">{format(new Date(event.timestamp), "MMM d, yyyy")}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(event.timestamp), "hh:mm a")}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`rounded-md ${getSeverityBadgeClassName(severity)}`}>
                  <span className="size-1.5 rounded-full bg-current" />
                  {getSeverityLabel(severity)}
                </Badge>
              </TableCell>
              <TableCell className="pr-4 text-right">
                <div className="inline-flex items-center gap-2">
                  <Button type="button" variant="link" className="h-auto px-0" onClick={() => onViewDetails(event)}>
                    View details
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="More activity actions">
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

function ActivityTableSkeleton() {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[minmax(280px,1.6fr)_120px_180px_150px_100px_120px]">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityDetailsDialog({
  event,
  onOpenChange,
}: {
  event: ActivityHistoryEvent | null
  onOpenChange: (open: boolean) => void
}) {
  if (!event) {
    return null
  }

  const severity = getActivitySeverity(event.actionType)
  const metadataEntries = Object.entries(event.metadata)

  return (
    <Dialog open={Boolean(event)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Activity Details</DialogTitle>
          <DialogDescription>{event.summary}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <DetailItem label="Module" value={getModuleLabel(event.entityType)} />
          <DetailItem label="Severity" value={getSeverityLabel(severity)} />
          <DetailItem label="Action Type" value={event.actionType} />
          <DetailItem label="Actor" value={event.actorDisplayName ?? "System"} />
          <DetailItem label="Entity ID" value={event.entityId} />
          <DetailItem label="Timestamp" value={formatDateTime(event.timestamp)} />
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
          {metadataEntries.length ? (
            <div className="rounded-lg border bg-muted/20 p-3">
              <pre className="max-h-64 overflow-auto text-xs leading-5 text-muted-foreground">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No additional metadata was recorded for this activity.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/15 p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
