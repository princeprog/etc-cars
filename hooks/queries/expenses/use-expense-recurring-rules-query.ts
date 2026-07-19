"use client"

import { useQuery } from "@tanstack/react-query"

import { getExpenseRecurringRules } from "@/services/expenses.service"
import type { ExpenseRecurringRuleFilters } from "@/types/expenses"
import { expensesQueryKeys } from "./expenses-query-keys"

export function useExpenseRecurringRulesQuery(
  filters: ExpenseRecurringRuleFilters = {},
) {
  return useQuery({
    queryKey: expensesQueryKeys.recurringRules(filters),
    queryFn: () => getExpenseRecurringRules(filters),
    retry: false,
  })
}
