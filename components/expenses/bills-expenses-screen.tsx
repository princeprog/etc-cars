"use client"

import * as React from "react"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  Clock3Icon,
  FileTextIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  ReceiptTextIcon,
  RefreshCcwIcon,
  Repeat2Icon,
  SearchIcon,
  ShieldCheckIcon,
  Trash2Icon,
  WalletCardsIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ListPagination } from "@/components/operations/list-pagination"
import { SubmitButton } from "@/components/operations/submit-button"
import {
  ExpenseStatusBadge,
  formatDate,
  formatFrequency,
  formatMoney,
} from "@/components/expenses/expense-formatters"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateExpenseMutation,
  useCreateExpenseRecurringRuleMutation,
  useDeactivateExpenseRecurringRuleMutation,
  useMarkExpensePaidMutation,
  useUpdateExpenseMutation,
  useUpdateExpenseRecurringRuleMutation,
  useVoidExpenseMutation,
} from "@/hooks/mutations/expenses/use-expense-mutations"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useUsersQuery } from "@/hooks/queries/auth/use-users-query"
import { useExpenseCategoriesQuery } from "@/hooks/queries/expenses/use-expense-categories-query"
import { useExpenseRecurringRulesQuery } from "@/hooks/queries/expenses/use-expense-recurring-rules-query"
import { useExpenseReportQuery } from "@/hooks/queries/expenses/use-expense-report-query"
import { useExpensesQuery } from "@/hooks/queries/expenses/use-expenses-query"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/types/api"
import type { AuthenticatedUser } from "@/types/auth"
import type {
  Expense,
  ExpenseDisplayStatus,
  ExpenseFrequency,
  ExpenseRecurringRule,
  ExpenseRuleFrequency,
} from "@/types/expenses"

type ExpenseFormValues = {
  title: string
  categoryId: string
  expectedAmount: string
  expenseDate: string
  dueDate: string
  vendorName: string
  assignedStaffId: string
  notes: string
}

type RecurringFormValues = ExpenseFormValues & {
  frequency: ExpenseRuleFrequency
  dueDay: string
  startDate: string
  endDate: string
}

type PaidFormValues = {
  actualPaidAmount: string
  paidAt: string
  paymentMethod: string
  referenceNumber: string
  notes: string
}

type BillStatusFilter = ExpenseDisplayStatus | "all"
type BillFrequencyFilter = ExpenseFrequency | "all"

const PAGE_SIZE = 12
const ALL_VALUE = "all"

const STATUS_OPTIONS: Array<{ value: BillStatusFilter; label: string }> = [
  { value: "all", label: "All status" },
  { value: "overdue", label: "Overdue" },
  { value: "due_today", label: "Due today" },
  { value: "due_soon", label: "Due soon" },
  { value: "upcoming", label: "Upcoming" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "void", label: "Void" },
]

const FREQUENCY_OPTIONS: Array<{ value: BillFrequencyFilter; label: string }> = [
  { value: "all", label: "All frequency" },
  { value: "one_time", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
]

const RECURRING_FREQUENCY_OPTIONS: Array<{
  value: ExpenseRuleFrequency
  label: string
}> = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
]

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function nowLocalInputValue() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function getEmptyExpenseForm(): ExpenseFormValues {
  return {
    title: "",
    categoryId: "",
    expectedAmount: "",
    expenseDate: "",
    dueDate: todayInputValue(),
    vendorName: "",
    assignedStaffId: ALL_VALUE,
    notes: "",
  }
}

function getExpenseFormFromRecord(expense: Expense): ExpenseFormValues {
  return {
    title: expense.title,
    categoryId: expense.categoryId,
    expectedAmount: expense.expectedAmount,
    expenseDate: expense.expenseDate ? expense.expenseDate.slice(0, 10) : "",
    dueDate: expense.dueDate.slice(0, 10),
    vendorName: expense.vendorName ?? "",
    assignedStaffId: expense.assignedStaffId ?? ALL_VALUE,
    notes: expense.notes ?? "",
  }
}

function getEmptyRecurringForm(): RecurringFormValues {
  return {
    ...getEmptyExpenseForm(),
    frequency: "monthly",
    dueDay: "1",
    startDate: todayInputValue(),
    endDate: "",
  }
}

function getRecurringFormFromRule(rule: ExpenseRecurringRule): RecurringFormValues {
  return {
    title: rule.title,
    categoryId: rule.categoryId,
    expectedAmount: rule.expectedAmount,
    expenseDate: "",
    dueDate: "",
    vendorName: rule.vendorName ?? "",
    assignedStaffId: rule.assignedStaffId ?? ALL_VALUE,
    notes: rule.notes ?? "",
    frequency: rule.frequency,
    dueDay: String(rule.dueDay),
    startDate: rule.startDate.slice(0, 10),
    endDate: rule.endDate ? rule.endDate.slice(0, 10) : "",
  }
}

function normalizeOptional(value: string) {
  return value.trim() || null
}

