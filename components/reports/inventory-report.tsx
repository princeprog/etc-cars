"use client"

import {
  CarFrontIcon,
  CircleCheckIcon,
  ClockIcon,
  WalletIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useInventoryReportQuery } from "@/hooks/queries/reports/use-inventory-report-query"
import type { ReportFilters } from "@/types/reports"
import { ReportAsyncBoundary } from "./report-async-boundary"
import { ReportExportButton } from "./report-export-button"
import { ReportSection } from "./report-section"
import { ReportSummaryCardGrid } from "./report-summary-card"
import { formatMoney, formatNumber, formatPercent } from "./report-format"

const HEAD_CLASS = "px-4 text-xs font-semibold text-foreground/80"

const STATUS_BADGE: Record<string, string> = {
  Available:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  Reserved:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  Sold: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300",
  Incoming:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  Reconditioning:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300",
}

export function InventoryReport({
  filters,
  enabled,
}: {
  filters: ReportFilters
  enabled: boolean
}) {
  const query = useInventoryReportQuery(filters, enabled)
  const report = query.data
  const summary = report?.summary

  const summaryCards = [
    {
      title: "Total Units",
      value: formatNumber(summary?.totalUnits),
      caption: `${formatNumber(summary?.activeUnits)} active (unsold)`,
      icon: CarFrontIcon,
    },
    {
      title: "Available",
      value: formatNumber(summary?.available),
      caption: `${formatNumber(summary?.reserved)} reserved`,
      icon: CircleCheckIcon,
    },
    {
      title: "Sold",
      value: formatNumber(summary?.sold),
      caption: `${formatNumber(summary?.incoming)} incoming`,
      icon: ClockIcon,
    },
    {
      title: "Active Inventory Value",
      value: formatMoney(summary?.totalInventoryValue),
      caption: "Purchase cost of unsold stock",
      icon: WalletIcon,
    },
  ]

  return (
    <div className="space-y-5">
      <ReportSummaryCardGrid cards={summaryCards} />

      {report?.basis ? (
        <p className="text-xs text-muted-foreground">{report.basis}</p>
      ) : null}

      <ReportSection
        title="Vehicles by status"
        description="Current distribution of inventory across the pipeline."
        action={
          <ReportExportButton
            domain="inventory"
            dataset="by-status"
            filters={filters}
            label="Export status"
            disabled={!report?.byStatus.length}
          />
        }
      >
        <ReportAsyncBoundary
          isPending={query.isPending}
          error={query.error}
          isEmpty={!report?.byStatus.length}
          loadingLabel="Loading inventory status"
          errorTitle="Unable to load inventory report"
          emptyTitle="No vehicles in inventory"
          emptyDescription="Add vehicles to inventory to see status distribution."
        >
          <Table className="w-full border-collapse">
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className={HEAD_CLASS}>Status</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Vehicles</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.byStatus.map((row) => (
                <TableRow key={row.status} className="hover:bg-muted/15">
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_BADGE[row.status] ?? ""}`}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right font-medium">{formatNumber(row.count)}</TableCell>
                  <TableCell className="px-4 py-3 text-right text-muted-foreground">{formatPercent(row.percentage)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ReportAsyncBoundary>
      </ReportSection>

      <ReportSection
        title="Inventory age"
        description="How long active (unsold) units have been in the system."
        action={
          <ReportExportButton
            domain="inventory"
            dataset="aging"
            filters={filters}
            label="Export aging"
            disabled={!report?.aging.length}
          />
        }
      >
        <ReportAsyncBoundary
          isPending={query.isPending}
          error={query.error}
          isEmpty={!report?.aging.length}
          loadingLabel="Loading inventory aging"
          errorTitle="Unable to load inventory report"
          emptyTitle="No active inventory"
          emptyDescription="All units are sold or none are in stock yet."
        >
          <Table className="w-full border-collapse">
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className={HEAD_CLASS}>Inventory age</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Vehicles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.aging.map((row) => (
                <TableRow key={row.bucket} className="hover:bg-muted/15">
                  <TableCell className="px-4 py-3 font-medium text-foreground">{row.bucket}</TableCell>
                  <TableCell className="px-4 py-3 text-right">{formatNumber(row.count)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ReportAsyncBoundary>
      </ReportSection>

      <ReportSection
        title="Inventory by brand"
        description="Unit counts per brand across key statuses."
        action={
          <ReportExportButton
            domain="inventory"
            dataset="by-brand"
            filters={filters}
            label="Export brands"
            disabled={!report?.byBrand.length}
          />
        }
      >
        <ReportAsyncBoundary
          isPending={query.isPending}
          error={query.error}
          isEmpty={!report?.byBrand.length}
          loadingLabel="Loading brand breakdown"
          errorTitle="Unable to load inventory report"
          emptyTitle="No vehicles in inventory"
          emptyDescription="Add vehicles to inventory to see brand distribution."
        >
          <Table className="w-full border-collapse">
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className={HEAD_CLASS}>Brand</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Total</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Available</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Reserved</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.byBrand.map((row) => (
                <TableRow key={row.brand} className="hover:bg-muted/15">
                  <TableCell className="px-4 py-3 font-medium text-foreground">{row.brand}</TableCell>
                  <TableCell className="px-4 py-3 text-right font-medium">{formatNumber(row.total)}</TableCell>
                  <TableCell className="px-4 py-3 text-right">{formatNumber(row.available)}</TableCell>
                  <TableCell className="px-4 py-3 text-right">{formatNumber(row.reserved)}</TableCell>
                  <TableCell className="px-4 py-3 text-right">{formatNumber(row.sold)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ReportAsyncBoundary>
      </ReportSection>
    </div>
  )
}
