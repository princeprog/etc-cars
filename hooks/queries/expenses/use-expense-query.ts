"use client"

import { useQuery } from "@tanstack/react-query"

import { getExpense } from "@/services/expenses.service"
import { expensesQueryKeys } from "./expenses-query-keys"

export function useExpenseQuery(id: string | null) {
  return useQuery({
    queryKey: expensesQueryKeys.detail(id ?? ""),
    queryFn: () => getExpense(id ?? ""),
    enabled: Boolean(id),
    retry: false,
  })
}
