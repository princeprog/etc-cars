"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  ReceiptTextIcon,
  UserRoundIcon,
} from "lucide-react";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import {
  ExpenseStatusBadge,
  formatDate,
  formatDateTime,
  formatFrequency,
  formatMoney,
} from "@/components/expenses/expense-formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpenseQuery } from "@/hooks/queries/expenses/use-expense-query";
import { getApiErrorMessage } from "@/types/api";

export function ExpenseDetailScreen({ expenseId }: { expenseId: string }) {
  const expenseQuery = useExpenseQuery(expenseId);
  const expense = expenseQuery.data?.expense;

  return (
    <AuthenticatedAppShell
      title="Expense Details"
      breadcrumbs={[
        { label: "Bills & Expenses", href: "/bills-expenses" },
        { label: "Expense Details" },
      ]}
    >
      <main className="flex flex-1 flex-col gap-5 bg-muted/15 p-4 md:p-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <Button asChild variant="ghost" className="mb-2 w-fit px-0">
              <Link href="/bills-expenses">
                <ArrowLeftIcon data-icon="inline-start" />
                Back to Bills & Expenses
              </Link>
            </Button>
            {expense ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
                    {expense.title}
                  </h1>
                  <ExpenseStatusBadge status={expense.displayStatus} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {expense.category.name} · {formatFrequency(expense.frequency)}
                </p>
              </>
            ) : (
              <>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-40" />
              </>
            )}
          </div>
        </header>

        {expenseQuery.isPending ? (
          <ExpenseDetailSkeleton />
        ) : expenseQuery.error ? (
          <ApiErrorAlert
            title="Unable to load expense"
            message={getApiErrorMessage(expenseQuery.error, "")}
          />
        ) : expense ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="rounded-lg p-0 shadow-none">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ReceiptTextIcon className="size-4" />
                  Bill Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 p-5 md:grid-cols-2">
                <DetailItem
                  label="Expected amount"
                  value={formatMoney(expense.expectedAmount)}
                />
                <DetailItem
                  label="Actual paid amount"
                  value={formatMoney(expense.actualPaidAmount)}
                />
                <DetailItem
                  label="Due date"
                  value={formatDate(expense.dueDate)}
                />
                <DetailItem
                  label="Expense date"
                  value={formatDate(expense.expenseDate)}
                />
                <DetailItem
                  label="Vendor"
                  value={expense.vendorName ?? "No vendor"}
                />
                <DetailItem
                  label="Billing period"
                  value={expense.billingPeriodKey ?? "N/A"}
                />
                <DetailItem
                  label="Payment method"
                  value={expense.paymentMethod ?? "N/A"}
                />
                <DetailItem
                  label="Reference number"
                  value={expense.referenceNumber ?? "N/A"}
                />
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card className="rounded-lg p-0 shadow-none">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserRoundIcon className="size-4" />
                    Ownership
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 p-5">
                  <DetailItem
                    label="Responsible staff"
                    value={expense.assignedStaff?.fullName ?? "Unassigned"}
                  />
                  <DetailItem
                    label="Contact"
                    value={
                      expense.assignedStaff?.email ?? "All admins notified"
                    }
                  />
                </CardContent>
              </Card>

              <Card className="rounded-lg p-0 shadow-none">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarClockIcon className="size-4" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 p-5">
                  <DetailItem
                    label="Paid at"
                    value={formatDateTime(expense.paidAt)}
                  />
                  <DetailItem
                    label="Voided at"
                    value={formatDateTime(expense.voidedAt)}
                  />
                  <DetailItem
                    label="Created"
                    value={formatDateTime(expense.createdAt)}
                  />
                  <DetailItem
                    label="Updated"
                    value={formatDateTime(expense.updatedAt)}
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-lg p-0 shadow-none xl:col-span-2">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileTextIcon className="size-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <p className="min-h-16 rounded-md border bg-background p-4 text-sm leading-6 text-muted-foreground">
                  {expense.notes ?? expense.voidReason ?? "No notes recorded."}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg p-0 shadow-none xl:col-span-2">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ReceiptTextIcon className="size-4" />
                  Receipt
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {expense.receipt?.originalFilename ?? "No receipt attached"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {expense.receipt
                      ? `${expense.receipt.mimeType ?? "Attachment"} · ${formatReceiptSize(expense.receipt.fileSize)}`
                      : "Paid expenses can keep one image or PDF receipt."}
                  </p>
                </div>
                {expense.receipt ? (
                  <Button asChild variant="outline" className="w-fit">
                    <a
                      href={expense.receipt.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLinkIcon data-icon="inline-start" />
                      View receipt
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </AuthenticatedAppShell>
  );
}

function formatReceiptSize(size: number | null | undefined) {
  if (!size || !Number.isFinite(size)) {
    return "Size unavailable";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ExpenseDetailSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Skeleton className="h-72 rounded-lg" />
      <div className="grid gap-4">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-52 rounded-lg" />
      </div>
      <Skeleton className="h-40 rounded-lg xl:col-span-2" />
    </div>
  );
}
