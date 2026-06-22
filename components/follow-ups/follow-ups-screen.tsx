"use client"

import * as React from "react"
import { format, formatDistanceToNow, isPast, isToday, addDays } from "date-fns"
import {
  AlertCircleIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CheckIcon,
  Clock3Icon,
  MoreHorizontalIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ListPagination } from "@/components/operations/list-pagination"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { SubmitButton } from "@/components/operations/submit-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useBuyerLeadsQuery } from "@/hooks/queries/buyer-leads/use-buyer-leads-query"
import { useFollowUpsQuery } from "@/hooks/queries/follow-ups/use-follow-ups-query"
import { useSellerLeadsQuery } from "@/hooks/queries/seller-leads/use-seller-leads-query"
import { getApiErrorMessage } from "@/types/api"
import {
  FOLLOW_UP_STATUSES,
  LEAD_TYPES,
  type FollowUp,
  type FollowUpListFilters,
  type FollowUpStatus,
  type LeadType,
} from "@/types/follow-ups"

type FollowUpFormValues = {
  leadType: LeadType
  leadId: string
  dueAt: string
  note: string
}

type QueueFilter = "all" | FollowUpStatus

function getEmptyFollowUpFormValues(): FollowUpFormValues {
  return {
    leadType: "seller",
    leadId: "",
    dueAt: "",
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

function getUpcomingCount(followUps: FollowUp[]) {
  const horizon = addDays(new Date(), 7)

  return followUps.filter((followUp) => {
    if (followUp.status === "Completed") {
      return false
    }

    const dueDate = new Date(followUp.dueAt)
    return dueDate > new Date() && dueDate <= horizon
  }).length
}

function truncateText(value: string, length: number) {
  if (value.length <= length) {
    return value
  }

  return `${value.slice(0, length - 1)}…`
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
          <Input
            id="followUpDueAt"
            type="datetime-local"
            value={values.dueAt}
            onChange={(event) => updateField("dueAt", event.target.value)}
            required
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

  const [createOpen, setCreateOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<QueueFilter>("all")
  const [leadTypeFilter, setLeadTypeFilter] = React.useState<"all" | LeadType>("all")
  const [assigneeFilter, setAssigneeFilter] = React.useState<"all" | "mine">("all")
  const [page, setPage] = React.useState(1)
  const [form, setForm] = React.useState<FollowUpFormValues>(getEmptyFollowUpFormValues)
  const [completeTarget, setCompleteTarget] = React.useState<FollowUp | null>(null)
  const [outcomeNotes, setOutcomeNotes] = React.useState<Record<string, string>>({})

  const currentUserId = authQuery.data?.user.id
  const filters = React.useMemo<FollowUpListFilters>(
    () => ({
      page,
      pageSize: 10,
      search: searchTerm.trim() || undefined,
      status: statusFilter,
      leadType: leadTypeFilter,
      assigneeUserId: assigneeFilter === "mine" ? currentUserId : undefined,
    }),
    [assigneeFilter, currentUserId, leadTypeFilter, page, searchTerm, statusFilter],
  )
  const followUpsQuery = useFollowUpsQuery(filters)
  const followUps = React.useMemo(() => followUpsQuery.data?.followUps ?? [], [followUpsQuery.data?.followUps])
  const total = followUpsQuery.data?.total ?? 0
  const totalPages = followUpsQuery.data?.totalPages ?? 1
  const sellerLeads = React.useMemo(() => sellerLeadsQuery.data?.sellerLeads ?? [], [sellerLeadsQuery.data?.sellerLeads])
  const buyerLeads = React.useMemo(() => buyerLeadsQuery.data?.buyerLeads ?? [], [buyerLeadsQuery.data?.buyerLeads])

  const sellerLeadMap = React.useMemo(
    () =>
      new Map(
        sellerLeads.map((lead) => [
          lead.id,
          {
            primary: lead.sellerName,
            secondary: `${lead.vehicleBrand} ${lead.vehicleModel}`,
          },
        ]),
      ),
    [sellerLeads],
  )

  const buyerLeadMap = React.useMemo(
    () =>
      new Map(
        buyerLeads.map((lead) => [
          lead.id,
          {
            primary: lead.buyerName,
            secondary: lead.contactNumber,
          },
        ]),
      ),
    [buyerLeads],
  )

  const leadOptions =
    form.leadType === "seller"
      ? sellerLeads.map((lead) => ({ id: lead.id, label: `${lead.sellerName} • ${lead.vehicleBrand} ${lead.vehicleModel}` }))
      : buyerLeads.map((lead) => ({ id: lead.id, label: `${lead.buyerName} • ${lead.contactNumber}` }))

  const overdueCount = followUps.filter((followUp) => followUp.status === "Overdue").length
  const dueTodayCount = followUps.filter(
    (followUp) => followUp.status !== "Completed" && isToday(new Date(followUp.dueAt)),
  ).length
  const upcomingCount = getUpcomingCount(followUps)
  const completedCount = followUps.filter((followUp) => followUp.status === "Completed").length

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await createMutation.mutateAsync(
      {
        leadType: form.leadType,
        sellerLeadId: form.leadType === "seller" ? form.leadId : undefined,
        buyerLeadId: form.leadType === "buyer" ? form.leadId : undefined,
        assigneeUserId: currentUserId ?? "",
        dueAt: new Date(form.dueAt).toISOString(),
        note: form.note,
      },
      {
        onSuccess: () => {
          toast.success("Follow-up created")
          setCreateOpen(false)
          setForm(getEmptyFollowUpFormValues())
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

  const summaryCards = [
    {
      title: "Overdue",
      value: overdueCount,
      caption: "Needs attention",
      icon: AlertCircleIcon,
      iconClassName: "text-rose-600",
      iconWrapClassName: "bg-rose-50 text-rose-600 dark:bg-rose-950/40",
    },
    {
      title: "Due Today",
      value: dueTodayCount,
      caption: "Due today",
      icon: CalendarClockIcon,
      iconClassName: "text-orange-600",
      iconWrapClassName: "bg-orange-50 text-orange-600 dark:bg-orange-950/40",
    },
    {
      title: "Upcoming",
      value: upcomingCount,
      caption: "Next 7 days",
      icon: Clock3Icon,
      iconClassName: "text-blue-600",
      iconWrapClassName: "bg-blue-50 text-blue-600 dark:bg-blue-950/40",
    },
    {
      title: "Completed",
      value: completedCount,
      caption: "Closed tasks",
      icon: CheckCircle2Icon,
      iconClassName: "text-emerald-600",
      iconWrapClassName: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
    },
  ]

  return (
    <AuthenticatedAppShell title="Follow-Ups">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Follow-Ups</h2>
              <p className="text-sm text-muted-foreground">
                Track due tasks, overdue reminders, and completed follow-up activity across buyer and seller workflows.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Add Follow-Up
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_180px_180px_180px_auto]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setPage(1)
                }}
                placeholder="Search follow-ups, leads, notes..."
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value as QueueFilter)
              setPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {FOLLOW_UP_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={leadTypeFilter} onValueChange={(value) => {
              setLeadTypeFilter(value as "all" | LeadType)
              setPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Lead type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="seller">Seller Lead</SelectItem>
                <SelectItem value="buyer">Buyer Lead</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={(value) => {
              setAssigneeFilter(value as "all" | "mine")
              setPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="mine">My Follow-Ups</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setLeadTypeFilter("all")
                setAssigneeFilter("all")
                setPage(1)
              }}
            >
              <RotateCcwIcon />
              Reset
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon

              return (
                <Card key={card.title} className="border-border/70 py-0 shadow-xs">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`flex size-11 items-center justify-center rounded-full ${card.iconWrapClassName}`}>
                      <Icon className={`size-5 ${card.iconClassName}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{card.title}</p>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-semibold tracking-tight text-foreground">{card.value}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{card.caption}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

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
              <Table className="min-w-[1280px] border-collapse">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Follow-Up</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Lead Type</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Lead / Contact</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Due Date</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Status</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Assignee</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Outcome / Note Preview</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-foreground/80">Updated</TableHead>
                    <TableHead className="px-4 text-right text-xs font-semibold text-foreground/80">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {followUps.map((followUp) => {
                    const leadMeta =
                      followUp.leadType === "seller"
                        ? sellerLeadMap.get(followUp.sellerLeadId ?? "")
                        : buyerLeadMap.get(followUp.buyerLeadId ?? "")

                    const notePreview = followUp.outcomeNote || followUp.note
                    const isOverdue = followUp.status === "Overdue" || (followUp.status === "Due" && isPast(new Date(followUp.dueAt)) && !isToday(new Date(followUp.dueAt)))

                    return (
                      <TableRow
                        key={followUp.id}
                        className="hover:bg-muted/15"
                      >
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
                            <p className="font-medium text-foreground">{leadMeta?.primary ?? "Lead not found"}</p>
                            <p className="text-sm text-muted-foreground">{leadMeta?.secondary ?? "No lead context available"}</p>
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
            ) : (
              <div className="p-6">
                <EmptyState title="No follow-ups match this view" description="Try another filter or create a new follow-up." />
              </div>
            )}
          </CardContent>
          {!followUpsQuery.isPending && !followUpsQuery.error && total > 0 ? (
            <ListPagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="follow-ups"
              onPageChange={setPage}
            />
          ) : null}
        </Card>

        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent
            side="right"
            className="w-full gap-0 p-0 data-[side=right]:w-full md:data-[side=right]:w-[50vw] md:data-[side=right]:max-w-none"
          >
            <SheetHeader className="border-b px-6 py-5 pr-14">
              <SheetTitle className="text-lg">Add Follow-Up</SheetTitle>
              <SheetDescription>
                Schedule due work against either seller leads or buyer leads.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateSubmit} className="flex min-h-0 flex-1 flex-col">
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
                            {form.dueAt ? format(new Date(form.dueAt), "MMM d, yyyy • h:mm a") : "Not scheduled"}
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
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <SubmitButton type="submit" pending={createMutation.isPending} pendingLabel="Creating follow-up">
                    Create Follow-Up
                  </SubmitButton>
                </div>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

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
