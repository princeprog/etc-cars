"use client"

import {
  CoinsIcon,
  PercentIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useProfitabilityReportQuery } from "@/hooks/queries/reports/use-profitability-report-query"
import type { ReportFilters } from "@/types/reports"
import { ReportAsyncBoundary } from "./report-async-boundary"
import { ReportExportButton } from "./report-export-button"
import { ReportSection } from "./report-section"
import { ReportSummaryCardGrid } from "./report-summary-card"
import { formatMoney, formatNumber, formatPercent } from "./report-format"

const HEAD_CLASS = "px-4 text-xs font-semibold text-foreground/80"

export function ProfitabilityReport({
  filters,
  enabled,
}: {
  filters: ReportFilters
  enabled: boolean
}) {
  const query = useProfitabilityReportQuery(filters, enabled)
  const report = query.data
  const summary = report?.summary

  const summaryCards = [
    {
      title: "Total Revenue",
      value: formatMoney(summary?.totalRevenue),
      caption: "Booked revenue in range",
      icon: WalletIcon,
    },
    {
      title: "Gross Profit",
      value: formatMoney(summary?.totalGrossProfit),
      caption: "Revenue less vehicle cost",
      icon: CoinsIcon,
    },
    {
      title: "Gross Margin",
      value: formatPercent(summary?.grossMarginPercent),
      caption: "Gross profit / revenue",
      icon: PercentIcon,
    },
    {
      title: "Avg Profit / Sale",
      value: formatMoney(summary?.averageGrossProfitPerSale),
      caption: `${formatNumber(summary?.salesWithKnownCost)} sales with known cost`,
      icon: TrendingUpIcon,
    },
  ]

  return (
    <div className="space-y-5">
      <ReportSummaryCardGrid cards={summaryCards} />

      {summary && summary.salesMissingCost > 0 ? (
        <p className="text-xs text-muted-foreground">
          Note: {formatNumber(summary.salesMissingCost)} sale
          {summary.salesMissingCost === 1 ? "" : "s"} had no recorded vehicle
          cost and are excluded from gross profit and margin figures.
        </p>
      ) : null}

      <ReportSection
        title="Profitability over time"
        description="Gross profit, revenue and margin trend per period."
        action={
          <ReportExportButton
            domain="profitability"
            dataset="trend"
            filters={filters}
            label="Export trend"
            disabled={!report?.trend.length}
          />
        }
      >
        <ReportAsyncBoundary
          isPending={query.isPending}
          error={query.error}
          isEmpty={!report?.trend.length}
          loadingLabel="Loading profitability trend"
          errorTitle="Unable to load profitability report"
          emptyTitle="No sales in this range"
          emptyDescription="Adjust the date range or finalize sales to see profit trends."
        >
          <Table className="w-full border-collapse">
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className={HEAD_CLASS}>Period</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Revenue</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Gross Profit</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.trend.map((row) => (
                <TableRow key={row.period} className="hover:bg-muted/15">
                  <TableCell className="px-4 py-3 font-medium text-foreground">{row.periodLabel}</TableCell>
                  <TableCell className="px-4 py-3 text-right font-medium">{formatMoney(row.revenue)}</TableCell>
                  <TableCell className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-300">{formatMoney(row.grossProfit)}</TableCell>
                  <TableCell className="px-4 py-3 text-right">{formatPercent(row.grossMarginPercent)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ReportAsyncBoundary>
      </ReportSection>

      <ReportSection
        title="Profitability by agent"
        description="Which agents are driving stronger or weaker margins."
        action={
          <ReportExportButton
            domain="profitability"
            dataset="by-agent"
            filters={filters}
            label="Export agents"
            disabled={!report?.byAgent.length}
          />
        }
      >
        <ReportAsyncBoundary
          isPending={query.isPending}
          error={query.error}
          isEmpty={!report?.byAgent.length}
          loadingLabel="Loading agent profitability"
          errorTitle="Unable to load profitability report"
          emptyTitle="No agent activity"
          emptyDescription="No sales were recorded for the selected filters."
        >
          <Table className="w-full border-collapse">
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className={HEAD_CLASS}>Agent</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Sales</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Revenue</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Gross Profit</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.byAgent.map((row) => (
                <TableRow key={row.agentName} className="hover:bg-muted/15">
                  <TableCell className="px-4 py-3 font-medium text-foreground">{row.agentName}</TableCell>
                  <TableCell className="px-4 py-3 text-right">{formatNumber(row.salesCount)}</TableCell>
                  <TableCell className="px-4 py-3 text-right font-medium">{formatMoney(row.revenue)}</TableCell>
                  <TableCell className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-300">{formatMoney(row.grossProfit)}</TableCell>
                  <TableCell className="px-4 py-3 text-right">{formatPercent(row.grossMarginPercent)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ReportAsyncBoundary>
      </ReportSection>
    </div>
  )
}
