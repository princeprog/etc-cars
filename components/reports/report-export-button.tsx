"use client"

import * as React from "react"
import { DownloadIcon } from "lucide-react"
import { toast } from "@/components/ui/sileo"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { downloadReportCsv } from "@/services/reports.service"
import { getApiErrorMessage } from "@/types/api"
import type { ReportDomain, ReportFilters } from "@/types/reports"

/**
 * Exports the active report/view as CSV. The current filter context is passed
 * straight through to the backend so the file always reflects what the user is
 * looking at.
 */
export function ReportExportButton({
  domain,
  dataset,
  filters,
  label = "Export CSV",
  disabled,
}: {
  domain: ReportDomain
  dataset: string
  filters: ReportFilters
  label?: string
  disabled?: boolean
}) {
  const [pending, setPending] = React.useState(false)

  async function handleExport() {
    setPending(true)

    try {
      await downloadReportCsv(domain, dataset, filters)
      toast.success("Export ready", {
        details: "Your CSV download has started.",
      })
    } catch (error) {
      toast.error("Export failed", {
        details: getApiErrorMessage(error, "Unable to export this report."),
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || pending}
    >
      {pending ? <Spinner className="size-4" /> : <DownloadIcon />}
      {label}
    </Button>
  )
}
