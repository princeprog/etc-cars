"use client"

import {
  BarChart3Icon,
  CarFrontIcon,
  CircleCheckIcon,
  DollarSignIcon,
  PercentIcon,
  ReceiptTextIcon,
  ShoppingBagIcon,
  WalletIcon,
} from "lucide-react"

import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { useReportsOverviewQuery } from "@/hooks/queries/reports/use-reports-overview-query"
import { getApiErrorMessage } from "@/types/api"
import type { ReportFilters } from "@/types/reports"
import { ReportSummaryCardGrid } from "./report-summary-card"
import { formatMoney, formatNumber, formatPercent } from "./report-format"

export function OverviewReport({
  filters,
  enabled,
}: {
  filters: ReportFilters
  enabled: boolean
}) {
  const query = useReportsOverviewQuery(filters, enabled)
  const report = query.data

  if (query.isPending) {
    return <ModuleLoadingState label="Loading business overview" />
  }

  if (query.error) {
    return (
      <ApiErrorAlert
        title="Unable to load overview"
        message={getApiErrorMessage(query.error, "")}
      />
    )
  }

  if (!report) {
    return null
  }

  const performanceCards = [
    {
      title: "Total Sales",
      value: formatNumber(report.sales.totalSales),
      caption: "Closed deals in range",
      icon: ReceiptTextIcon,
    },
    {
      title: "Revenue",
      value: formatMoney(report.sales.totalRevenue),
      caption: `Avg ${formatMoney(report.sales.averageSaleValue)} / sale`,
      icon: DollarSignIcon,
    },
    {
      title: "Gross Profit",
      value: formatMoney(report.profitability.totalGrossProfit),
      caption: `Avg ${formatMoney(report.profitability.averageGrossProfitPerSale)} / sale`,
      icon: BarChart3Icon,
    },
    {
      title: "Gross Margin",
      value: formatPercent(report.profitability.grossMarginPercent),
      caption: "Gross profit / revenue",
      icon: PercentIcon,
    },
  ]

  const positionCards = [
    {
      title: "Available Units",
      value: formatNumber(report.inventory.available),
      caption: `${formatNumber(report.inventory.activeUnits)} active of ${formatNumber(report.inventory.totalUnits)} total`,
      icon: CircleCheckIcon,
    },
    {
      title: "Active Inventory Value",
      value: formatMoney(report.inventory.totalInventoryValue),
      caption: "Purchase cost of unsold stock",
      icon: WalletIcon,
    },
    {
      title: "Buyer Conversion",
      value: formatPercent(report.leads.buyerConversionRate),
      caption: `${formatNumber(report.leads.totalBuyerLeads)} buyer leads`,
      icon: ShoppingBagIcon,
    },
    {
      title: "Seller Conversion",
      value: formatPercent(report.leads.sellerConversionRate),
      caption: `${formatNumber(report.leads.totalSellerLeads)} seller leads`,
      icon: CarFrontIcon,
    },
  ]

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Sales performance</h3>
        <ReportSummaryCardGrid cards={performanceCards} />
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Inventory position &amp; lead conversion
        </h3>
        <ReportSummaryCardGrid cards={positionCards} />
      </section>
      <p className="text-xs text-muted-foreground">
        Sales, revenue and profit reflect the selected date range and agent
        filter. Inventory figures are a current snapshot and are not
        date-filtered. Use the tabs above for detailed, exportable reports.
      </p>
    </div>
  )
}