function getExpenseFormErrors(values: ExpenseFormValues) {
  const errors: Partial<Record<keyof ExpenseFormValues, string>> = {}

  if (!values.title.trim()) {
    errors.title = "Enter the bill or expense title."
  }

  if (!values.categoryId) {
    errors.categoryId = "Select an expense category."
  }

  if (!values.expectedAmount.trim() || Number(values.expectedAmount) <= 0) {
    errors.expectedAmount = "Enter an amount greater than zero."
  }

  if (!values.dueDate) {
    errors.dueDate = "Select the due date."
  }

  return errors
}

function getRecurringFormErrors(values: RecurringFormValues) {
  const errors = getExpenseFormErrors({
    ...values,
    dueDate: values.startDate,
  }) as Partial<Record<keyof RecurringFormValues, string>>
  const dueDay = Number(values.dueDay)

  if (!values.startDate) {
    errors.startDate = "Select the start date."
  }

  if (!Number.isInteger(dueDay) || dueDay < 1) {
    errors.dueDay = "Enter a valid due day."
  } else if (values.frequency === "weekly" && dueDay > 7) {
    errors.dueDay = "Weekly rules use 1 for Monday through 7 for Sunday."
  } else if (values.frequency !== "weekly" && dueDay > 31) {
    errors.dueDay = "Monthly and yearly rules use day 1 through 31."
  }

  return errors
}

function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean)
}

function toExpensePayload(values: ExpenseFormValues) {
  return {
    title: values.title.trim(),
    categoryId: values.categoryId,
    expectedAmount: values.expectedAmount.trim(),
    expenseDate: values.expenseDate || null,
    dueDate: values.dueDate,
    vendorName: normalizeOptional(values.vendorName),
    assignedStaffId:
      values.assignedStaffId === ALL_VALUE ? null : values.assignedStaffId,
    notes: normalizeOptional(values.notes),
  }
}

function toRecurringPayload(values: RecurringFormValues) {
  return {
    title: values.title.trim(),
    categoryId: values.categoryId,
    expectedAmount: values.expectedAmount.trim(),
    frequency: values.frequency,
    dueDay: Number(values.dueDay),
    startDate: values.startDate,
    endDate: values.endDate || null,
    vendorName: normalizeOptional(values.vendorName),
    assignedStaffId:
      values.assignedStaffId === ALL_VALUE ? null : values.assignedStaffId,
    notes: normalizeOptional(values.notes),
  }
}

