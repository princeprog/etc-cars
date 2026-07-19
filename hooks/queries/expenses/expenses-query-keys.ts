import type {
  ExpenseListFilters,
  ExpenseRecurringRuleFilters,
  ExpenseReportFilters,
} from "@/types/expenses"

export const expensesQueryKeys = {
  all: ["expenses"] as const,
  lists: () => [...expensesQueryKeys.all, "list"] as const,
  filteredList: (filters: ExpenseListFilters) =>
    [...expensesQueryKeys.lists(), filters] as const,
  detail: (id: string) => [...expensesQueryKeys.all, "detail", id] as const,
  categories: (includeInactive = false) =>
    [...expensesQueryKeys.all, "categories", includeInactive] as const,
  recurringRules: (filters: ExpenseRecurringRuleFilters) =>
    [...expensesQueryKeys.all, "recurring-rules", filters] as const,
  report: (filters: ExpenseReportFilters) =>
    [...expensesQueryKeys.all, "report", filters] as const,
}
