"use client";

import { FileTextIcon, ReceiptTextIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExpenseReceipt } from "@/types/expenses";

export function ReceiptPreviewDialog({
  receipt,
  onOpenChange,
}: {
  receipt: ExpenseReceipt | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = Boolean(receipt);
  const filename = receipt?.originalFilename ?? "Receipt attachment";
  const mimeType = receipt?.mimeType ?? "";
  const isPdf = mimeType === "application/pdf";
  const isImage = mimeType.startsWith("image/");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] gap-4 overflow-hidden sm:max-w-4xl">
        <DialogHeader className="pr-8">
          <DialogTitle className="flex min-w-0 items-center gap-2">
            <ReceiptTextIcon className="size-4 shrink-0" />
            <span className="truncate">{filename}</span>
          </DialogTitle>
          <DialogDescription>
            Receipt preview is shown inside the app.
          </DialogDescription>
        </DialogHeader>

        {receipt ? (
          <div className="min-h-[50vh] overflow-hidden rounded-lg border bg-muted/20">
            {isImage ? (
              <div className="flex h-[70vh] max-h-[720px] items-center justify-center p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receipt.fileUrl}
                  alt={filename}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : isPdf ? (
              <iframe
                title={filename}
                src={receipt.fileUrl}
                className="h-[70vh] max-h-[720px] w-full border-0 bg-background"
              />
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-6 text-center">
                <FileTextIcon className="size-10 text-muted-foreground" />
                <div className="max-w-sm">
                  <p className="text-sm font-medium text-foreground">
                    Preview unavailable
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This receipt type cannot be previewed in the browser.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
