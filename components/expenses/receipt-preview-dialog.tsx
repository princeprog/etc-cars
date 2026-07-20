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
  const pdfPreviewUrl = receipt
    ? getCloudinaryPdfPreviewUrl(receipt.fileUrl)
    : null;

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
              <div className="flex h-[70vh] max-h-[720px] flex-col items-center justify-center gap-3 p-3">
                {pdfPreviewUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pdfPreviewUrl}
                      alt={filename}
                      className="max-h-[calc(70vh-2.5rem)] max-w-full object-contain"
                    />
                    <p className="text-xs text-muted-foreground">
                      Showing page 1 of the PDF receipt.
                    </p>
                  </>
                ) : (
                  <PreviewUnavailable />
                )}
              </div>
            ) : (
              <PreviewUnavailable />
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function getCloudinaryPdfPreviewUrl(fileUrl: string) {
  const imageUploadMarker = "/image/upload/";
  const markerIndex = fileUrl.indexOf(imageUploadMarker);

  if (markerIndex === -1) {
    return null;
  }

  const prefix = fileUrl.slice(0, markerIndex + imageUploadMarker.length);
  const suffix = fileUrl.slice(markerIndex + imageUploadMarker.length);
  const withoutExtension = suffix.replace(/\.pdf(\?.*)?$/i, "");

  return `${prefix}f_jpg,pg_1,w_1600,c_limit/${withoutExtension}.jpg`;
}

function PreviewUnavailable() {
  return (
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
  );
}