export function BillsExpensesScreen() {
  const authQuery = useAuthenticatedUserQuery()
  const currentUser = authQuery.data?.user
  const isAdmin = currentUser?.role === "admin"

  const [activeTab, setActiveTab] = React.useState("bills")
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [status, setStatus] = React.useState<BillStatusFilter>("all")
  const [categoryId, setCategoryId] = React.useState(ALL_VALUE)
  const [frequency, setFrequency] = React.useState<BillFrequencyFilter>("all")
  const [expenseSheetOpen, setExpenseSheetOpen] = React.useState(false)
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null)
  const [expenseForm, setExpenseForm] = React.useState(getEmptyExpenseForm)
  const [expenseFormSubmitted, setExpenseFormSubmitted] = React.useState(false)
  const [recurringSheetOpen, setRecurringSheetOpen] = React.useState(false)
  const [editingRule, setEditingRule] =
    React.useState<ExpenseRecurringRule | null>(null)
  const [recurringForm, setRecurringForm] = React.useState(getEmptyRecurringForm)
  const [recurringFormSubmitted, setRecurringFormSubmitted] =
    React.useState(false)
  const [markPaidExpense, setMarkPaidExpense] = React.useState<Expense | null>(
    null,
  )
  const [voidExpenseTarget, setVoidExpenseTarget] =
    React.useState<Expense | null>(null)
  const [paidForm, setPaidForm] = React.useState<PaidFormValues>({
    actualPaidAmount: "",
    paidAt: nowLocalInputValue(),
    paymentMethod: "",
    referenceNumber: "",
    notes: "",
  })
  const [voidReason, setVoidReason] = React.useState("")

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [search])

  const expenseFilters = React.useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status,
      categoryId,
      frequency,
    }),
    [categoryId, debouncedSearch, frequency, page, status],
  )

  const expensesQuery = useExpensesQuery(expenseFilters)
  const categoriesQuery = useExpenseCategoriesQuery()
  const usersQuery = useUsersQuery({ status: "active" })
  const rulesQuery = useExpenseRecurringRulesQuery({
    search: debouncedSearch || undefined,
    categoryId,
    frequency:
      frequency === "one_time" || frequency === "all" ? "all" : frequency,
  })
  const reportQuery = useExpenseReportQuery({
    status,
    categoryId,
  })

  const createExpenseMutation = useCreateExpenseMutation()
  const updateExpenseMutation = useUpdateExpenseMutation()
  const markPaidMutation = useMarkExpensePaidMutation()
  const voidExpenseMutation = useVoidExpenseMutation()
  const createRuleMutation = useCreateExpenseRecurringRuleMutation()
  const updateRuleMutation = useUpdateExpenseRecurringRuleMutation()
  const deactivateRuleMutation = useDeactivateExpenseRecurringRuleMutation()

  const categories = categoriesQuery.data?.categories ?? []
  const staffUsers =
    usersQuery.data?.users.filter((user) => user.role === "staff") ?? []
  const expenses = expensesQuery.data?.expenses ?? []
  const pagination = expensesQuery.data?.pagination
  const rules = rulesQuery.data?.rules ?? []
  const expenseErrors = expenseFormSubmitted
    ? getExpenseFormErrors(expenseForm)
    : {}
  const recurringErrors = recurringFormSubmitted
    ? getRecurringFormErrors(recurringForm)
    : {}

  function openCreateExpenseSheet() {
    setEditingExpense(null)
    setExpenseForm(getEmptyExpenseForm())
    setExpenseFormSubmitted(false)
    setExpenseSheetOpen(true)
  }

  function openEditExpenseSheet(expense: Expense) {
    setEditingExpense(expense)
    setExpenseForm(getExpenseFormFromRecord(expense))
    setExpenseFormSubmitted(false)
    setExpenseSheetOpen(true)
  }

  function openCreateRecurringSheet() {
    setEditingRule(null)
    setRecurringForm(getEmptyRecurringForm())
    setRecurringFormSubmitted(false)
    setRecurringSheetOpen(true)
  }

  function openEditRecurringSheet(rule: ExpenseRecurringRule) {
    setEditingRule(rule)
    setRecurringForm(getRecurringFormFromRule(rule))
    setRecurringFormSubmitted(false)
    setRecurringSheetOpen(true)
  }

  async function handleExpenseSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setExpenseFormSubmitted(true)

    const errors = getExpenseFormErrors(expenseForm)
    if (hasErrors(errors)) {
      return
    }

    try {
      if (editingExpense) {
        await updateExpenseMutation.mutateAsync({
          id: editingExpense.id,
          payload: toExpensePayload(expenseForm),
        })
        toast.success("Expense updated")
      } else {
        await createExpenseMutation.mutateAsync({
          ...toExpensePayload(expenseForm),
          frequency: "one_time",
        })
        toast.success("Expense created")
      }
      setExpenseSheetOpen(false)
    } catch {
      // The sheet alert renders the API message.
    }
  }

  async function handleRecurringSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRecurringFormSubmitted(true)

    const errors = getRecurringFormErrors(recurringForm)
    if (hasErrors(errors)) {
      return
    }

    try {
      if (editingRule) {
        await updateRuleMutation.mutateAsync({
          id: editingRule.id,
          payload: toRecurringPayload(recurringForm),
        })
        toast.success("Recurring rule updated")
      } else {
        await createRuleMutation.mutateAsync(toRecurringPayload(recurringForm))
        toast.success("Recurring rule created")
      }
      setRecurringSheetOpen(false)
    } catch {
      // The sheet alert renders the API message.
    }
  }

  async function handleMarkPaid() {
    if (!markPaidExpense) {
      return
    }

    try {
      await markPaidMutation.mutateAsync({
        id: markPaidExpense.id,
        payload: {
          actualPaidAmount:
            paidForm.actualPaidAmount.trim() || markPaidExpense.expectedAmount,
          paidAt: new Date(paidForm.paidAt).toISOString(),
          paymentMethod: normalizeOptional(paidForm.paymentMethod),
          referenceNumber: normalizeOptional(paidForm.referenceNumber),
          notes: normalizeOptional(paidForm.notes),
        },
      })
      toast.success("Expense marked as paid")
      setMarkPaidExpense(null)
    } catch {
      // The dialog-level error renders below.
    }
  }

  async function handleVoidExpense() {
    if (!voidExpenseTarget || !voidReason.trim()) {
      return
    }

    try {
      await voidExpenseMutation.mutateAsync({
        id: voidExpenseTarget.id,
        payload: { reason: voidReason.trim() },
      })
      toast.success("Expense voided")
      setVoidExpenseTarget(null)
      setVoidReason("")
    } catch {
      // The dialog-level error renders below.
    }
  }

  async function handleDeactivateRule(rule: ExpenseRecurringRule) {
    try {
      await deactivateRuleMutation.mutateAsync(rule.id)
      toast.success("Recurring rule deactivated")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to deactivate rule"))
    }
  }

  const isRefreshing =
    expensesQuery.isFetching ||
    categoriesQuery.isFetching ||
    rulesQuery.isFetching ||
    reportQuery.isFetching

  return (
    <AuthenticatedAppShell title="Bills & Expenses">
      <main className="flex flex-1 flex-col gap-5 bg-muted/15 p-4 md:p-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Bills & Expenses
            </h1>
            <p className="text-sm text-muted-foreground">
              Track dealership operating bills, recurring obligations,
              reminders, and monthly expense movement.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Refresh bills and expenses"
              disabled={isRefreshing}
              onClick={() => {
                void expensesQuery.refetch()
                void rulesQuery.refetch()
                void reportQuery.refetch()
              }}
            >
              <RefreshCcwIcon
                className={isRefreshing ? "animate-spin" : undefined}
              />
            </Button>
            {isAdmin ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openCreateRecurringSheet}
                >
                  <Repeat2Icon data-icon="inline-start" />
                  Recurring Rule
                </Button>
                <Button type="button" onClick={openCreateExpenseSheet}>
                  <PlusIcon data-icon="inline-start" />
                  Add Expense
                </Button>
              </>
            ) : (
              <Badge variant="outline" className="gap-1.5 rounded-full">
                <ShieldCheckIcon className="size-3.5" />
                Read-only access
              </Badge>
            )}
          </div>
        </header>

        <ExpenseSummaryCards
          isLoading={reportQuery.isPending}
          summary={reportQuery.data?.summary}
        />

        <Card className="overflow-hidden rounded-lg p-0 shadow-none">
          <CardHeader className="border-b px-4 py-4 md:px-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-col gap-1">
                <CardTitle className="text-base">Expense Register</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review bills by urgency, category, frequency, and ownership.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[240px_170px_190px_170px]">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search title, vendor, category"
                    className="pl-9"
                  />
                </div>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as BillStatusFilter)
                  }
                >
                  <SelectTrigger aria-label="Filter by status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger aria-label="Filter by category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value={ALL_VALUE}>All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={frequency}
                  onValueChange={(value) =>
                    setFrequency(value as BillFrequencyFilter)
                  }
                >
                  <SelectTrigger aria-label="Filter by frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {FREQUENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b px-4 py-3 md:px-5">
                <TabsList>
                  <TabsTrigger value="bills">
                    <ReceiptTextIcon data-icon="inline-start" />
                    Bills
                  </TabsTrigger>
                  <TabsTrigger value="recurring">
                    <Repeat2Icon data-icon="inline-start" />
                    Recurring Rules
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="bills" className="m-0">
                <ExpensesTable
                  expenses={expenses}
                  isLoading={expensesQuery.isPending}
                  error={expensesQuery.error}
                  isAdmin={isAdmin}
                  onEdit={openEditExpenseSheet}
                  onMarkPaid={(expense) => {
                    setMarkPaidExpense(expense)
                    setPaidForm({
                      actualPaidAmount: expense.expectedAmount,
                      paidAt: nowLocalInputValue(),
                      paymentMethod: expense.paymentMethod ?? "",
                      referenceNumber: expense.referenceNumber ?? "",
                      notes: expense.notes ?? "",
                    })
                  }}
                  onVoid={setVoidExpenseTarget}
                />
                {pagination && !expensesQuery.isPending && !expensesQuery.error ? (
                  <ListPagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    itemLabel="expenses"
                    onPageChange={setPage}
                  />
                ) : null}
              </TabsContent>
              <TabsContent value="recurring" className="m-0">
                <RecurringRulesTable
                  rules={rules}
                  isLoading={rulesQuery.isPending}
                  error={rulesQuery.error}
                  isAdmin={isAdmin}
                  deactivatingRuleId={deactivateRuleMutation.variables}
                  onEdit={openEditRecurringSheet}
                  onDeactivate={handleDeactivateRule}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <ExpenseSheet
        open={expenseSheetOpen}
        onOpenChange={setExpenseSheetOpen}
        values={expenseForm}
        onChange={setExpenseForm}
        errors={expenseErrors}
        categories={categories}
        staffUsers={staffUsers}
        editingExpense={editingExpense}
        pending={createExpenseMutation.isPending || updateExpenseMutation.isPending}
        apiError={createExpenseMutation.error ?? updateExpenseMutation.error}
        onSubmit={handleExpenseSubmit}
      />

      <RecurringRuleSheet
        open={recurringSheetOpen}
        onOpenChange={setRecurringSheetOpen}
        values={recurringForm}
        onChange={setRecurringForm}
        errors={recurringErrors}
        categories={categories}
        staffUsers={staffUsers}
        editingRule={editingRule}
        pending={createRuleMutation.isPending || updateRuleMutation.isPending}
        apiError={createRuleMutation.error ?? updateRuleMutation.error}
        onSubmit={handleRecurringSubmit}
      />

      <MarkPaidDialog
        expense={markPaidExpense}
        values={paidForm}
        onValuesChange={setPaidForm}
        pending={markPaidMutation.isPending}
        error={markPaidMutation.error}
        onOpenChange={(open) => {
          if (!open) {
            setMarkPaidExpense(null)
          }
        }}
        onConfirm={handleMarkPaid}
      />

      <VoidExpenseDialog
        expense={voidExpenseTarget}
        reason={voidReason}
        onReasonChange={setVoidReason}
        pending={voidExpenseMutation.isPending}
        error={voidExpenseMutation.error}
        onOpenChange={(open) => {
          if (!open) {
            setVoidExpenseTarget(null)
            setVoidReason("")
          }
        }}
        onConfirm={handleVoidExpense}
      />
    </AuthenticatedAppShell>
  )
}

