import type { ReactNode } from "react"

import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { getApiErrorMessage } from "@/types/api"

/**
 * Renders intentional loading / error / empty states around report content so
 * every report surface handles the three states consistently.
 */
export function ReportAsyncBoundary({
  isPending,
  error,
  isEmpty,
  loadingLabel,
  errorTitle,
  emptyTitle,
  emptyDescription,
  children,
}: {
  isPending: boolean
  error: unknown
  isEmpty?: boolean
  loadingLabel: string
  errorTitle: string
  emptyTitle: string
  emptyDescription: string
  children: ReactNode
}) {
  if (isPending) {
    return (
      <div className="p-6">
        <ModuleLoadingState label={loadingLabel} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ApiErrorAlert title={errorTitle} message={getApiErrorMessage(error, "")} />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="p-6">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    )
  }

  return <>{children}</>
}
