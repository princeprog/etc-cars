"use client"

import Link from "next/link"
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  Clock3Icon,
  ReceiptTextIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { DashboardMetrics } from "@/types/dashboard"

function formatCompactCurrency(value?: string | null) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value ?? 0))
}

export function ExpenseOverviewPanel({
  expenses,
}: {
  expenses: DashboardMetrics["expenses"]
}) {
  if (!expenses) {
    return null
  }

  const items = [
    {
      label: "Expected Expenses",
      value: formatCompactCurrency(expenses.totalExpectedAmount),
      supporting: `${expenses.totalExpenses.toLocaleString()} bills this month`,
      icon: ReceiptTextIcon,
      className: "text-cyan-700 bg-cyan-50",
    },
    {
      label: "Paid",
      value: formatCompactCurrency(expenses.paidAmount),
      supporting: "Settled balance",
      icon: CheckCircle2Icon,
      className: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Unpaid",
      value: formatCompactCurrency(expenses.unpaidAmount),
      supporting: `${expenses.dueWithinSevenDaysCount} due within 7 days`,
      icon: Clock3Icon,
      className: "text-amber-700 bg-amber-50",
    },
    {
      label: "Overdue",
      value: formatCompactCurrency(expenses.overdueAmount),
      supporting: `${expenses.overdueCount} bills need attention`,
      icon: AlertCircleIcon,
      className: "text-rose-700 bg-rose-50",
    },
  ]

  return (
    <Card className="rounded-lg p-0 shadow-none">
      <CardContent className="grid gap-0 p-0 lg:grid-cols-[minmax(220px,0.9fr)_minmax(0,2.1fr)]">
        <div className="flex flex-col justify-between gap-4 border-b p-4 lg:border-r lg:border-b-0">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">
              Monthly Expense Control
            </p>
            <p className="text-sm text-muted-foreground">
              Operating bills, due reminders, and unpaid balance at a glance.
            </p>
          </div>
          <Link
            href="/bills-expenses"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            Open bills
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
        <div className="grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon

            return (
              <div key={item.label} className="flex items-center gap-3 p-4">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${item.className}`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="truncate text-xl font-semibold text-foreground">
                    {item.value}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.supporting}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
