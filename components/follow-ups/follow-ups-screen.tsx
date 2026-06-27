"use client"

import * as React from "react"
import { format, formatDistanceToNow, isPast, isToday } from "date-fns"
import type { DateRange } from "react-day-picker"
import {
  ArrowUpIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { SubmitButton } from "@/components/operations/submit-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-picker"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useCompleteFollowUpMutation } from "@/hooks/mutations/follow-ups/use-complete-follow-up-mutation"
import { useCreateFollowUpMutation } from "@/hooks/mutations/follow-ups/use-create-follow-up-mutation"
import { useUpdateFollowUpMutation } from "@/hooks/mutations/follow-ups/use-update-follow-up-mutation"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useBuyerLeadsQuery } from "@/hooks/queries/buyer-leads/use-buyer-leads-query"
import { useFollowUpsQuery } from "@/hooks/queries/follow-ups/use-follow-ups-query"
import { useFollowUpsSummaryQuery } from "@/hooks/queries/follow-ups/use-follow-ups-summary-query"
import { useSellerLeadsQuery } from "@/hooks/queries/seller-leads/use-seller-leads-query"
import { getApiErrorMessage } from "@/types/api"
import { ActivityHistoryPanel } from "../activity-history/activity-history-panel"
import {
  LEAD_TYPES,
  type FollowUp,
  type FollowUpListFilters,
  type FollowUpSort,
  type FollowUpSortKey,
  type FollowUpStatus,
  type FollowUpStatusFilter,
  type LeadType,
} from "@/types/follow-ups"

type FollowUpFormValues = {
  leadType: LeadType
  leadId: string
  dueAt: Date | undefined
  note: string
}

type StatusFilter = "all" | FollowUpStatus | "DueToday" | "Upcoming"
type LeadTypeFilter = "all" | LeadType
type AssigneeFilter = "all" | "mine"

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
const DEFAULT_PAGE_SIZE = 20

function getEmptyFollowUpFormValues(): FollowUpFormValues {
  return {
    leadType: "seller",
    leadId: "",
    dueAt: undefined,
    note: "",
  }
}

function getAssigneeLabel(assigneeUserId: string, currentUserId?: string) {
  if (assigneeUserId === currentUserId) {
    return "You"
  }
  return "Assigned"
}

function getFollowUpStatusBadgeClassName(status: FollowUpStatus) {
  switch (status) {
    case "Overdue":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
    case "Due":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
    case "Completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
    default:
      return ""
  }
}

function getLeadTypeBadgeClassName(type: LeadType) {
  return type === "seller"
    ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300"
    : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
}

function getQueueAccentClassName(status: FollowUpStatus) {
  switch (status) {
    case "Overdue":
      return "border-rose-500"
    case "Due":
      return "border-amber-500"
    case "Completed":
      return "border-emerald-500"
    default:
      return "border-border"
  }
}

function truncateText(value: string, length: number) {
  if (value.length <= length) {
    return value
  }
  return `${value.slice(0, length - 1)}…`
}

function toStartOfDayIso(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toISOString()
}

function SortableColumnHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  className,
}: {
  label: string
  sortKey: FollowUpSortKey
  currentSort: FollowUpSort
  onSort: (sort: FollowUpSort) => void
  className?: string
}) {
  const isAsc = currentSort === sortKey
  const isDesc = currentSort === (`-${sortKey}` as FollowUpSort)
  const isActive = isAsc || isDesc

  function handleClick() {
    if (!isActive || isDesc) {
      onSort(sortKey)
    } else {
      onSort(`-${sortKey}` as FollowUpSort)
    }
  }

  return (
    <TableHead className={`px-4 ${className ?? ""}`}>
      <button
        type="button"
        onClick={handleClick}
        className="group/sort inline-flex items-center gap-1 text-xs font-semibold text-foreground/80 transition-colors hover:text-foreground"
      >
        {label}
        <span
          className={`inline-flex size-4 items-center justify-center rounded transition-all duration-200 ease-out ${
            isActive
              ? "text-foreground"
              : "text-muted-foreground"
          }`}
        >
          <ArrowUpIcon
            className={`size-3 transition-transform duration-200 ease-out ${isDesc ? "rotate-180" : ""}`}
          />
        </span>
      </button>
    </TableHead>
  )
}

