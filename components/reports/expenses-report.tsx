"use client"

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  Clock3Icon,
  ReceiptTextIcon,
} from "lucide-react"

import { ExpenseStatusBadge } from "@/components/expenses/expense-formatters"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useExpenseReportQuery } from "@/hooks/queries/expenses/use-expense-report-query"
import type { ExpenseReportFilters } from "@/types/expenses"
import { ExpenseReportExportButton } from "./expense-report-export-button"
import { formatMoney, formatNumber } from "./report-format"
import { ReportAsyncBoundary } from "./report-async-boundary"
import { ReportSection } from "./report-section"
import { ReportSummaryCardGrid } from "./report-summary-card"

const HEAD_CLASS = "px-4 text-xs font-semibold text-foreground/80"

export function ExpensesReport({
  filters,
  enabled,
}: {
  filters: ExpenseReportFilters
  enabled: boolean
}) {
  const query = useExpenseReportQuery(filters, enabled)
  const report = query.data
  const summary = report?.summary

  const summaryCards = [
    {
      title: "Expected Expenses",
      value: formatMoney(summary?.totalExpectedAmount),
      caption: `${formatNumber(summary?.totalExpenses)} bills in range`,
      icon: ReceiptTextIcon,
      iconWrapClassName: "bg-cyan-50 text-cyan-700",
    },
    {
      title: "Paid Amount",
      value: formatMoney(summary?.paidAmount),
      caption: "Settled operating costs",
      icon: CheckCircle2Icon,
      iconWrapClassName: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Unpaid Amount",
      value: formatMoney(summary?.unpaidAmount),
      caption: `${formatNumber(summary?.dueWithinSevenDaysCount)} due within 7 days`,
      icon: Clock3Icon,
      iconWrapClassName: "bg-amber-50 text-amber-700",
    },
    {
      title: "Overdue",
      value: formatMoney(summary?.overdueAmount),
      caption: `${formatNumber(summary?.overdueCount)} overdue bills`,
      icon: AlertCircleIcon,
      iconWrapClassName: "bg-rose-50 text-rose-700",
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <ReportSummaryCardGrid cards={summaryCards} />

      <ReportSection
        title="Expense by category"
        description="Expected, paid, and unpaid amount grouped by category."
        action={
          <ExpenseReportExportButton
            dataset="by-category"
            filters={filters}
            label="Export categories"
            disabled={!report?.byCategory.length}
          />
        }
      >
        <ReportAsyncBoundary
          isPending={query.isPending}
          error={query.error}
          isEmpty={!report?.byCategory.length}
          loadingLabel="Loading expense categories"
          errorTitle="Unable to load expense report"
          emptyTitle="No expenses in this range"
          emptyDescription="Add expenses or adjust the report date range."
        >
          <Table className="w-full border-collapse">
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className={HEAD_CLASS}>Category</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Bills</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Expected</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Paid</TableHead>
                <TableHead className={`${HEAD_CLASS} text-right`}>Unpaid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.byCategory.map((row) => (
                <TableRow key={row.categoryId} className="hover:bg-muted/15">
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {row.categoryName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {formatNumber(row.count)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right font-medium">
                    {formatMoney(row.expectedAmount)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-300">
                    {formatMoney(row.paidAmount)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-amber-600 dark:text-amber-300">
                    {formatMoney(row.unpaidAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ReportAsyncBoundary>
      </ReportSection>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <ReportSection
          title="Overdue bills"
          description="Open expenses past due date."
          action={
            <ExpenseReportExportButton
              dataset="overdue"
              filters={filters}
              label="Export overdue"
              disabled={!report?.overdue.length}
            />
          }
        >
          <ReportAsyncBoundary
            isPending={query.isPending}
            error={query.error}
            isEmpty={!report?.overdue.length}
            loadingLabel="Loading overdue expenses"
            errorTitle="Unable to load overdue expenses"
            emptyTitle="No overdue bills"
            emptyDescription="No open bills are currently past due for this range."
          >
            <Table className="w-full border-collapse">
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className={HEAD_CLASS}>Bill</TableHead>
                  <TableHead className={`${HEAD_CLASS} text-right`}>Due</TableHead>
                  <TableHead className={`${HEAD_CLASS} text-right`}>Amount</TableHead>
                  <TableHead className={`${HEAD_CLASS} text-right`}>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report?.overdue.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/15">
                    <TableCell className="px-4 py-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="truncate font-medium text-foreground">
                          {row.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.categoryName} · {row.assignedStaffName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {row.dueDate}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-medium">
                      {formatMoney(row.expectedAmount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <ExpenseStatusBadge status={row.displayStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportAsyncBoundary>
        </ReportSection>

        <ReportSection
          title="Monthly trend"
          description="Expense movement by month."
          action={
            <ExpenseReportExportButton
              dataset="monthly-trend"
              filters={filters}
              label="Export trend"
              disabled={!report?.monthlyTrend.length}
            />
          }
        >
          <ReportAsyncBoundary
            isPending={query.isPending}
            error={query.error}
            isEmpty={!report?.monthlyTrend.length}
            loadingLabel="Loading monthly trend"
            errorTitle="Unable to load monthly trend"
            emptyTitle="No monthly expense trend"
            emptyDescription="No expenses were found for the selected range."
          >
            <Table className="w-full border-collapse">
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className={HEAD_CLASS}>Month</TableHead>
                  <TableHead className={`${HEAD_CLASS} text-right`}>Bills</TableHead>
                  <TableHead className={`${HEAD_CLASS} text-right`}>Expected</TableHead>
                  <TableHead className={`${HEAD_CLASS} text-right`}>Unpaid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report?.monthlyTrend.map((row) => (
                  <TableRow key={row.month} className="hover:bg-muted/15">
                    <TableCell className="px-4 py-3 font-medium text-foreground">
                      {row.month}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {formatNumber(row.count)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-medium">
                      {formatMoney(row.expectedAmount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-amber-600 dark:text-amber-300">
                      {formatMoney(row.unpaidAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportAsyncBoundary>
        </ReportSection>
      </div>
    </div>
  )
}
