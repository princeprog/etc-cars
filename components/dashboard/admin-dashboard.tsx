"use client";

import {
  ChartNoAxesCombinedIcon,
  HandCoinsIcon,
  PhilippinePesoIcon,
  ReceiptTextIcon,
} from "lucide-react";

import {
  formatCompactMoney,
  formatPercent,
} from "@/components/reports/report-format";
import type { ActivityHistoryEvent } from "@/types/activity-history";
import type { AdminDashboardResponse } from "@/types/dashboard";

import { AdminAttentionPanel } from "./admin-attention-panel";
import { DashboardKpiCard } from "./dashboard-kpi-card";
import { InventoryPositionPanel } from "./inventory-position-panel";
import { LeadHealthPanel } from "./lead-health-panel";
import { RecentActivityTable } from "./recent-activity-table";
import { SalesPerformanceChart } from "./sales-performance-chart";

function comparisonLabel(value: string | null) {
  if (value === null) {
    return null;
  }

  const numeric = Number(value);
  const prefix = numeric > 0 ? "+" : "";
  return `${prefix}${numeric.toFixed(1)}%`;
}

export function AdminDashboard({
  dashboard,
  activity,
}: {
  dashboard: AdminDashboardResponse;
  activity: {
    events: ActivityHistoryEvent[];
    isLoading: boolean;
    hasError: boolean;
  };
}) {
  const performance = dashboard.performance;
  const cards = [
    {
      label: "Revenue",
      value: formatCompactMoney(performance.revenue),
      description: `${performance.totalSales} closed sales · ${formatCompactMoney(performance.averageSaleValue)} average`,
      comparison: comparisonLabel(performance.comparison.revenuePercent),
      icon: PhilippinePesoIcon,
    },
    {
      label: "Gross Profit",
      value: formatCompactMoney(performance.grossProfit),
      description: `${formatPercent(performance.grossMarginPercent)} gross margin`,
      comparison: comparisonLabel(performance.comparison.grossProfitPercent),
      icon: ChartNoAxesCombinedIcon,
    },
    {
      label: "Sales Closed",
      value: performance.totalSales.toLocaleString(),
      description: `${dashboard.period.label} performance`,
      comparison: comparisonLabel(performance.comparison.salesPercent),
      icon: HandCoinsIcon,
    },
    {
      label: "Operating Expenses",
      value: formatCompactMoney(performance.expenses.totalExpectedAmount),
      description: `${formatCompactMoney(performance.expenses.unpaidAmount)} unpaid · ${performance.expenses.overdueCount} overdue`,
      comparison: null,
      icon: ReceiptTextIcon,
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <section
        className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4"
        aria-label="Business performance"
      >
        {cards.map((card) => (
          <DashboardKpiCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="contents xl:flex xl:min-w-0 xl:flex-col xl:gap-3">
          <div className="order-1 min-w-0 xl:order-none">
            <SalesPerformanceChart
              trend={dashboard.trend}
              periodLabel={dashboard.period.label}
            />
          </div>
          <div className="order-3 min-w-0 xl:order-none">
            <InventoryPositionPanel
              inventory={dashboard.inventory}
              totalInventoryValue={dashboard.inventory.totalInventoryValue}
            />
          </div>
        </div>
        <div className="contents xl:flex xl:min-w-0 xl:flex-col xl:gap-3">
          <div className="order-2 min-w-0 xl:order-none">
            <AdminAttentionPanel attention={dashboard.attention} />
          </div>
          <div className="order-4 min-w-0 xl:order-none">
            <LeadHealthPanel health={dashboard.leads.health} />
          </div>
        </div>
      </section>

      <RecentActivityTable {...activity} />
    </div>
  );
}
