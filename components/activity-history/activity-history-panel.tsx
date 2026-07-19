"use client"

import { format } from "date-fns"

import { useActivityHistoryQuery } from "@/hooks/queries/activity-history/use-activity-history-query"
import { getApiErrorMessage } from "@/types/api"
import type { ActivityEntityType } from "@/types/activity-history"
import { ApiErrorAlert } from "../operations/api-error-alert"
import { EmptyState } from "../operations/empty-state"
import { ModuleLoadingState } from "../operations/module-loading-state"
import { Badge } from "../ui/badge"

function getActionLabel(actionType: string) {
  return actionType.split(".").at(-1)?.replaceAll("_", " ") ?? actionType
}

export function ActivityHistoryPanel({
  entityType,
  entityId,
  title = "Activity History",
}: {
  entityType: ActivityEntityType
  entityId: string
  title?: string
}) {
  const historyQuery = useActivityHistoryQuery(entityType, entityId)
  const events = historyQuery.data?.events ?? []

  return (
    <section className="min-w-0 space-y-3">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">Reverse-chronological operational timeline for this record.</p>
      </div>

      {historyQuery.isPending ? (
        <ModuleLoadingState label="Loading activity history" />
      ) : historyQuery.error ? (
        <ApiErrorAlert title="Unable to load activity history" message={getApiErrorMessage(historyQuery.error, "")} />
      ) : events.length ? (
        <div className="min-w-0 space-y-3">
          {events.map((event) => (
            <div key={event.id} className="min-w-0 rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="line-clamp-3 min-w-0 text-sm font-medium text-foreground [overflow-wrap:anywhere]">{event.summary}</p>
                <Badge variant="outline" className="w-fit shrink-0 rounded-full text-[11px]">
                  {getActionLabel(event.actionType)}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="max-w-full truncate">{event.actorDisplayName ?? "System"}</span>
                <span>{format(new Date(event.timestamp), "MMM d, yyyy h:mm a")}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No activity yet" description="Operational history will appear here once the record starts moving through the workflow." />
      )}
    </section>
  )
}
