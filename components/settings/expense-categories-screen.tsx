"use client"

import * as React from "react"
import {
  FolderCogIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  TagIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { SubmitButton } from "@/components/operations/submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
} from "@/hooks/mutations/expenses/use-expense-mutations"
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query"
import { useExpenseCategoriesQuery } from "@/hooks/queries/expenses/use-expense-categories-query"
import { getApiErrorMessage } from "@/types/api"
import type { ExpenseCategory } from "@/types/expenses"

type CategoryFormValues = {
  name: string
  description: string
  isActive: boolean
}

function getEmptyCategoryForm(): CategoryFormValues {
  return {
    name: "",
    description: "",
    isActive: true,
  }
}

function getCategoryForm(category: ExpenseCategory): CategoryFormValues {
  return {
    name: category.name,
    description: category.description ?? "",
    isActive: category.isActive,
  }
}

function getCategoryFormErrors(values: CategoryFormValues) {
  const errors: Partial<Record<keyof CategoryFormValues, string>> = {}

  if (!values.name.trim()) {
    errors.name = "Enter a category name."
  }

  return errors
}

export function ExpenseCategoriesScreen() {
  const authQuery = useAuthenticatedUserQuery()
  const isAdmin = authQuery.data?.user.role === "admin"
  const categoriesQuery = useExpenseCategoriesQuery(true)
  const createMutation = useCreateExpenseCategoryMutation()
  const updateMutation = useUpdateExpenseCategoryMutation()
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] =
    React.useState<ExpenseCategory | null>(null)
  const [form, setForm] = React.useState(getEmptyCategoryForm)
  const [submitted, setSubmitted] = React.useState(false)
  const errors = submitted ? getCategoryFormErrors(form) : {}
  const categories = categoriesQuery.data?.categories ?? []

  function openCreateSheet() {
    setEditingCategory(null)
    setForm(getEmptyCategoryForm())
    setSubmitted(false)
    setSheetOpen(true)
  }

  function openEditSheet(category: ExpenseCategory) {
    setEditingCategory(category)
    setForm(getCategoryForm(category))
    setSubmitted(false)
    setSheetOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)

    const nextErrors = getCategoryFormErrors(form)
    if (Object.keys(nextErrors).length) {
      return
    }

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          payload: {
            name: form.name.trim(),
            description: form.description.trim() || null,
            isActive: form.isActive,
          },
        })
        toast.success("Expense category updated")
      } else {
        await createMutation.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim() || null,
        })
        toast.success("Expense category created")
      }
      setSheetOpen(false)
    } catch {
      // The sheet alert renders the API message.
    }
  }

  return (
    <AuthenticatedAppShell
      title="Expense Categories"
      breadcrumbs={[
        { label: "Administration" },
        { label: "Settings", href: "/settings" },
        { label: "Expense Categories" },
      ]}
    >
      {isAdmin ? (
        <main className="flex flex-1 flex-col gap-5 bg-muted/15 p-4 md:p-6">
          <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex max-w-3xl flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Expense Categories
              </h1>
              <p className="text-sm text-muted-foreground">
                Organize bills for reports, filters, and recurring expense
                rules.
              </p>
            </div>
            <Button type="button" onClick={openCreateSheet}>
              <PlusIcon data-icon="inline-start" />
              Add Category
            </Button>
          </header>

          <Card className="overflow-hidden rounded-lg p-0 shadow-none">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderCogIcon className="size-4" />
                Category Library
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {categoriesQuery.isPending ? (
                <CategorySkeleton />
              ) : categoriesQuery.error ? (
                <div className="p-5">
                  <ApiErrorAlert
                    title="Unable to load expense categories"
                    message={getApiErrorMessage(categoriesQuery.error, "")}
                  />
                </div>
              ) : categories.length ? (
                <Table className="w-full border-collapse">
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                        Category
                      </TableHead>
                      <TableHead className="px-4 text-xs font-semibold text-foreground/80">
                        Type
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
                    {categories.map((category) => (
                      <TableRow key={category.id} className="hover:bg-muted/15">
                        <TableCell className="px-4 py-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                              <TagIcon className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {category.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {category.description ?? "No description"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge variant="outline" className="rounded-full">
                            {category.isDefault ? "Default" : "Custom"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              category.isActive
                                ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "rounded-full border-slate-200 bg-slate-50 text-slate-500"
                            }
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${category.name}`}
                              >
                                <MoreHorizontalIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuLabel>
                                Category actions
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => openEditSheet(category)}
                              >
                                <PencilIcon data-icon="inline-start" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6">
                  <EmptyState
                    title="No expense categories"
                    description="Create categories before adding expenses."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      ) : (
        <div className="flex flex-1 items-start px-4 py-6 md:px-6">
          <Alert variant="destructive" className="max-w-xl">
            <ShieldCheckIcon />
            <AlertTitle>Admin access required</AlertTitle>
            <AlertDescription>
              Expense category settings are available only to admin users.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <CategorySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        values={form}
        onChange={setForm}
        errors={errors}
        editingCategory={editingCategory}
        pending={createMutation.isPending || updateMutation.isPending}
        apiError={createMutation.error ?? updateMutation.error}
        onSubmit={handleSubmit}
      />
    </AuthenticatedAppShell>
  )
}

function CategorySheet({
  open,
  onOpenChange,
  values,
  onChange,
  errors,
  editingCategory,
  pending,
  apiError,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: CategoryFormValues
  onChange: (values: CategoryFormValues) => void
  errors: Partial<Record<keyof CategoryFormValues, string>>
  editingCategory: ExpenseCategory | null
  pending: boolean
  apiError: unknown
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-full gap-0 p-0 data-[side=right]:w-full md:data-[side=right]:w-[420px]"
      >
        <SheetHeader className="border-b px-6 py-5 pr-14">
          <SheetTitle className="text-lg">
            {editingCategory ? "Edit Category" : "Add Category"}
          </SheetTitle>
          <SheetDescription>
            Categories keep bills cleanly grouped for reporting and reminders.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <FieldGroup className="gap-5">
              <ApiErrorAlert
                title="Unable to save category"
                message={getApiErrorMessage(apiError, "")}
              />
              <Field data-invalid={errors.name ? true : undefined}>
                <FieldLabel htmlFor="categoryName">Name</FieldLabel>
                <Input
                  id="categoryName"
                  value={values.name}
                  onChange={(event) =>
                    onChange({ ...values, name: event.target.value })
                  }
                  placeholder="Insurance"
                />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="categoryDescription">
                  Description
                </FieldLabel>
                <Textarea
                  id="categoryDescription"
                  value={values.description}
                  onChange={(event) =>
                    onChange({ ...values, description: event.target.value })
                  }
                  placeholder="Optional reporting context"
                  className="min-h-24"
                />
              </Field>
              {editingCategory ? (
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">
                      Active category
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Inactive categories stay visible in historical records but
                      cannot be selected for new bills.
                    </p>
                  </div>
                  <Switch
                    checked={values.isActive}
                    onCheckedChange={(checked) =>
                      onChange({ ...values, isActive: checked })
                    }
                  />
                </div>
              ) : null}
            </FieldGroup>
          </div>
          <SheetFooter className="border-t bg-background px-6 py-4">
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
              pendingLabel={editingCategory ? "Updating" : "Creating"}
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </SubmitButton>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function CategorySkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="grid grid-cols-[1fr_120px_120px_70px] gap-4 border-b px-4 py-4">
          <Skeleton className="h-9" />
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
          <Skeleton className="h-8" />
        </div>
      ))}
    </div>
  )
}
