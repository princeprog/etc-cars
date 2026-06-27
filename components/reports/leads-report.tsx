"use client"

import {
  HandshakeIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  UsersRoundIcon,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLeadsReportQuery } from "@/hooks/queries/reports/use-leads-report-query"
import type { LeadStatusBreakdown, ReportFilters } from "@/types/reports"
import { ReportAsyncBoundary } from "./report-async-boundary"
import { ReportExportButton } from "./report-export-button"
import { ReportSection } from "./report-section"
import { ReportSummaryCardGrid } from "./report-summary-card"
import { formatNumber, formatPercent } from "./report-format"

const HEAD_CLASS = "px-4 text-xs font-semibold text-foreground/80"

function PipelineTable({
  rows,
  total,
}: {
  rows: LeadStatusBreakdown[]
  total: number
}) {
  return (
    <Table className="w-full border-collapse">
      <TableHeader className="bg-muted/30">
        <TableRow className="hover:bg-transparent">
          <TableHead className={HEAD_CLASS}>Status</TableHead>
          <TableHead className={`${HEAD_CLASS} text-right`}>Leads</TableHead>
          <TableHead className={`${HEAD_CLASS} text-right`}>Share</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.status} className="hover:bg-muted/15">
            <TableCell className="px-4 py-3 font-medium text-foreground">{row.status}</TableCell>
            <TableCell className="px-4 py-3 text-right">{formatNumber(row.count)}</TableCell>
            <TableCell className="px-4 py-3 text-right text-muted-foreground">
              {formatPercent(total ? (row.count / total) * 100 : 0)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function LeadsReport({
  filters,
  enabled,
}: {
  filters: ReportFilters
  enabled: boolean
}) {
  const query = useLeadsReportQuery(filters, enabled)
  const report = query.data
  const conversion = report?.conversion

  const summaryCards = [
    {
      title: "Buyer Leads",
      value: formatNumber(conversion?.totalBuyerLeads),
      caption: `${formatNumber(conversion?.buyerActive)} still active`,
      icon: ShoppingBagIcon,
    },
    {
      title: "Buyer Conversion",
      value: formatPercent(conversion?.buyerConversionRate),
      caption: `${formatNumber(conversion?.buyerWon)} won`,
      icon: TrendingUpIcon,
    },
    {
      title: "Seller Leads",
      value: formatNumber(conversion?.totalSellerLeads),
      caption: `${formatNumber(conversion?.sellerActive)} still active`,
      icon: UsersRoundIcon,
    },
    {
      title: "Seller Conversion",
      value: formatPercent(conversion?.sellerConversionRate),
      caption: `${formatNumber(conversion?.sellerPurchased)} purchased`,
      icon: HandshakeIcon,
    },
  ]

  return (
    <div className="space-y-5">
      <ReportSummaryCardGrid cards={summaryCards} />

      {report?.basis ? (
        <p className="text-xs text-muted-foreground">{report.basis}</p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <ReportSection
          title="Buyer lead pipeline"
          description="Buyer leads grouped by their current status."
          action={
            <ReportExportButton
              domain="leads"
              dataset="buyer"
              filters={filters}
              label="Export buyer"
              disabled={!report?.buyer.byStatus.length}
            />
          }
        >
          <ReportAsyncBoundary
            isPending={query.isPending}
            error={query.error}
            isEmpty={!report?.buyer.byStatus.length}
            loadingLabel="Loading buyer pipeline"
            errorTitle="Unable to load leads report"
            emptyTitle="No buyer leads"
            emptyDescription="No buyer leads were created in the selected range."
          >
            <PipelineTable
              rows={report?.buyer.byStatus ?? []}
              total={report?.buyer.total ?? 0}
            />
          </ReportAsyncBoundary>
        </ReportSection>

        <ReportSection
          title="Seller lead pipeline"
          description="Seller leads grouped by their current status."
          action={
            <ReportExportButton
              domain="leads"
              dataset="seller"
              filters={filters}
              label="Export seller"
              disabled={!report?.seller.byStatus.length}
            />
          }
        >
          <ReportAsyncBoundary
            isPending={query.isPending}
            error={query.error}
            isEmpty={!report?.seller.byStatus.length}
            loadingLabel="Loading seller pipeline"
            errorTitle="Unable to load leads report"
            emptyTitle="No seller leads"
            emptyDescription="No seller leads were created in the selected range."
          >
            <PipelineTable
              rows={report?.seller.byStatus ?? []}
              total={report?.seller.total ?? 0}
            />
          </ReportAsyncBoundary>
        </ReportSection>
      </div>
    </div>
  )
}
