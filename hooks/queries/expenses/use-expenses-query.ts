"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { getExpenses } from "@/services/expenses.service"
import type { ExpenseListFilters } from "@/types/expenses"
import { expensesQueryKeys } from "./expenses-query-keys"

export function useExpensesQuery(filters: ExpenseListFilters = {}) {
  return useQuery({
    queryKey: expensesQueryKeys.filteredList(filters),
    queryFn: () => getExpenses(filters),
    placeholderData: keepPreviousData,
    retry: false,
  })
}
