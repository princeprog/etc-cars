import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest, authenticatedFetch } from "@/services/api-service"
import { AppApiError } from "@/types/api"
import type {
  CreateExpenseCategoryPayload,
  CreateExpensePayload,
  CreateExpenseRecurringRulePayload,
  ExpenseCategoriesResponse,
  ExpenseCategoryResponse,
  ExpenseExportDataset,
  ExpenseListFilters,
  ExpenseListResponse,
  ExpenseRecurringRuleFilters,
  ExpenseRecurringRuleResponse,
  ExpenseRecurringRulesResponse,
  ExpenseReportFilters,
  ExpenseReportResponse,
  ExpenseResponse,
  MarkExpensePaidPayload,
  UpdateExpenseCategoryPayload,
  UpdateExpensePayload,
  UpdateExpenseRecurringRulePayload,
  VoidExpensePayload,
} from "@/types/expenses"

function withQuery(path: string, params: URLSearchParams) {
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

function buildExpenseListParams(filters: ExpenseListFilters = {}) {
  const params = new URLSearchParams()

  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize))
  if (filters.search?.trim()) params.set("search", filters.search.trim())
  if (filters.status && filters.status !== "all") params.set("status", filters.status)
  if (filters.categoryId && filters.categoryId !== "all") params.set("categoryId", filters.categoryId)
  if (filters.frequency && filters.frequency !== "all") params.set("frequency", filters.frequency)
  if (filters.assignedStaffId && filters.assignedStaffId !== "all") {
    params.set("assignedStaffId", filters.assignedStaffId)
  }
  if (filters.startDate) params.set("startDate", filters.startDate)
  if (filters.endDate) params.set("endDate", filters.endDate)
  if (filters.sortBy) params.set("sortBy", filters.sortBy)
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder)

  return params
}

function buildRecurringRuleParams(filters: ExpenseRecurringRuleFilters = {}) {
  const params = new URLSearchParams()

  if (filters.search?.trim()) params.set("search", filters.search.trim())
  if (filters.categoryId && filters.categoryId !== "all") params.set("categoryId", filters.categoryId)
  if (filters.frequency && filters.frequency !== "all") params.set("frequency", filters.frequency)
  if (filters.assignedStaffId && filters.assignedStaffId !== "all") {
    params.set("assignedStaffId", filters.assignedStaffId)
  }
  if (filters.includeInactive) params.set("includeInactive", "true")

  return params
}

function buildExpenseReportParams(filters: ExpenseReportFilters = {}) {
  const params = new URLSearchParams()

  if (filters.startDate) params.set("startDate", filters.startDate)
  if (filters.endDate) params.set("endDate", filters.endDate)
  if (filters.categoryId && filters.categoryId !== "all") params.set("categoryId", filters.categoryId)
  if (filters.status && filters.status !== "all") params.set("status", filters.status)
  if (filters.paymentMethod?.trim()) params.set("paymentMethod", filters.paymentMethod.trim())
  if (filters.vendorName?.trim()) params.set("vendorName", filters.vendorName.trim())
  if (filters.assignedStaffId && filters.assignedStaffId !== "all") {
    params.set("assignedStaffId", filters.assignedStaffId)
  }

  return params
}

export function getExpenses(filters: ExpenseListFilters = {}) {
  return apiRequest<ExpenseListResponse>(
    withQuery(API_ENDPOINTS.expenses.root, buildExpenseListParams(filters)),
  )
}

export function getExpense(id: string) {
  return apiRequest<ExpenseResponse>(API_ENDPOINTS.expenses.byId(id))
}

export function createExpense(payload: CreateExpensePayload) {
  return apiRequest<ExpenseResponse, CreateExpensePayload>(
    API_ENDPOINTS.expenses.root,
    {
      method: "POST",
      body: payload,
    },
  )
}

export function updateExpense(id: string, payload: UpdateExpensePayload) {
  return apiRequest<ExpenseResponse, UpdateExpensePayload>(
    API_ENDPOINTS.expenses.byId(id),
    {
      method: "PATCH",
      body: payload,
    },
  )
}

