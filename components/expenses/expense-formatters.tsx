import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type {
  ExpenseDisplayStatus,
  ExpenseFrequency,
  ExpenseSettlementStatus,
} from "@/types/expenses"

export function formatMoney(value?: string | null) {
  if (!value) {
    return "N/A"
  }

  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return `PHP ${value}`
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "N/A"
  }

  return format(new Date(value), "MMM d, yyyy")
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "N/A"
  }

  return format(new Date(value), "MMM d, yyyy h:mm a")
}

export function formatStatus(status: ExpenseDisplayStatus | ExpenseSettlementStatus) {
  switch (status) {
    case "due_today":
      return "Due Today"
    case "due_soon":
      return "Due Soon"
    case "overdue":
      return "Overdue"
    case "upcoming":
      return "Upcoming"
    case "paid":
      return "Paid"
    case "void":
      return "Void"
    case "unpaid":
      return "Unpaid"
  }
}

export function formatFrequency(frequency: ExpenseFrequency) {
  switch (frequency) {
    case "one_time":
      return "One-time"
    case "weekly":
      return "Weekly"
    case "monthly":
      return "Monthly"
    case "yearly":
      return "Yearly"
  }
}

export function ExpenseStatusBadge({
  status,
  className,
}: {
  status: ExpenseDisplayStatus | ExpenseSettlementStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        getExpenseStatusClassName(status),
        className,
      )}
    >
      {formatStatus(status)}
    </Badge>
  )
}

export function getExpenseStatusClassName(
  status: ExpenseDisplayStatus | ExpenseSettlementStatus,
) {
  switch (status) {
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
    case "due_today":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
    case "due_soon":
      return "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300"
    case "overdue":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
    case "void":
      return "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400"
    case "upcoming":
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300"
    case "unpaid":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
  }
}
