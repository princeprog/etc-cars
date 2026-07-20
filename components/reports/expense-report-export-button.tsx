"use client"

import { useState } from "react"
import { DownloadIcon } from "lucide-react"
import { toast } from "@/components/ui/sileo"

import { Button } from "@/components/ui/button"
import { downloadExpenseReportCsv } from "@/services/expenses.service"
import type {
  ExpenseExportDataset,
  ExpenseReportFilters,
} from "@/types/expenses"

export function ExpenseReportExportButton({
  dataset,
  filters,
  label = "Export CSV",
  disabled,
}: {
  dataset: ExpenseExportDataset
  filters: ExpenseReportFilters
  label?: string
  disabled?: boolean
}) {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)

    try {
      await downloadExpenseReportCsv(dataset, filters)
      toast.success("Export ready", {
        details: "Your expense CSV has been downloaded.",
      })
    } catch (error) {
      toast.error("Export failed", {
        details:
          error instanceof Error
            ? error.message
            : "Unable to export expense report.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || isExporting}
      onClick={handleExport}
    >
      <DownloadIcon data-icon="inline-start" />
      {isExporting ? "Exporting" : label}
    </Button>
  )
}
