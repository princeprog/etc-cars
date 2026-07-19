"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDaysIcon,
  ListChecksIcon,
  RefreshCcwIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAllActivityHistoryQuery } from "@/hooks/queries/activity-history/use-all-activity-history-query";
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query";
import { useDashboardQuery } from "@/hooks/queries/dashboard/use-dashboard-query";
import type { DashboardRange } from "@/types/dashboard";

import { AdminDashboard } from "./admin-dashboard";
import { StaffDashboard } from "./staff-dashboard";

const RANGE_OPTIONS: Array<{ value: DashboardRange; label: string }> = [
  { value: "this_month", label: "This month" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "last_90_days", label: "Last 90 days" },
  { value: "year_to_date", label: "Year to date" },
];

export function DashboardScreen() {
  const [range, setRange] = React.useState<DashboardRange>("this_month");
  const dashboardQuery = useDashboardQuery(range);
  const authQuery = useAuthenticatedUserQuery();
  const dashboard = dashboardQuery.data;
  const activityQuery = useAllActivityHistoryQuery(
    {
      page: 1,
      pageSize: 5,
      dateRange: range,
      actorUserId:
        dashboard?.view === "staff" ? authQuery.data?.user.id : undefined,
    },
    Boolean(dashboard) &&
      (dashboard?.view !== "staff" || Boolean(authQuery.data?.user.id)),
  );

  const isRefreshing = dashboardQuery.isFetching || activityQuery.isFetching;
  const activity = {
    events: activityQuery.data?.events ?? [],
    isLoading: activityQuery.isPending,
    hasError: Boolean(activityQuery.error),
  };

  const refresh = () => {
    void dashboardQuery.refetch();
    void activityQuery.refetch();
  };

  return (
    <AuthenticatedAppShell title="Dashboard" hideHeader>
      <main
        className="@container/main flex flex-1 flex-col gap-3 bg-muted/15 p-4 lg:p-5"
        aria-busy={isRefreshing}
      >
        <DashboardHeader
          view={dashboard?.view}
          range={range}
          isRefreshing={isRefreshing}
          onRangeChange={setRange}
          onRefresh={refresh}
        />

        {dashboardQuery.error ? (
          <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertTitle>Dashboard unavailable</AlertTitle>
            <AlertDescription>
              {dashboardQuery.error instanceof Error
                ? dashboardQuery.error.message
                : "We could not load the latest dashboard data. Please try again."}
            </AlertDescription>
          </Alert>
        ) : null}

        {dashboardQuery.isPending ? (
          <DashboardLoadingState />
        ) : dashboard?.view === "admin" ? (
          <AdminDashboard dashboard={dashboard} activity={activity} />
        ) : dashboard?.view === "staff" ? (
          <StaffDashboard dashboard={dashboard} activity={activity} />
        ) : null}
      </main>
    </AuthenticatedAppShell>
  );
}

function DashboardHeader({
  view,
  range,
  isRefreshing,
  onRangeChange,
  onRefresh,
}: {
  view?: "admin" | "staff";
  range: DashboardRange;
  isRefreshing: boolean;
  onRangeChange: (value: DashboardRange) => void;
  onRefresh: () => void;
}) {
  const isStaff = view === "staff";

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground">
            {isStaff
              ? "Stay on top of your assigned leads, follow-ups, and sales."
              : "Monitor dealership performance and the work that needs attention."}
          </p>
        </div>
        <SidebarTrigger className="shrink-0 sm:hidden" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <NotificationBell />
        <Select
          value={range}
          onValueChange={(value) => onRangeChange(value as DashboardRange)}
        >
          <SelectTrigger
            aria-label="Dashboard reporting period"
            className="w-42"
          >
            <CalendarDaysIcon aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              {RANGE_OPTIONS.map((option) => (
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

        <Button asChild>
          <Link href={isStaff ? "/follow-ups" : "/reports"}>
            <ListChecksIcon data-icon="inline-start" />
            {isStaff ? "Open Follow-Ups" : "View Reports"}
          </Link>
        </Button>
      </div>
    </header>
  );
}

function DashboardLoadingState() {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading dashboard">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Skeleton className="h-88" />
        <Skeleton className="h-88" />
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
