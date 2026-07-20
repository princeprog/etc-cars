"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { dashboardQueryKeys } from "@/hooks/queries/dashboard/dashboard-query-keys";
import { expensesQueryKeys } from "@/hooks/queries/expenses/expenses-query-keys";
import { notificationsQueryKeys } from "@/hooks/queries/notifications/notifications-query-keys";
import {
  createExpense,
  createExpenseCategory,
  createExpenseRecurringRule,
  deactivateExpenseRecurringRule,
  markExpensePaid,
  removeExpenseReceipt,
  replaceExpenseReceipt,
  updateExpense,
  updateExpenseCategory,
  updateExpenseRecurringRule,
  voidExpense,
} from "@/services/expenses.service";
import type {
  CreateExpenseCategoryPayload,
  CreateExpensePayload,
  CreateExpenseRecurringRulePayload,
  ExpenseReceiptPayload,
  MarkExpensePaidPayload,
  UpdateExpenseCategoryPayload,
  UpdateExpensePayload,
  UpdateExpenseRecurringRulePayload,
  VoidExpensePayload,
} from "@/types/expenses";

function useExpenseInvalidation() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: expensesQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary }),
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all }),
    ]);
  };
}

export function useCreateExpenseMutation() {
  const invalidate = useExpenseInvalidation();

  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateExpenseMutation() {
  const invalidate = useExpenseInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExpensePayload;
    }) => updateExpense(id, payload),
    onSuccess: invalidate,
  });
}

export function useMarkExpensePaidMutation() {
  const invalidate = useExpenseInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: MarkExpensePaidPayload;
    }) => markExpensePaid(id, payload),
    onSuccess: invalidate,
  });
}

export function useVoidExpenseMutation() {
  const invalidate = useExpenseInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: VoidExpensePayload;
    }) => voidExpense(id, payload),
    onSuccess: invalidate,
  });
}

export function useReplaceExpenseReceiptMutation() {
  const invalidate = useExpenseInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ExpenseReceiptPayload;
    }) => replaceExpenseReceipt(id, payload),
    onSuccess: invalidate,
  });
}

export function useRemoveExpenseReceiptMutation() {
  const invalidate = useExpenseInvalidation();

  return useMutation({
    mutationFn: (id: string) => removeExpenseReceipt(id),
    onSuccess: invalidate,
  });
}

export function useCreateExpenseCategoryMutation() {
  const invalidate = useExpenseInvalidation();

  return useMutation({
    mutationFn: (payload: CreateExpenseCategoryPayload) =>
      createExpenseCategory(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateExpenseCategoryMutation() {
  const invalidate = useExpenseInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExpenseCategoryPayload;
    }) => updateExpenseCategory(id, payload),
    onSuccess: invalidate,
  });
}

export function useCreateExpenseRecurringRuleMutation() {
  const invalidate = useExpenseInvalidation();

  return useMutation({
    mutationFn: (payload: CreateExpenseRecurringRulePayload) =>
      createExpenseRecurringRule(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateExpenseRecurringRuleMutation() {
  const invalidate = useExpenseInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExpenseRecurringRulePayload;
    }) => updateExpenseRecurringRule(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeactivateExpenseRecurringRuleMutation() {
  const invalidate = useExpenseInvalidation();

  return useMutation({
    mutationFn: (id: string) => deactivateExpenseRecurringRule(id),
    onSuccess: invalidate,
  });
}