export function markExpensePaid(id: string, payload: MarkExpensePaidPayload) {
  return apiRequest<ExpenseResponse, MarkExpensePaidPayload>(
    API_ENDPOINTS.expenses.markPaid(id),
    {
      method: "POST",
      body: payload,
    },
  )
}

export function voidExpense(id: string, payload: VoidExpensePayload) {
  return apiRequest<ExpenseResponse, VoidExpensePayload>(
    API_ENDPOINTS.expenses.void(id),
    {
      method: "POST",
      body: payload,
    },
  )
}

export function getExpenseCategories(includeInactive = false) {
  const params = new URLSearchParams()
  if (includeInactive) params.set("includeInactive", "true")

  return apiRequest<ExpenseCategoriesResponse>(
    withQuery(API_ENDPOINTS.expenseCategories.root, params),
  )
}

export function createExpenseCategory(payload: CreateExpenseCategoryPayload) {
  return apiRequest<ExpenseCategoryResponse, CreateExpenseCategoryPayload>(
    API_ENDPOINTS.expenseCategories.root,
    {
      method: "POST",
      body: payload,
    },
  )
}

export function updateExpenseCategory(
  id: string,
  payload: UpdateExpenseCategoryPayload,
) {
  return apiRequest<ExpenseCategoryResponse, UpdateExpenseCategoryPayload>(
    API_ENDPOINTS.expenseCategories.byId(id),
    {
      method: "PATCH",
      body: payload,
    },
  )
}

export function getExpenseRecurringRules(
  filters: ExpenseRecurringRuleFilters = {},
) {
  return apiRequest<ExpenseRecurringRulesResponse>(
    withQuery(
      API_ENDPOINTS.expenseRecurringRules.root,
      buildRecurringRuleParams(filters),
    ),
  )
}

export function createExpenseRecurringRule(
  payload: CreateExpenseRecurringRulePayload,
) {
  return apiRequest<
    ExpenseRecurringRuleResponse,
    CreateExpenseRecurringRulePayload
  >(API_ENDPOINTS.expenseRecurringRules.root, {
    method: "POST",
    body: payload,
  })
}

export function updateExpenseRecurringRule(
  id: string,
  payload: UpdateExpenseRecurringRulePayload,
) {
  return apiRequest<
    ExpenseRecurringRuleResponse,
    UpdateExpenseRecurringRulePayload
  >(API_ENDPOINTS.expenseRecurringRules.byId(id), {
    method: "PATCH",
    body: payload,
  })
}

export function deactivateExpenseRecurringRule(id: string) {
  return apiRequest<ExpenseRecurringRuleResponse>(
    API_ENDPOINTS.expenseRecurringRules.deactivate(id),
    {
      method: "POST",
    },
  )
}

export function getExpenseReport(filters: ExpenseReportFilters = {}) {
  return apiRequest<ExpenseReportResponse>(
    withQuery(API_ENDPOINTS.expenseReports.monthly, buildExpenseReportParams(filters)),
  )
}

export async function downloadExpenseReportCsv(
  dataset: ExpenseExportDataset,
  filters: ExpenseReportFilters = {},
) {
  const params = buildExpenseReportParams(filters)
  params.set("dataset", dataset)

  const response = await authenticatedFetch(
    withQuery(API_ENDPOINTS.expenseReports.export, params),
    {
      method: "GET",
    },
  )

  if (!response.ok) {
    throw new AppApiError(
      "Unable to export expense report. Please try again.",
      response.status,
    )
  }

  const blob = await response.blob()
  const filename = parseFilename(response) ?? `etc-expenses-${dataset}.csv`
  triggerBlobDownload(blob, filename)
}

function parseFilename(response: Response) {
  const disposition = response.headers.get("content-disposition")
  if (!disposition) {
    return null
  }

  const match = /filename="?([^"]+)"?/i.exec(disposition)
  return match?.[1] ?? null
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(url)
}
