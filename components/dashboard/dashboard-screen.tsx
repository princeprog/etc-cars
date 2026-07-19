"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarDaysIcon,
  ClipboardListIcon,
  RefreshCcwIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { SectionCards } from "@/components/section-cards"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAllActivityHistoryQuery } from "@/hooks/queries/activity-history/use-all-activity-history-query"
import { useDashboardQuery } from "@/hooks/queries/dashboard/use-dashboard-query"
import type { ActivityHistoryDateRange } from "@/types/activity-history-page"

import { AcquisitionSalesChart } from "./acquisition-sales-chart"
import { ExpenseOverviewPanel } from "./expense-overview-panel"
import { InventoryReadinessChart } from "./inventory-readiness-chart"
import { NeedsAttentionPanel } from "./needs-attention-panel"
import { RecentActivityTable } from "./recent-activity-table"
import { SellerLeadPipelineChart } from "./seller-lead-pipeline-chart"

const DATE_RANGE_OPTIONS: Array<{
  value: ActivityHistoryDateRange
  label: string
}> = [
  { value: "last_30_days", label: "Last 30 days" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "this_month", label: "This month" },
  { value: "all", label: "All time" },
]

export function DashboardScreen() {
  const [dateRange, setDateRange] =
    React.useState<ActivityHistoryDateRange>("last_30_days")
  const dashboardQuery = useDashboardQuery()
  const activityQuery = useAllActivityHistoryQuery({
    page: 1,
    pageSize: 5,
    dateRange,
  })

  const refresh = () => {
    void dashboardQuery.refetch()
    void activityQuery.refetch()
  }

  return (
    <AuthenticatedAppShell title="Dashboard" hideHeader>
      <main className="@container/main flex flex-1 flex-col gap-3 bg-muted/15 p-4 lg:p-5 lg:pb-0">
        <DashboardHeader
          dateRange={dateRange}
          isRefreshing={dashboardQuery.isFetching || activityQuery.isFetching}
          onDateRangeChange={setDateRange}
          onRefresh={refresh}
        />

        {dashboardQuery.isPending ? (
          <DashboardLoadingState />
        ) : dashboardQuery.error ? (
          <Alert variant="destructive" className="max-w-xl">
            <TriangleAlertIcon />
            <AlertTitle>Dashboard unavailable</AlertTitle>
            <AlertDescription>
              {dashboardQuery.error instanceof Error
                ? dashboardQuery.error.message
                : "Unable to load dashboard data."}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <SectionCards
              metrics={dashboardQuery.data.metrics}
              overdueFollowUps={
                dashboardQuery.data.queues.overdueFollowUps.length
              }
            />

            <ExpenseOverviewPanel
              expenses={dashboardQuery.data.metrics.expenses}
            />

            <section className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,1fr)]">
              <AcquisitionSalesChart
                trend={dashboardQuery.data.analytics.acquisitionSalesTrend}
              />
              <SellerLeadPipelineChart
                pipeline={dashboardQuery.data.analytics.sellerLeadPipeline}
              />
            </section>

            <section className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(390px,0.9fr)]">
              <InventoryReadinessChart metrics={dashboardQuery.data.metrics} />
              <NeedsAttentionPanel
                overdueFollowUps={
                  dashboardQuery.data.queues.overdueFollowUps.length
                }
                inspectionsPending={
                  dashboardQuery.data.metrics.inspectionsPending
                }
                incompleteListings={
                  dashboardQuery.data.metrics.inventoryQuality.gradeCounts
                    .incomplete
                }
                approvedLeads={
                  dashboardQuery.data.metrics.approvedLeadsAwaitingConversion
                }
              />
            </section>

            <RecentActivityTable
              events={activityQuery.data?.events ?? []}
              isLoading={activityQuery.isPending}
              hasError={Boolean(activityQuery.error)}
            />
          </>
        )}
      </main>
    </AuthenticatedAppShell>
  )
}

function DashboardHeader({
  dateRange,
  isRefreshing,
  onDateRangeChange,
  onRefresh,
}: {
  dateRange: ActivityHistoryDateRange
  isRefreshing: boolean
  onDateRangeChange: (value: ActivityHistoryDateRange) => void
  onRefresh: () => void
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor inventory, leads, inspections, follow-ups, and sales
            performance.
          </p>
        </div>
        <SidebarTrigger className="shrink-0 sm:hidden" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <NotificationBell />
        <Select
          value={dateRange}
          onValueChange={(value) =>
            onDateRangeChange(value as ActivityHistoryDateRange)
          }
        >
          <SelectTrigger aria-label="Dashboard date range">
            <CalendarDaysIcon aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              {DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Refresh dashboard"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcwIcon
            className={isRefreshing ? "animate-spin" : undefined}
          />
        </Button>

        <Button variant="outline" asChild>
          <Link href="/activity-history">
            <ClipboardListIcon data-icon="inline-start" />
            Activity Logs
          </Link>
        </Button>
      </div>
    </header>
  )
}

function DashboardLoadingState() {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading dashboard">
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,1fr)]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}
