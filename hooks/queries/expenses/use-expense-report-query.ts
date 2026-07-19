"use client"

import { useQuery } from "@tanstack/react-query"

import { getExpenseReport } from "@/services/expenses.service"
import type { ExpenseReportFilters } from "@/types/expenses"
import { expensesQueryKeys } from "./expenses-query-keys"

export function useExpenseReportQuery(
  filters: ExpenseReportFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: expensesQueryKeys.report(filters),
    queryFn: () => getExpenseReport(filters),
    enabled,
    retry: false,
  })
}
