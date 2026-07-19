"use client";

import {
  CalendarCheckIcon,
  ClockAlertIcon,
  HandCoinsIcon,
  UsersRoundIcon,
} from "lucide-react";

import { formatCompactMoney } from "@/components/reports/report-format";
import type { ActivityHistoryEvent } from "@/types/activity-history";
import type { StaffDashboardResponse } from "@/types/dashboard";

import { DashboardKpiCard } from "./dashboard-kpi-card";
import { InventoryPositionPanel } from "./inventory-position-panel";
import { RecentActivityTable } from "./recent-activity-table";
import { SalesPerformanceChart } from "./sales-performance-chart";
import { StaffLeadPipeline } from "./staff-lead-pipeline";
import { StaffPriorityQueue } from "./staff-priority-queue";

function comparisonLabel(value: string | null) {
  if (value === null) {
    return null;
  }

  const numeric = Number(value);
  return `${numeric > 0 ? "+" : ""}${numeric.toFixed(1)}%`;
}

export function StaffDashboard({
  dashboard,
  activity,
}: {
  dashboard: StaffDashboardResponse;
  activity: {
    events: ActivityHistoryEvent[];
    isLoading: boolean;
    hasError: boolean;
  };
}) {
  const cards = [
    {
      label: "My Open Leads",
      value: dashboard.assignments.openLeads.toLocaleString(),
      description: `${dashboard.assignments.activeSellerLeads} seller · ${dashboard.assignments.activeBuyerLeads} buyer`,
      comparison: null,
      icon: UsersRoundIcon,
    },
    {
      label: "Due Today",
      value: dashboard.assignments.dueTodayFollowUps.toLocaleString(),
      description: "Assigned follow-ups due today",
      comparison: null,
      icon: CalendarCheckIcon,
    },
    {
      label: "Overdue Follow-Ups",
      value: dashboard.assignments.overdueFollowUps.toLocaleString(),
      description: "Customer actions needing attention",
      comparison: null,
      icon: ClockAlertIcon,
    },
    {
      label: "My Sales",
      value: dashboard.personalPerformance.totalSales.toLocaleString(),
      description: `${formatCompactMoney(dashboard.personalPerformance.revenue)} revenue`,
      comparison: comparisonLabel(
        dashboard.personalPerformance.comparisonPercent,
      ),
      icon: HandCoinsIcon,
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <section
        className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4"
        aria-label="My work summary"
      >
        {cards.map((card) => (
          <DashboardKpiCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid min-w-0 items-start gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <StaffPriorityQueue items={dashboard.priorityQueue} />
        <StaffLeadPipeline pipelines={dashboard.pipelines} />
      </section>

      <section className="grid min-w-0 items-start gap-3 xl:grid-cols-2">
        <InventoryPositionPanel inventory={dashboard.inventory} />
        <SalesPerformanceChart
          trend={dashboard.personalPerformance.trend}
          periodLabel={dashboard.period.label}
          title="My Sales"
          description="Your revenue and gross-profit trend for the selected period."
        />
      </section>

      <RecentActivityTable {...activity} title="My Recent Activity" />
    </div>
  );
}