function FollowUpForm({
  values,
  onChange,
  leadOptions,
}: {
  values: FollowUpFormValues
  onChange: (values: FollowUpFormValues) => void
  leadOptions: { id: string; label: string }[]
}) {
  function updateField<K extends keyof FollowUpFormValues>(key: K, value: FollowUpFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <FieldGroup className="gap-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Follow-Up Details</h3>
          <p className="text-sm text-muted-foreground">
            Create an operational reminder tied to a buyer lead or seller lead.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="followUpLeadType">Lead type</FieldLabel>
            <Select value={values.leadType} onValueChange={(value) => updateField("leadType", value as LeadType)}>
              <SelectTrigger id="followUpLeadType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "seller" ? "Seller lead" : "Buyer lead"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="followUpLeadId">Lead</FieldLabel>
            <Select value={values.leadId} onValueChange={(value) => updateField("leadId", value)}>
              <SelectTrigger id="followUpLeadId">
                <SelectValue placeholder="Select a lead" />
              </SelectTrigger>
              <SelectContent>
                {leadOptions.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="followUpDueAt">Due at</FieldLabel>
          <DateTimePicker
            id="followUpDueAt"
            value={values.dueAt}
            onChange={(date) => updateField("dueAt", date)}
            minDate={new Date()}
            placeholder="Select due date & time"
          />
        </Field>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Work Note</h3>
          <p className="text-sm text-muted-foreground">
            Record the action needed so the next staff member can pick this up without ambiguity.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="followUpNote">Note</FieldLabel>
          <Textarea
            id="followUpNote"
            rows={6}
            value={values.note}
            onChange={(event) => updateField("note", event.target.value)}
            placeholder="Call seller about appraisal schedule and confirm if unit is still available for inspection."
            required
          />
        </Field>
      </section>
    </FieldGroup>
  )
}

export function FollowUpsScreen() {
  const authQuery = useAuthenticatedUserQuery()
  const sellerLeadsQuery = useSellerLeadsQuery({ page: 1, pageSize: 100 })
  const buyerLeadsQuery = useBuyerLeadsQuery({ page: 1, pageSize: 100 })
  const createMutation = useCreateFollowUpMutation()
  const completeMutation = useCompleteFollowUpMutation()
  const updateMutation = useUpdateFollowUpMutation()

  const [createOpen, setCreateOpen] = React.useState(false)
  const [createStep, setCreateStep] = React.useState<"form" | "confirm">("form")
  const [searchInput, setSearchInput] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [leadTypeFilter, setLeadTypeFilter] = React.useState<LeadTypeFilter>("all")
  const [assigneeFilter, setAssigneeFilter] = React.useState<AssigneeFilter>("all")
  const [dueDateRange, setDueDateRange] = React.useState<DateRange | undefined>(undefined)
  const [sort, setSort] = React.useState<FollowUpSort>("dueAt")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState<number>(DEFAULT_PAGE_SIZE)
  const [form, setForm] = React.useState<FollowUpFormValues>(getEmptyFollowUpFormValues)
  const [completeTarget, setCompleteTarget] = React.useState<FollowUp | null>(null)
  const [editTarget, setEditTarget] = React.useState<FollowUp | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = React.useState<FollowUp | null>(null)
  const [outcomeNotes, setOutcomeNotes] = React.useState<Record<string, string>>({})

  const currentUserId = authQuery.data?.user.id
  const canAssignToCurrentUser = Boolean(currentUserId) && !authQuery.isPending

  React.useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(handle)
  }, [searchInput])

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value)
    setPage(1)
  }
  const handleLeadTypeChange = (value: LeadTypeFilter) => {
    setLeadTypeFilter(value)
    setPage(1)
  }
  const handleAssigneeChange = (value: AssigneeFilter) => {
    setAssigneeFilter(value)
    setPage(1)
  }
  const handleDueDateRangeChange = (value: DateRange | undefined) => {
    setDueDateRange(value)
    setPage(1)
  }
  const handleSortChange = (value: FollowUpSort) => {
    setSort(value)
    setPage(1)
  }
  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setPage(1)
  }

  const assigneeScopeId = assigneeFilter === "mine" ? currentUserId : undefined

  const filters = React.useMemo<FollowUpListFilters>(() => {
    let apiStatus: FollowUpStatusFilter | undefined
    let filterDueFrom: string | undefined
    let filterDueTo: string | undefined

    if (statusFilter === "all") {
      apiStatus = undefined
    } else if (statusFilter === "DueToday") {
      apiStatus = "DueToday"
    } else if (statusFilter === "Upcoming") {
      apiStatus = "Due"
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const pad = (v: number) => String(v).padStart(2, "0")
      const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`
      filterDueFrom = toStartOfDayIso(tomorrowStr)
    } else {
      apiStatus = statusFilter
    }

    if (dueDateRange?.from && dueDateRange?.to) {
      const dFrom = new Date(dueDateRange.from)
      dFrom.setHours(0, 0, 0, 0)
      filterDueFrom = dFrom.toISOString()
      const dTo = new Date(dueDateRange.to)
      dTo.setHours(23, 59, 59, 999)
      filterDueTo = dTo.toISOString()
    }

    return {
      status: apiStatus,
      leadType: leadTypeFilter === "all" ? undefined : leadTypeFilter,
      assigneeUserId: assigneeScopeId,
      search: debouncedSearch.trim() || undefined,
      dueFrom: filterDueFrom,
      dueTo: filterDueTo,
      sort,
      page,
      pageSize,
    }
  }, [statusFilter, leadTypeFilter, assigneeScopeId, debouncedSearch, dueDateRange, sort, page, pageSize])

  const followUpsQuery = useFollowUpsQuery(filters)
  const summaryQuery = useFollowUpsSummaryQuery(assigneeScopeId)

  const followUps = React.useMemo(
    () => followUpsQuery.data?.followUps ?? [],
    [followUpsQuery.data?.followUps],
  )
  const paginationData = followUpsQuery.data
  const summary = summaryQuery.data?.summary

  const sellerLeads = React.useMemo(
    () => sellerLeadsQuery.data?.sellerLeads ?? [],
    [sellerLeadsQuery.data?.sellerLeads],
  )
  const buyerLeads = React.useMemo(
    () => buyerLeadsQuery.data?.buyerLeads ?? [],
    [buyerLeadsQuery.data?.buyerLeads],
  )

  const leadOptions =
    form.leadType === "seller"
      ? sellerLeads.map((lead) => ({ id: lead.id, label: `${lead.sellerName} • ${lead.vehicleBrand} ${lead.vehicleModel}` }))
      : buyerLeads.map((lead) => ({ id: lead.id, label: `${lead.buyerName} • ${lead.contactNumber}` }))

  const hasActiveFilters =
    statusFilter !== "all" ||
    leadTypeFilter !== "all" ||
    assigneeFilter !== "all" ||
    dueDateRange?.from !== undefined ||
    Boolean(searchInput)

  function resetFilters() {
    setSearchInput("")
    setStatusFilter("all")
    setLeadTypeFilter("all")
    setAssigneeFilter("all")
    setDueDateRange(undefined)
    setPage(1)
  }

  function handleCreateOpen() {
    setForm(getEmptyFollowUpFormValues())
    setCreateStep("form")
    setCreateOpen(true)
  }

  function handleCreateClose() {
    setCreateOpen(false)
    setCreateStep("form")
    setForm(getEmptyFollowUpFormValues())
  }

  function handleCreateFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateStep("confirm")
  }

  async function handleCreateConfirm() {
    if (!currentUserId) {
      toast.error("Your account is still loading. Please wait a moment and try again.")
      return
    }

    await createMutation.mutateAsync(
      {
        leadType: form.leadType,
        sellerLeadId: form.leadType === "seller" ? form.leadId : undefined,
        buyerLeadId: form.leadType === "buyer" ? form.leadId : undefined,
        assigneeUserId: currentUserId,
        dueAt: form.dueAt!.toISOString(),
        note: form.note,
      },
      {
        onSuccess: () => {
          toast.success("Follow-up created")
          handleCreateClose()
        },
      },
    )
  }

  function handleComplete(followUp: FollowUp) {
    completeMutation.mutate(
      {
        id: followUp.id,
        payload: {
          outcomeNote: outcomeNotes[followUp.id] ?? "",
        },
      },
      {
        onSuccess: () => {
          toast.success("Follow-up completed")
          setOutcomeNotes((current) => ({ ...current, [followUp.id]: "" }))
          setCompleteTarget(null)
        },
      },
    )
  }

  const summaryCards: {
    title: string
    value: number
    caption: string
    badge: string
  }[] = [
    {
      title: "Overdue",
      value: summary?.overdue ?? 0,
      caption: "Needs attention",
      badge: "Overdue",
    },
    {
      title: "Due Today",
      value: summary?.dueToday ?? 0,
      caption: "Action required",
      badge: "Today",
    },
    {
      title: "Upcoming",
      value: summary?.upcoming ?? 0,
      caption: "Next 7 days",
      badge: "Upcoming",
    },
    {
      title: "Completed",
      value: summary?.completed ?? 0,
      caption: "Closed tasks",
      badge: "Finalized",
    },
  ]

  const total = paginationData?.total ?? 0
  const pageCount = paginationData?.totalPages ?? 1
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <AuthenticatedAppShell title="Follow-Ups">
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">

        {/* Header */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-semibold tracking-tight">Follow-Ups</h2>
              <p className="text-sm text-muted-foreground">
                Track due tasks, overdue reminders, and completed follow-up activity across buyer and seller workflows.
              </p>
            </div>
            <Button onClick={handleCreateOpen} className="shrink-0">
              <PlusIcon />
              Add Follow-Up
            </Button>
          </div>

          {/* Summary Cards — display only, not clickable */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <Card
                key={card.title}
                className="border-border/70 py-0 shadow-xs"
              >
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <Badge
                      variant="outline"
                      className="rounded-sm px-1.5 py-0 text-[10px] font-medium text-muted-foreground"
                    >
                      {card.badge}
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold tracking-tight text-foreground">{card.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.caption}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Filters */}
        <section className="flex flex-col gap-2">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_1fr_1fr_1fr_auto]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search notes, outcomes, lead names..."
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => handleStatusChange(value as StatusFilter)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="DueToday">Due Today</SelectItem>
                <SelectItem value="Due">Due</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={leadTypeFilter} onValueChange={(value) => handleLeadTypeChange(value as LeadTypeFilter)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Lead type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="seller">Seller Lead</SelectItem>
                <SelectItem value="buyer">Buyer Lead</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={(value) => handleAssigneeChange(value as AssigneeFilter)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="mine">My Follow-Ups</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters} disabled={!hasActiveFilters} size="default">
              <RotateCcwIcon />
              Reset
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <Field>
              <FieldLabel htmlFor="followUpDueDateRange" className="text-xs text-muted-foreground">
                Due date range
              </FieldLabel>
              <DateRangePicker
                id="followUpDueDateRange"
                value={dueDateRange}
                onChange={handleDueDateRangeChange}
                placeholder="Filter by date range"
                className="w-[320px]"
              />
            </Field>
          </div>
        </section>

        {/* Table */}
        <Card className="overflow-hidden border-border/70 py-0 shadow-xs">
          <CardContent className="p-0">
            <ApiErrorAlert title="Follow-up action failed" message={getApiErrorMessage(completeMutation.error, "")} />
            {followUpsQuery.isPending ? (
              <div className="p-6">
                <ModuleLoadingState label="Loading follow-ups" />
              </div>
            ) : followUpsQuery.error ? (
              <div className="p-6">
                <ApiErrorAlert title="Unable to load follow-ups" message={getApiErrorMessage(followUpsQuery.error, "")} />
              </div>
            ) : followUps.length ? (
              <>
                <Table className="min-w-[1280px] border-collapse">
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <SortableColumnHeader label="Follow-Up" sortKey="note" currentSort={sort} onSort={handleSortChange} />
                      <SortableColumnHeader label="Lead Type" sortKey="leadType" currentSort={sort} onSort={handleSortChange} />
                      <SortableColumnHeader label="Lead / Contact" sortKey="leadName" currentSort={sort} onSort={handleSortChange} />
                      <SortableColumnHeader label="Due Date" sortKey="dueAt" currentSort={sort} onSort={handleSortChange} />
                      <SortableColumnHeader label="Status" sortKey="status" currentSort={sort} onSort={handleSortChange} />
                      <TableHead className="px-4 text-xs font-semibold text-foreground/80">Assignee</TableHead>
                      <TableHead className="px-4 text-xs font-semibold text-foreground/80">Outcome / Note Preview</TableHead>
                      <SortableColumnHeader label="Updated" sortKey="updatedAt" currentSort={sort} onSort={handleSortChange} />
                      <TableHead className="px-4 text-right text-xs font-semibold text-foreground/80">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {followUps.map((followUp) => {
                      const notePreview = followUp.outcomeNote || followUp.note
                      const isOverdue =
                        followUp.status === "Overdue" ||
                        (followUp.status === "Due" && isPast(new Date(followUp.dueAt)) && !isToday(new Date(followUp.dueAt)))

                      return (
                        <TableRow key={followUp.id} className="hover:bg-muted/15">
                          <TableCell className="px-4 py-3 align-top">
                            <div className={`space-y-1 border-l-2 pl-3 ${getQueueAccentClassName(followUp.status)}`}>
                              <p className="font-medium text-foreground">{truncateText(followUp.note, 36)}</p>
                              <p className="text-sm text-muted-foreground">
                                {followUp.leadType === "seller" ? "Seller workflow" : "Buyer workflow"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getLeadTypeBadgeClassName(followUp.leadType)}`}>
                              {followUp.leadType === "seller" ? "Seller Lead" : "Buyer Lead"}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">{followUp.leadName ?? "Lead not found"}</p>
                              <p className="text-sm text-muted-foreground">{followUp.leadSecondary ?? "No lead context available"}</p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <div className="space-y-1">
                              <p className={`text-sm font-medium ${isOverdue ? "text-rose-600 dark:text-rose-300" : "text-foreground"}`}>
                                {format(new Date(followUp.dueAt), "MMM d, yyyy")}
                              </p>
                              <p className={`text-xs ${isOverdue ? "text-rose-500 dark:text-rose-300" : "text-muted-foreground"}`}>
                                {format(new Date(followUp.dueAt), "h:mm a")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getFollowUpStatusBadgeClassName(followUp.status)}`}>
                              {followUp.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top text-sm text-foreground">{getAssigneeLabel(followUp.assigneeUserId, currentUserId)}</TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <p className="max-w-[280px] text-sm text-foreground">{truncateText(notePreview, 72)}</p>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                {formatDistanceToNow(new Date(followUp.updatedAt), { addSuffix: true })}
                              </p>
                              <p className="text-xs text-muted-foreground">{format(new Date(followUp.updatedAt), "MMM d, yyyy")}</p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" aria-label={`Actions for follow-up ${followUp.note}`}>
                                  <MoreHorizontalIcon />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel>Follow-up actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => {
                                    navigator.clipboard.writeText(followUp.note)
                                    toast.success("Follow-up note copied")
                                  }}
                                >
                                  <CalendarDaysIcon />
                                  Copy Note
                                </DropdownMenuItem>
                                {followUp.status !== "Completed" ? (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setEditTarget(followUp)}>
                                      <PencilIcon />
                                      Edit Note
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setRescheduleTarget(followUp)}>
                                      <CalendarClockIcon />
                                      Reschedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setCompleteTarget(followUp)} disabled={completeMutation.isPending}>
                                      <CheckIcon />
                                      Mark Complete
                                    </DropdownMenuItem>
                                  </>
                                ) : null}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{rangeStart}</span>–
                    <span className="font-medium text-foreground">{rangeEnd}</span> of{" "}
                    <span className="font-medium text-foreground">{total}</span>
                  </p>
                  <div className="flex items-center gap-4">
                    {total > 10 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows</span>
                        <Select value={String(pageSize)} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                          <SelectTrigger className="h-8 w-[72px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAGE_SIZE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={String(option)}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Page {page} of {pageCount}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Previous page"
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={page <= 1}
                      >
                        <ChevronLeftIcon />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Next page"
                        onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                        disabled={page >= pageCount}
                      >
                        <ChevronRightIcon />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6">
                <EmptyState title="No follow-ups match this view" description="Try another filter or create a new follow-up." />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Sheet — two-step: form → "are you sure?" */}
        <Sheet open={createOpen} onOpenChange={(open) => { if (!open) handleCreateClose() }}>
          <SheetContent
            side="right"
            className="w-full gap-0 p-0 data-[side=right]:w-full md:data-[side=right]:w-[50vw] md:data-[side=right]:max-w-none"
          >
            {createStep === "form" ? (
              <>
                <SheetHeader className="border-b px-6 py-5 pr-14">
                  <SheetTitle className="text-lg">Add Follow-Up</SheetTitle>
                  <SheetDescription>
                    Schedule due work against either seller leads or buyer leads.
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleCreateFormSubmit} className="flex min-h-0 flex-1 flex-col">
                  <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1.45fr)_280px]">
                    <div className="min-h-0 overflow-y-auto px-6 py-6">
                      <div className="space-y-5">
                        <ApiErrorAlert title="Unable to create follow-up" message={getApiErrorMessage(createMutation.error, "")} />
                        <FollowUpForm values={form} onChange={setForm} leadOptions={leadOptions} />
                      </div>
                    </div>
                    <aside className="border-t bg-muted/15 px-6 py-6 lg:border-t-0 lg:border-l">
                      <div className="space-y-4">
                        <Card className="border-border/70 py-0 shadow-none">
                          <CardHeader className="border-b py-4">
                            <CardTitle className="text-base">Follow-Up Summary</CardTitle>
                            <CardDescription>Live preview of the queue item you&apos;re scheduling.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4 py-4">
                            <div className="space-y-1">
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lead Type</p>
                              <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getLeadTypeBadgeClassName(form.leadType)}`}>
                                {form.leadType === "seller" ? "Seller Lead" : "Buyer Lead"}
                              </Badge>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lead</p>
                              <p className="text-sm font-medium text-foreground">
                                {leadOptions.find((lead) => lead.id === form.leadId)?.label ?? "No lead selected"}
                              </p>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Due Date</p>
                              <p className="text-sm font-medium text-foreground">
                                {form.dueAt ? format(form.dueAt, "MMM d, yyyy • h:mm a") : "Not scheduled"}
                              </p>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Note Preview</p>
                              <p className="text-sm text-foreground">{form.note ? truncateText(form.note, 110) : "No note entered yet"}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </aside>
                  </div>
                  <SheetFooter className="border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      This follow-up will be assigned to <span className="font-medium text-foreground">you</span>.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={handleCreateClose}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!canAssignToCurrentUser}>
                        Create Follow-Up
                      </Button>
                    </div>
                  </SheetFooter>
                </form>
              </>
            ) : (
              <>
                <SheetHeader className="border-b px-6 py-5 pr-14">
                  <SheetTitle className="text-lg">Are you sure?</SheetTitle>
                  <SheetDescription>
                    You are about to create a new follow-up. This action will add it to your queue.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10">
                  <ApiErrorAlert title="Unable to create follow-up" message={getApiErrorMessage(createMutation.error, "")} />
                  <p className="text-center text-sm text-muted-foreground">
                    This follow-up will be scheduled and assigned to you.
                  </p>
                </div>
                <SheetFooter className="border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateStep("form")}>
                      Go Back
                    </Button>
                    <SubmitButton
                      type="button"
                      pending={createMutation.isPending}
                      pendingLabel="Creating..."
                      disabled={!canAssignToCurrentUser}
                      onClick={handleCreateConfirm}
                    >
                      Yes, Create
                    </SubmitButton>
                  </div>
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Edit Dialog — notes only */}
        <Dialog open={Boolean(editTarget)} onOpenChange={(open) => !open && setEditTarget(null)}>
          <DialogContent className="max-w-lg">
            {editTarget ? (
              <EditFollowUpDialogForm
                followUp={editTarget}
                mutation={updateMutation}
                onClose={() => setEditTarget(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Reschedule Dialog — date only */}
        <Dialog open={Boolean(rescheduleTarget)} onOpenChange={(open) => !open && setRescheduleTarget(null)}>
          <DialogContent className="max-w-md">
            {rescheduleTarget ? (
              <RescheduleFollowUpDialogForm
                followUp={rescheduleTarget}
                mutation={updateMutation}
                onClose={() => setRescheduleTarget(null)}
              />
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Complete Dialog */}
        <Dialog open={Boolean(completeTarget)} onOpenChange={(open) => !open && setCompleteTarget(null)}>
          <DialogContent className="max-w-lg">
            {completeTarget ? (
              <>
                <DialogHeader>
                  <DialogTitle>Complete Follow-Up</DialogTitle>
                  <DialogDescription>
                    Add the outcome note for this follow-up before closing it.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/20 px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{completeTarget.note}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Due {format(new Date(completeTarget.dueAt), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                  <ApiErrorAlert title="Unable to complete follow-up" message={getApiErrorMessage(completeMutation.error, "")} />
                  <Field>
                    <FieldLabel htmlFor="completeOutcomeNote">Outcome note</FieldLabel>
                    <Textarea
                      id="completeOutcomeNote"
                      rows={4}
                      placeholder="Seller confirmed inspection schedule and sent updated availability."
                      value={outcomeNotes[completeTarget.id] ?? ""}
                      onChange={(event) =>
                        setOutcomeNotes((current) => ({ ...current, [completeTarget.id]: event.target.value }))
                      }
                    />
                  </Field>
                  <ActivityHistoryPanel entityType="follow_up" entityId={completeTarget.id} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCompleteTarget(null)}>
                    Cancel
                  </Button>
                  <SubmitButton
                    type="button"
                    pending={completeMutation.isPending}
                    pendingLabel="Completing"
                    onClick={() => handleComplete(completeTarget)}
                  >
                    Complete Follow-Up
                  </SubmitButton>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedAppShell>
  )
}

// Edit: note only — simple "are you sure?" confirmation
function EditFollowUpDialogForm({
  followUp,
  mutation,
  onClose,
}: {
  followUp: FollowUp
  mutation: ReturnType<typeof useUpdateFollowUpMutation>
  onClose: () => void
}) {
  const [note, setNote] = React.useState(followUp.note)
  const [step, setStep] = React.useState<"form" | "confirm">("form")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStep("confirm")
  }

  async function handleConfirm() {
    await mutation.mutateAsync(
      {
        id: followUp.id,
        payload: {
          note: note.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Follow-up note updated")
          onClose()
        },
      },
    )
  }

  if (step === "confirm") {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>You are about to update the note for this follow-up.</DialogDescription>
        </DialogHeader>
        <ApiErrorAlert title="Unable to update follow-up" message={getApiErrorMessage(mutation.error, "")} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setStep("form")}>
            Go Back
          </Button>
          <SubmitButton type="button" pending={mutation.isPending} pendingLabel="Saving..." onClick={handleConfirm}>
            Yes, Save Changes
          </SubmitButton>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogDescription>Update the work note for this follow-up.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ApiErrorAlert title="Unable to update follow-up" message={getApiErrorMessage(mutation.error, "")} />
        <Field>
          <FieldLabel htmlFor="editFollowUpNote">Note</FieldLabel>
          <Textarea
            id="editFollowUpNote"
            rows={5}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            required
          />
        </Field>
        <ActivityHistoryPanel entityType="follow_up" entityId={followUp.id} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

// Reschedule: date only — simple "are you sure?" confirmation
function RescheduleFollowUpDialogForm({
  followUp,
  mutation,
  onClose,
}: {
  followUp: FollowUp
  mutation: ReturnType<typeof useUpdateFollowUpMutation>
  onClose: () => void
}) {
  const [dueAt, setDueAt] = React.useState<Date>(() => new Date(followUp.dueAt))
  const [step, setStep] = React.useState<"form" | "confirm">("form")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStep("confirm")
  }

  async function handleConfirm() {
    await mutation.mutateAsync(
      {
        id: followUp.id,
        payload: {
          dueAt: dueAt.toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Follow-up rescheduled")
          onClose()
        },
      },
    )
  }

  if (step === "confirm") {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>You are about to reschedule this follow-up.</DialogDescription>
        </DialogHeader>
        <ApiErrorAlert title="Unable to reschedule follow-up" message={getApiErrorMessage(mutation.error, "")} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setStep("form")}>
            Go Back
          </Button>
          <SubmitButton type="button" pending={mutation.isPending} pendingLabel="Rescheduling..." onClick={handleConfirm}>
            Yes, Reschedule
          </SubmitButton>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Reschedule Follow-Up</DialogTitle>
        <DialogDescription>Move the due date and time. The status updates automatically.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ApiErrorAlert title="Unable to reschedule follow-up" message={getApiErrorMessage(mutation.error, "")} />
        <Field>
          <FieldLabel htmlFor="rescheduleFollowUpDueAt">New due date</FieldLabel>
          <DateTimePicker
            id="rescheduleFollowUpDueAt"
            value={dueAt}
            onChange={(date) => { if (date) setDueAt(date) }}
            minDate={new Date()}
            placeholder="Select new date & time"
          />
        </Field>
        <ActivityHistoryPanel entityType="follow_up" entityId={followUp.id} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Reschedule
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
