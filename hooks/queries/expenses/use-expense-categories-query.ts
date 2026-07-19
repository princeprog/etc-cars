"use client"

import { useQuery } from "@tanstack/react-query"

import { getExpenseCategories } from "@/services/expenses.service"
import { expensesQueryKeys } from "./expenses-query-keys"

export function useExpenseCategoriesQuery(includeInactive = false) {
  return useQuery({
    queryKey: expensesQueryKeys.categories(includeInactive),
    queryFn: () => getExpenseCategories(includeInactive),
    staleTime: 60_000,
    retry: false,
  })
}
