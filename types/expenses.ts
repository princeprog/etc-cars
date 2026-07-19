export type ExpenseSettlementStatus = "unpaid" | "paid" | "void"

export type ExpenseDisplayStatus =
  | "unpaid"
  | "paid"
  | "void"
  | "overdue"
  | "due_today"
  | "due_soon"
  | "upcoming"

export type ExpenseFrequency = "one_time" | "weekly" | "monthly" | "yearly"
export type ExpenseRuleFrequency = Exclude<ExpenseFrequency, "one_time">

export interface ExpenseCategory {
  id: string
  name: string
  description: string | null
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ExpenseStaffSummary {
  id: string
  fullName: string
  email: string
  active: boolean
}

export interface Expense {
  id: string
  recurringRuleId: string | null
  billingPeriodKey: string | null
  title: string
  categoryId: string
  category: ExpenseCategory
  expectedAmount: string
  actualPaidAmount: string | null
  expenseDate: string | null
  dueDate: string
  paidAt: string | null
  status: ExpenseSettlementStatus
  displayStatus: ExpenseDisplayStatus
  frequency: ExpenseFrequency
  vendorName: string | null
  assignedStaffId: string | null
  assignedStaff: ExpenseStaffSummary | null
  paymentMethod: string | null
  referenceNumber: string | null
  notes: string | null
  voidedAt: string | null
  voidReason: string | null
  createdByUserId: string
  updatedByUserId: string | null
  createdAt: string
  updatedAt: string
}

export interface ExpenseRecurringRule {
  id: string
  title: string
  categoryId: string
  category: ExpenseCategory
  expectedAmount: string
  frequency: ExpenseRuleFrequency
  dueDay: number
  startDate: string
  endDate: string | null
  vendorName: string | null
  assignedStaffId: string | null
  assignedStaff: ExpenseStaffSummary | null
  notes: string | null
  isActive: boolean
  createdByUserId: string
  updatedByUserId: string | null
  createdAt: string
  updatedAt: string
}

export interface ExpenseListFilters {
  page?: number
  pageSize?: number
  search?: string
  status?: ExpenseDisplayStatus | "all"
  categoryId?: string
  frequency?: ExpenseFrequency | "all"
  assignedStaffId?: string
  startDate?: string
  endDate?: string
  sortBy?: "dueDate" | "title" | "amount" | "createdAt"
  sortOrder?: "asc" | "desc"
}

export interface ExpenseListResponse {
  expenses: Expense[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ExpenseResponse {
  expense: Expense
}

export interface ExpenseCategoriesResponse {
  categories: ExpenseCategory[]
}

export interface ExpenseCategoryResponse {
  category: ExpenseCategory
}

export interface ExpenseRecurringRulesResponse {
  rules: ExpenseRecurringRule[]
}

export interface ExpenseRecurringRuleResponse {
  rule: ExpenseRecurringRule
}

export interface CreateExpensePayload {
  title?: string
  categoryId?: string
  expectedAmount?: string
  expenseDate?: string | null
  dueDate?: string
  frequency?: "one_time"
  vendorName?: string | null
  assignedStaffId?: string | null
  notes?: string | null
}

export type UpdateExpensePayload = Omit<CreateExpensePayload, "frequency">

export interface MarkExpensePaidPayload {
  actualPaidAmount?: string
  paidAt?: string
  paymentMethod?: string | null
  referenceNumber?: string | null
  notes?: string | null
}

export interface VoidExpensePayload {
  reason?: string
}

export interface CreateExpenseCategoryPayload {
  name?: string
  description?: string | null
}

export interface UpdateExpenseCategoryPayload {
  name?: string
  description?: string | null
  isActive?: boolean
}

export interface ExpenseRecurringRuleFilters {
  search?: string
  categoryId?: string
  frequency?: ExpenseRuleFrequency | "all"
  assignedStaffId?: string
  includeInactive?: boolean
}

export interface CreateExpenseRecurringRulePayload {
  title?: string
  categoryId?: string
  expectedAmount?: string
  frequency?: ExpenseRuleFrequency
  dueDay?: number
  startDate?: string
  endDate?: string | null
  vendorName?: string | null
  assignedStaffId?: string | null
  notes?: string | null
}

export interface UpdateExpenseRecurringRulePayload
  extends Partial<CreateExpenseRecurringRulePayload> {
  isActive?: boolean
}

export interface ExpenseReportFilters {
  startDate?: string
  endDate?: string
  categoryId?: string
  status?: ExpenseDisplayStatus | "all"
  paymentMethod?: string
  vendorName?: string
  assignedStaffId?: string
}

export interface ExpenseReportSummary {
  totalExpenses: number
  totalExpectedAmount: string
  paidAmount: string
  unpaidAmount: string
  overdueCount: number
  overdueAmount: string
  dueWithinSevenDaysCount: number
  dueWithinSevenDaysAmount: string
  highestSpendingCategory: ExpenseCategoryBreakdown | null
  asOfDate: string
}

export interface ExpenseCategoryBreakdown {
  categoryId: string
  categoryName: string
  count: number
  expectedAmount: string
  paidAmount: string
  unpaidAmount: string
}

export interface ExpenseSettlementBreakdown {
  status: ExpenseSettlementStatus
  count: number
  expectedAmount: string
  paidAmount: string
}

export interface ExpenseReportItem {
  id: string
  title: string
  categoryId: string
  categoryName: string
  expectedAmount: string
  actualPaidAmount: string | null
  dueDate: string
  paidAt: string | null
  vendorName: string | null
  paymentMethod: string | null
  assignedStaffId: string | null
  assignedStaffName: string
  status: ExpenseSettlementStatus
  displayStatus: ExpenseDisplayStatus
}

export interface ExpenseMonthlyTrendPoint {
  month: string
  count: number
  expectedAmount: string
  paidAmount: string
  unpaidAmount: string
}

export interface ExpenseReportResponse {
  filters: {
    startDate: string | null
    endDate: string | null
    categoryId: string | null
    status: string | null
    paymentMethod: string | null
    vendorName: string | null
    assignedStaffId: string | null
  }
  summary: ExpenseReportSummary
  byCategory: ExpenseCategoryBreakdown[]
  paidVsUnpaid: ExpenseSettlementBreakdown[]
  overdue: ExpenseReportItem[]
  monthlyTrend: ExpenseMonthlyTrendPoint[]
}

export type ExpenseExportDataset =
  | "by-category"
  | "overdue"
  | "monthly-trend"
