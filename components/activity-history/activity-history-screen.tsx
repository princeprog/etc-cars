"use client"

import { format } from "date-fns"

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell"
import { ApiErrorAlert } from "@/components/operations/api-error-alert"
import { EmptyState } from "@/components/operations/empty-state"
import { ModuleLoadingState } from "@/components/operations/module-loading-state"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAllActivityHistoryQuery } from "@/hooks/queries/activity-history/use-all-activity-history-query"
import { getApiErrorMessage } from "@/types/api"

function getActionLabel(actionType: string) {
  return actionType.split(".").at(-1)?.replaceAll("_", " ") ?? actionType
}

function getEntityLabel(entityType: string) {
  return entityType.replaceAll("_", " ")
}

export function ActivityHistoryScreen() {
  const activityQuery = useAllActivityHistoryQuery()
  const events = activityQuery.data?.events ?? []

  return (
    <AuthenticatedAppShell title="Activity History">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <section className="space-y-2">
          <p className="text-sm font-medium text-primary">Operational Timeline</p>
          <h2 className="text-2xl font-semibold tracking-tight">Recent activity across the dealership</h2>
          <p className="text-sm text-muted-foreground">
            Review the latest lead, vehicle, link, and sale events in one reverse-chronological feed.
          </p>
        </section>

        <Card className="border-border/70 py-0 shadow-xs">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Overall Activity</CardTitle>
            <CardDescription>Latest operational events captured by the backend audit trail.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {activityQuery.isPending ? (
              <ModuleLoadingState label="Loading activity history" />
            ) : activityQuery.error ? (
              <ApiErrorAlert
                title="Unable to load activity history"
                message={getApiErrorMessage(activityQuery.error, "")}
              />
            ) : events.length ? (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{event.summary}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full text-[11px]">
                          {getEntityLabel(event.entityType)}
                        </Badge>
                        <Badge variant="outline" className="rounded-full text-[11px]">
                          {getActionLabel(event.actionType)}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{event.actorDisplayName ?? "System"}</span>
                      <span>{format(new Date(event.timestamp), "MMM d, yyyy h:mm a")}</span>
                      <span>{event.entityId}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No activity yet"
                description="Timeline events will appear here once staff start working leads, inventory, and sales."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedAppShell>
  )
}
