"use client"

import * as React from "react"
import { format, isToday, isYesterday } from "date-fns"
import { Clock3Icon, HistoryIcon, UserCircle2Icon } from "lucide-react"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ListPagination } from "@/components/operations/list-pagination"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAllActivityHistoryQuery } from "@/hooks/queries/activity-history/use-all-activity-history-query"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { getApiErrorMessage } from "@/types/api"
import type { ActivityHistoryEvent } from "@/types/activity-history"

const ACTIVITY_HISTORY_PAGE_SIZE = 10

function getActionLabel(actionType: string) {
  return actionType.split(".").at(-1)?.replaceAll("_", " ") ?? actionType
}

function getEntityLabel(entityType: string) {
  return entityType.replaceAll("_", " ")
}

function getTimelineSectionLabel(timestamp: string) {
  const date = new Date(timestamp)

  if (isToday(date)) {
    return "Today"
  }

  if (isYesterday(date)) {
    return "Yesterday"
  }

  return format(date, "MMMM d, yyyy")
}

function getTimelineDotClassName(entityType: string) {
  switch (entityType) {
    case "seller_lead":
      return "border-emerald-200 bg-emerald-50 text-emerald-600"
    case "buyer_lead":
      return "border-sky-200 bg-sky-50 text-sky-600"
    case "vehicle":
      return "border-amber-200 bg-amber-50 text-amber-600"
    case "sale":
      return "border-rose-200 bg-rose-50 text-rose-600"
    case "follow_up":
      return "border-violet-200 bg-violet-50 text-violet-600"
    default:
      return "border-slate-200 bg-slate-50 text-slate-600"
  }
}

function groupEventsByDay(events: ActivityHistoryEvent[]) {
  const sections: Array<{ label: string; events: ActivityHistoryEvent[] }> = []

  for (const event of events) {
    const label = getTimelineSectionLabel(event.timestamp)
    const currentSection = sections.at(-1)

    if (currentSection?.label === label) {
      currentSection.events.push(event)
      continue
    }

    sections.push({ label, events: [event] })
  }

  return sections
}

function isStaffRestrictedEvent(event: ActivityHistoryEvent) {
  if (event.entityType !== "user") {
    return false
  }

  const normalizedAction = event.actionType.toLowerCase()
  const normalizedSummary = event.summary.toLowerCase()

  return (
    normalizedAction.includes("status") ||
    normalizedAction.includes("enable") ||
    normalizedAction.includes("disable") ||
    normalizedSummary.includes("account enabled") ||
    normalizedSummary.includes("account disabled")
  )
}

export function ActivityHistoryScreen() {
  const authQuery = useAuthenticatedUserQuery()
  const [page, setPage] = React.useState(1)
  const activityQuery = useAllActivityHistoryQuery({ page, pageSize: ACTIVITY_HISTORY_PAGE_SIZE })
  const isAdmin = authQuery.data?.user.role === "admin"
  const events = React.useMemo(() => {
    const allEvents = activityQuery.data?.events ?? []
    return isAdmin ? allEvents : allEvents.filter((event) => !isStaffRestrictedEvent(event))
  }, [activityQuery.data?.events, isAdmin])
  const total = events.length
  const totalPages = activityQuery.data?.totalPages ?? 1
  const sections = groupEventsByDay(events)

  return (
    <AuthenticatedAppShell title="Activity History">
      <div className="flex flex-1 flex-col gap-6 bg-[linear-gradient(180deg,rgba(250,250,252,0.95)_0%,rgba(255,255,255,1)_220px)] p-4 md:p-6">
        <section className="rounded-[28px] border border-border/60 bg-background/95 p-5 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)] backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full border-sky-200 bg-sky-50 px-3 text-[11px] font-semibold text-sky-700">
                  Operational Timeline
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 text-[11px]">
                  Page {page} of {totalPages}
                </Badge>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  Activity stream across the dealership
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Review the latest lead, vehicle, link, and sale events in one reverse-chronological feed with a cleaner timeline view.
                </p>
                {!isAdmin ? (
                  <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
                    Staff-facing activity hides sensitive account enable and disable actions.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid min-w-[220px] gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-muted/25 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Entries</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{total}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/25 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">This page</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{events.length}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/25 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Page size</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{ACTIVITY_HISTORY_PAGE_SIZE}</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="overflow-hidden rounded-[28px] border-border/60 bg-background/95 py-0 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.4)]">
          <CardHeader className="border-b border-border/60 bg-muted/10 py-5">
            <CardTitle className="text-base">Overall Activity</CardTitle>
            <CardDescription>Latest operational events captured by the backend audit trail.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {activityQuery.isPending ? (
              <ModuleLoadingState label="Loading activity history" />
            ) : activityQuery.error ? (
              <ApiErrorAlert
                title="Unable to load activity history"
                message={getApiErrorMessage(activityQuery.error, "")}
              />
            ) : sections.length ? (
              <div className="space-y-8">
                {sections.map((section) => (
                  <section key={section.label} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border/60" />
                      <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {section.label}
                      </p>
                      <div className="h-px flex-1 bg-border/60" />
                    </div>

                    <div className="space-y-5">
                      {section.events.map((event) => (
                        <div
                          key={event.id}
                          className="grid gap-3 md:grid-cols-[88px_minmax(0,1fr)] md:gap-5"
                        >
                          <div className="pt-1 text-xs font-medium tracking-wide text-muted-foreground md:text-right">
                            {format(new Date(event.timestamp), "hh:mm a")}
                          </div>

                          <div className="relative pl-9">
                            <div className="absolute top-0 bottom-0 left-[13px] w-px bg-border/70" />
                            <div
                              className={`absolute top-1.5 left-0 flex size-7 items-center justify-center rounded-full border bg-background ${getTimelineDotClassName(event.entityType)}`}
                            >
                              <HistoryIcon className="size-3.5" />
                            </div>

                            <div className="rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)]">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="space-y-2">
                                  <p className="text-sm leading-6 font-medium text-foreground">{event.summary}</p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="rounded-md border-slate-200 bg-slate-50 px-2.5 text-[11px] font-medium text-slate-700"
                                    >
                                      {getEntityLabel(event.entityType)}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="rounded-md border-slate-200 bg-background px-2.5 text-[11px] font-medium"
                                    >
                                      {getActionLabel(event.actionType)}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                  <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1">
                                    <UserCircle2Icon className="size-3.5" />
                                    {event.actorDisplayName ?? "System"}
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1">
                                    <Clock3Icon className="size-3.5" />
                                    {format(new Date(event.timestamp), "MMM d, yyyy")}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/80">{event.entityId}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No activity yet"
                description="Timeline events will appear here once staff start working leads, inventory, and sales."
              />
            )}
          </CardContent>
          {!activityQuery.isPending && !activityQuery.error && total > 0 ? (
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
    </AuthenticatedAppShell>
  )
}
