"use client"

import { useMutation } from "@tanstack/react-query"

import { uploadExpenseReceipt } from "@/services/uploads.service"

export function useUploadExpenseReceiptMutation() {
  return useMutation({
    mutationFn: (file: File) => uploadExpenseReceipt(file),
  })
}