function ExpenseSummaryCards({
  isLoading,
  summary,
}: {
  isLoading: boolean
  summary?: {
    totalExpenses: number
    totalExpectedAmount: string
    paidAmount: string
    unpaidAmount: string
    overdueCount: number
    overdueAmount: string
    dueWithinSevenDaysCount: number
    dueWithinSevenDaysAmount: string
  }
}) {
  const cards = [
    {
      title: "Expected This Month",
      value: summary ? formatMoney(summary.totalExpectedAmount) : "N/A",
      detail: `${summary?.totalExpenses ?? 0} tracked bills`,
      icon: WalletCardsIcon,
    },
    {
      title: "Paid",
      value: summary ? formatMoney(summary.paidAmount) : "N/A",
      detail: "Settled operating cost",
      icon: CheckCircle2Icon,
    },
    {
      title: "Unpaid",
      value: summary ? formatMoney(summary.unpaidAmount) : "N/A",
      detail: "Open balance",
      icon: Clock3Icon,
    },
    {
      title: "Needs Attention",
      value: String(summary?.overdueCount ?? 0),
      detail: `${formatMoney(summary?.overdueAmount)} overdue`,
      icon: AlertCircleIcon,
    },
  ]

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.title} className="rounded-lg p-0 shadow-none">
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div className="flex min-w-0 flex-col gap-2">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="truncate text-2xl font-semibold text-foreground">
                    {card.value}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{card.detail}</p>
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}

function ExpensesTable({
  expenses,
  isLoading,
  error,
  isAdmin,
  onEdit,
  onMarkPaid,
  onVoid,
}: {
  expenses: Expense[]
  isLoading: boolean
  error: unknown
  isAdmin: boolean
  onEdit: (expense: Expense) => void
  onMarkPaid: (expense: Expense) => void
  onVoid: (expense: Expense) => void
}) {
  if (isLoading) {
    return <TableSkeleton rows={8} />
  }

  if (error) {
    return (
      <div className="p-5">
        <ApiErrorAlert
          title="Unable to load expenses"
          message={getApiErrorMessage(error, "")}
        />
      </div>
    )
  }

  if (!expenses.length) {
    return (
      <div className="p-6">
        <EmptyState
          title="No bills found"
          description="Create a one-time expense or recurring rule to start tracking operating costs."
        />
      </div>
    )
  }

  return (
    <Table className="w-full border-collapse">
      <TableHeader className="bg-muted/30">
        <TableRow className="hover:bg-transparent">
          <TableHead className="px-4 text-xs font-semibold text-foreground/80">
            Expense
          </TableHead>
          <TableHead className="px-4 text-xs font-semibold text-foreground/80">
            Category
          </TableHead>
          <TableHead className="px-4 text-xs font-semibold text-foreground/80">
            Due Date
          </TableHead>
          <TableHead className="px-4 text-xs font-semibold text-foreground/80">
            Amount
          </TableHead>
          <TableHead className="px-4 text-xs font-semibold text-foreground/80">
            Owner
          </TableHead>
          <TableHead className="px-4 text-xs font-semibold text-foreground/80">
            Status
          </TableHead>
          <TableHead className="px-4 text-right text-xs font-semibold text-foreground/80">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id} className="hover:bg-muted/15">
            <TableCell className="px-4 py-3 align-top">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate font-medium text-foreground">
                    {expense.title}
                  </p>
                  {expense.frequency !== "one_time" ? (
                    <Badge variant="secondary" className="rounded-full">
                      {formatFrequency(expense.frequency)}
                    </Badge>
                  ) : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {expense.vendorName ?? "No vendor"}
                  {expense.billingPeriodKey ? ` · ${expense.billingPeriodKey}` : ""}
                </p>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 align-top text-sm">
              {expense.category.name}
            </TableCell>
            <TableCell className="px-4 py-3 align-top">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {formatDate(expense.dueDate)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Expense date {formatDate(expense.expenseDate)}
                </span>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 align-top">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">
                  {formatMoney(expense.expectedAmount)}
                </span>
                {expense.actualPaidAmount ? (
                  <span className="text-xs text-emerald-600">
                    Paid {formatMoney(expense.actualPaidAmount)}
                  </span>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 align-top">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {expense.assignedStaff?.fullName ?? "Unassigned"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {expense.assignedStaff?.email ?? "All admins notified"}
                </span>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 align-top">
              <ExpenseStatusBadge status={expense.displayStatus} />
            </TableCell>
            <TableCell className="px-4 py-3 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${expense.title}`}
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>Expense actions</DropdownMenuLabel>
                  {isAdmin && expense.status === "unpaid" ? (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(expense)}>
                        <PencilIcon data-icon="inline-start" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onMarkPaid(expense)}>
                        <CheckCircle2Icon data-icon="inline-start" />
                        Mark Paid
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onVoid(expense)}
                      >
                        <Trash2Icon data-icon="inline-start" />
                        Void
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem disabled>
                      {isAdmin ? "No actions available" : "Read only"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function RecurringRulesTable({
  rules,
  isLoading,
  error,
  isAdmin,
  deactivatingRuleId,
  onEdit,
  onDeactivate,
}: {
  rules: ExpenseRecurringRule[]
  isLoading: boolean
  error: unknown
  isAdmin: boolean
  deactivatingRuleId?: string
  onEdit: (rule: ExpenseRecurringRule) => void
  onDeactivate: (rule: ExpenseRecurringRule) => void
}) {
  if (isLoading) {
    return <TableSkeleton rows={6} />
  }

  if (error) {
    return (
      <div className="p-5">
        <ApiErrorAlert
          title="Unable to load recurring rules"
          message={getApiErrorMessage(error, "")}
        />
      </div>
    )
  }

  if (!rules.length) {
    return (
      <div className="p-6">
        <EmptyState
          title="No recurring rules yet"
          description="Recurring rules automatically generate bills for predictable dealership expenses."
        />
      </div>
    )
  }

  return (
    <Table className="w-full border-collapse">
      <TableHeader className="bg-muted/30">
        <TableRow className="hover:bg-transparent">
          <TableHead className="px-4 text-xs font-semibold text-foreground/80">
            Rule
          </TableHead>
          <TableHead className="px-4 text-xs font-semibold text-foreground/80">
            Category
          </TableHead>
          <TableHead className="px-4 text-xs font-semibold text-foreground/80">
            Schedule
          </TableHead>
          <TableHead className="px-4 text-xs font-semibold text-foreground/80">
            Amount
          </TableHead>
          <TableHead className="px-4 text-xs font-semibold text-foreground/80">
            Owner
          </TableHead>
          <TableHead className="px-4 text-xs font-semibold text-foreground/80">
            State
          </TableHead>
          <TableHead className="px-4 text-right text-xs font-semibold text-foreground/80">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rules.map((rule) => (
          <TableRow key={rule.id} className="hover:bg-muted/15">
            <TableCell className="px-4 py-3 align-top">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="truncate font-medium text-foreground">
                  {rule.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {rule.vendorName ?? "No vendor"}
                </p>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 align-top text-sm">
              {rule.category.name}
            </TableCell>
            <TableCell className="px-4 py-3 align-top">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {formatFrequency(rule.frequency)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Due day {rule.dueDay} · Starts {formatDate(rule.startDate)}
                </span>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 align-top text-sm font-semibold">
              {formatMoney(rule.expectedAmount)}
            </TableCell>
            <TableCell className="px-4 py-3 align-top">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {rule.assignedStaff?.fullName ?? "Unassigned"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {rule.assignedStaff?.email ?? "All admins notified"}
                </span>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 align-top">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full",
                  rule.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-500",
                )}
              >
                {rule.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="px-4 py-3 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for recurring rule ${rule.title}`}
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>Rule actions</DropdownMenuLabel>
                  {isAdmin ? (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(rule)}>
                        <PencilIcon data-icon="inline-start" />
                        Edit
                      </DropdownMenuItem>
                      {rule.isActive ? (
                        <DropdownMenuItem
                          disabled={deactivatingRuleId === rule.id}
                          onClick={() => onDeactivate(rule)}
                        >
                          <Trash2Icon data-icon="inline-start" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : null}
                    </>
                  ) : (
                    <DropdownMenuItem disabled>Read only</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_110px_70px] gap-4 border-b bg-muted/30 px-4 py-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_110px_70px] gap-4 border-b px-4 py-4"
        >
          {Array.from({ length: 7 }).map((_, cellIndex) => (
            <Skeleton key={cellIndex} className="h-5" />
          ))}
        </div>
      ))}
    </div>
  )
}

function ExpenseSheet({
  open,
  onOpenChange,
  values,
  onChange,
  errors,
  categories,
  staffUsers,
  editingExpense,
  pending,
  apiError,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: ExpenseFormValues
  onChange: (values: ExpenseFormValues) => void
  errors: Partial<Record<keyof ExpenseFormValues, string>>
  categories: Array<{ id: string; name: string }>
  staffUsers: AuthenticatedUser[]
  editingExpense: Expense | null
  pending: boolean
  apiError: unknown
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const [selectPortalContainer, setSelectPortalContainer] =
    React.useState<HTMLDivElement | null>(null)

  function update<K extends keyof ExpenseFormValues>(
    key: K,
    value: ExpenseFormValues[K],
  ) {
    onChange({ ...values, [key]: value })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        onPointerDownOutside={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-full gap-0 p-0 data-[side=right]:w-full md:data-[side=right]:w-[48vw] md:data-[side=right]:max-w-none"
      >
        <SheetHeader className="border-b px-6 py-5 pr-14">
          <SheetTitle className="text-lg">
            {editingExpense ? "Edit Expense" : "Add Expense"}
          </SheetTitle>
          <SheetDescription>
            Record a one-time dealership bill, due date, owner, and supporting
            payment context.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div
            ref={setSelectPortalContainer}
            className="min-h-0 flex-1 overflow-y-auto px-6 py-6"
          >
            <FieldGroup className="gap-5">
              <ApiErrorAlert
                title="Unable to save expense"
                message={getApiErrorMessage(apiError, "")}
              />
              <ExpenseFormFields
                values={values}
                errors={errors}
                categories={categories}
                staffUsers={staffUsers}
                onUpdate={update}
                portalContainer={selectPortalContainer}
              />
            </FieldGroup>
          </div>
          <SheetFooter className="border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Payment reminders follow the due date in Asia/Manila time.
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <SubmitButton
                type="submit"
                pending={pending}
                pendingLabel={editingExpense ? "Updating" : "Creating"}
              >
                {editingExpense ? "Update Expense" : "Create Expense"}
              </SubmitButton>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function RecurringRuleSheet({
  open,
  onOpenChange,
  values,
  onChange,
  errors,
  categories,
  staffUsers,
  editingRule,
  pending,
  apiError,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: RecurringFormValues
  onChange: (values: RecurringFormValues) => void
  errors: Partial<Record<keyof RecurringFormValues, string>>
  categories: Array<{ id: string; name: string }>
  staffUsers: AuthenticatedUser[]
  editingRule: ExpenseRecurringRule | null
  pending: boolean
  apiError: unknown
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const [selectPortalContainer, setSelectPortalContainer] =
    React.useState<HTMLDivElement | null>(null)

  function update<K extends keyof RecurringFormValues>(
    key: K,
    value: RecurringFormValues[K],
  ) {
    onChange({ ...values, [key]: value })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        onPointerDownOutside={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-full gap-0 p-0 data-[side=right]:w-full md:data-[side=right]:w-[48vw] md:data-[side=right]:max-w-none"
      >
        <SheetHeader className="border-b px-6 py-5 pr-14">
          <SheetTitle className="text-lg">
            {editingRule ? "Edit Recurring Rule" : "Add Recurring Rule"}
          </SheetTitle>
          <SheetDescription>
            Generate predictable future bills for rent, utilities,
            subscriptions, and other repeated costs.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div
            ref={setSelectPortalContainer}
            className="min-h-0 flex-1 overflow-y-auto px-6 py-6"
          >
            <FieldGroup className="gap-5">
              <ApiErrorAlert
                title="Unable to save recurring rule"
                message={getApiErrorMessage(apiError, "")}
              />
              <ExpenseFormFields
                values={values}
                errors={errors}
                categories={categories}
                staffUsers={staffUsers}
                onUpdate={update}
                hideDateFields
                portalContainer={selectPortalContainer}
              />
              <Separator />
              <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    Recurrence
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The system creates current and upcoming bill instances only.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field>
                    <FieldLabel>Frequency</FieldLabel>
                    <Select
                      value={values.frequency}
                      onValueChange={(value) =>
                        update("frequency", value as ExpenseRuleFrequency)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent portalContainer={selectPortalContainer}>
                        {RECURRING_FREQUENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field data-invalid={errors.dueDay ? true : undefined}>
                    <FieldLabel htmlFor="recurringDueDay">Due day</FieldLabel>
                    <Input
                      id="recurringDueDay"
                      value={values.dueDay}
                      onChange={(event) => update("dueDay", event.target.value)}
                      inputMode="numeric"
                    />
                    <FieldError>{errors.dueDay}</FieldError>
                  </Field>
                  <Field data-invalid={errors.startDate ? true : undefined}>
                    <FieldLabel htmlFor="recurringStartDate">
                      Start date
                    </FieldLabel>
                    <Input
                      id="recurringStartDate"
                      type="date"
                      value={values.startDate}
                      onChange={(event) =>
                        update("startDate", event.target.value)
                      }
                    />
                    <FieldError>{errors.startDate}</FieldError>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="recurringEndDate">
                      End date
                    </FieldLabel>
                    <Input
                      id="recurringEndDate"
                      type="date"
                      value={values.endDate}
                      onChange={(event) => update("endDate", event.target.value)}
                    />
                  </Field>
                </div>
              </section>
            </FieldGroup>
          </div>
          <SheetFooter className="border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              New generated bills inherit this category, owner, amount, and notes.
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <SubmitButton
                type="submit"
                pending={pending}
                pendingLabel={editingRule ? "Updating" : "Creating"}
              >
                {editingRule ? "Update Rule" : "Create Rule"}
              </SubmitButton>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function ExpenseFormFields<TValues extends ExpenseFormValues>({
  values,
  errors,
  categories,
  staffUsers,
  onUpdate,
  hideDateFields = false,
  portalContainer,
}: {
  values: TValues
  errors: Partial<Record<keyof TValues, string>>
  categories: Array<{ id: string; name: string }>
  staffUsers: AuthenticatedUser[]
  onUpdate: <K extends keyof TValues>(key: K, value: TValues[K]) => void
  hideDateFields?: boolean
  portalContainer?: HTMLElement | ShadowRoot | null
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">
          Bill Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Keep names clear enough for monthly reporting and reminders.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field data-invalid={errors.title ? true : undefined}>
          <FieldLabel htmlFor="expenseTitle">Title</FieldLabel>
          <Input
            id="expenseTitle"
            value={values.title}
            onChange={(event) =>
              onUpdate("title" as keyof TValues, event.target.value as TValues[keyof TValues])
            }
            placeholder="Office rent"
          />
          <FieldError>{errors.title}</FieldError>
        </Field>
        <Field data-invalid={errors.categoryId ? true : undefined}>
          <FieldLabel>Category</FieldLabel>
          <Select
            value={values.categoryId}
            onValueChange={(value) =>
              onUpdate("categoryId" as keyof TValues, value as TValues[keyof TValues])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent portalContainer={portalContainer}>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.categoryId}</FieldError>
        </Field>
        <Field data-invalid={errors.expectedAmount ? true : undefined}>
          <FieldLabel htmlFor="expectedAmount">Expected amount</FieldLabel>
          <Input
            id="expectedAmount"
            value={values.expectedAmount}
            onChange={(event) =>
              onUpdate(
                "expectedAmount" as keyof TValues,
                event.target.value as TValues[keyof TValues],
              )
            }
            inputMode="decimal"
            placeholder="12500.00"
          />
          <FieldError>{errors.expectedAmount}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="vendorName">Vendor</FieldLabel>
          <Input
            id="vendorName"
            value={values.vendorName}
            onChange={(event) =>
              onUpdate(
                "vendorName" as keyof TValues,
                event.target.value as TValues[keyof TValues],
              )
            }
            placeholder="Supplier or landlord"
          />
        </Field>
        {!hideDateFields ? (
          <>
            <Field>
              <FieldLabel htmlFor="expenseDate">Expense date</FieldLabel>
              <Input
                id="expenseDate"
                type="date"
                value={values.expenseDate}
                onChange={(event) =>
                  onUpdate(
                    "expenseDate" as keyof TValues,
                    event.target.value as TValues[keyof TValues],
                  )
                }
              />
            </Field>
            <Field data-invalid={errors.dueDate ? true : undefined}>
              <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
              <Input
                id="dueDate"
                type="date"
                value={values.dueDate}
                onChange={(event) =>
                  onUpdate(
                    "dueDate" as keyof TValues,
                    event.target.value as TValues[keyof TValues],
                  )
                }
              />
              <FieldError>{errors.dueDate}</FieldError>
            </Field>
          </>
        ) : null}
        <Field>
          <FieldLabel>Responsible staff</FieldLabel>
          <Select
            value={values.assignedStaffId}
            onValueChange={(value) =>
              onUpdate(
                "assignedStaffId" as keyof TValues,
                value as TValues[keyof TValues],
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent portalContainer={portalContainer}>
              <SelectItem value={ALL_VALUE}>Unassigned</SelectItem>
              {staffUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="expenseNotes">Notes</FieldLabel>
        <Textarea
          id="expenseNotes"
          value={values.notes}
          onChange={(event) =>
            onUpdate("notes" as keyof TValues, event.target.value as TValues[keyof TValues])
          }
          placeholder="Internal payment context, account number, or remarks"
          className="min-h-24"
        />
      </Field>
    </section>
  )
}

function MarkPaidDialog({
  expense,
  values,
  onValuesChange,
  pending,
  error,
  onOpenChange,
  onConfirm,
}: {
  expense: Expense | null
  values: PaidFormValues
  onValuesChange: (values: PaidFormValues) => void
  pending: boolean
  error: unknown
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const open = Boolean(expense)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogMedia>
          <CheckCircle2Icon />
        </AlertDialogMedia>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark expense as paid?</AlertDialogTitle>
          <AlertDialogDescription>
            This will settle the bill and resolve related payment reminders.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-4">
          <ApiErrorAlert
            title="Unable to mark expense paid"
            message={getApiErrorMessage(error, "")}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="paidAmount">Paid amount</FieldLabel>
              <Input
                id="paidAmount"
                value={values.actualPaidAmount}
                onChange={(event) =>
                  onValuesChange({
                    ...values,
                    actualPaidAmount: event.target.value,
                  })
                }
                inputMode="decimal"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="paidAt">Paid at</FieldLabel>
              <Input
                id="paidAt"
                type="datetime-local"
                value={values.paidAt}
                onChange={(event) =>
                  onValuesChange({ ...values, paidAt: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="paymentMethod">Payment method</FieldLabel>
              <Input
                id="paymentMethod"
                value={values.paymentMethod}
                onChange={(event) =>
                  onValuesChange({
                    ...values,
                    paymentMethod: event.target.value,
                  })
                }
                placeholder="Bank transfer"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="referenceNumber">Reference number</FieldLabel>
              <Input
                id="referenceNumber"
                value={values.referenceNumber}
                onChange={(event) =>
                  onValuesChange({
                    ...values,
                    referenceNumber: event.target.value,
                  })
                }
                placeholder="Receipt or transaction ID"
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="paymentNotes">Notes</FieldLabel>
            <Textarea
              id="paymentNotes"
              value={values.notes}
              onChange={(event) =>
                onValuesChange({ ...values, notes: event.target.value })
              }
              className="min-h-20"
            />
          </Field>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={pending}>
            {pending ? "Saving" : "Mark Paid"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function VoidExpenseDialog({
  expense,
  reason,
  onReasonChange,
  pending,
  error,
  onOpenChange,
  onConfirm,
}: {
  expense: Expense | null
  reason: string
  onReasonChange: (reason: string) => void
  pending: boolean
  error: unknown
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const open = Boolean(expense)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogMedia>
          <AlertCircleIcon />
        </AlertDialogMedia>
        <AlertDialogHeader>
          <AlertDialogTitle>Void this expense?</AlertDialogTitle>
          <AlertDialogDescription>
            Voiding removes the bill from open balances and keeps an audit trail
            with the reason below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-4">
          <ApiErrorAlert
            title="Unable to void expense"
            message={getApiErrorMessage(error, "")}
          />
          <Alert>
            <FileTextIcon />
            <AlertTitle>{expense?.title ?? "Selected expense"}</AlertTitle>
            <AlertDescription>
              {formatMoney(expense?.expectedAmount)} due{" "}
              {formatDate(expense?.dueDate)}
            </AlertDescription>
          </Alert>
          <Field data-invalid={!reason.trim() ? true : undefined}>
            <FieldLabel htmlFor="voidReason">Void reason</FieldLabel>
            <Textarea
              id="voidReason"
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="Explain why this bill should no longer be paid"
              className="min-h-24"
            />
            {!reason.trim() ? (
              <FieldError>Enter a clear reason before voiding.</FieldError>
            ) : null}
          </Field>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={pending || !reason.trim()}
          >
            {pending ? "Voiding" : "Void Expense"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
