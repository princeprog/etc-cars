"use client"

import { AlertTriangleIcon, Clock3Icon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { LeadPipelineState } from "@/types/lead-pipeline"

function severityLabel(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`
}

export function LeadPipelineSummary({
  pipeline,
}: {
  pipeline: LeadPipelineState
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pipeline stage</p>
            <p className="text-sm font-semibold text-foreground">{pipeline.stageLabel}</p>
          </div>
          <Badge variant="outline" className="rounded-full">
            {pipeline.progressPercent}% ready
          </Badge>
        </div>
        <div className="mt-3 space-y-2">
          <Progress value={pipeline.progressPercent} />
          <p className="text-xs text-muted-foreground">
            {pipeline.nextAction?.description ?? "No immediate action is required for this record."}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {pipeline.blockers.length ? (
            <Badge variant="destructive">{severityLabel(pipeline.blockers.length, "blocker")}</Badge>
          ) : null}
          {pipeline.warnings.length ? (
            <Badge variant="outline">{severityLabel(pipeline.warnings.length, "warning")}</Badge>
          ) : null}
          {pipeline.isStale ? (
            <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300">
              Stale
            </Badge>
          ) : null}
        </div>
      </div>

      <Alert>
        <Clock3Icon className="size-4" />
        <AlertTitle>Next action</AlertTitle>
        <AlertDescription>
          {pipeline.nextAction?.description ?? "No immediate action is required for this record."}
        </AlertDescription>
      </Alert>

      {pipeline.blockers.map((blocker) => (
        <Alert key={blocker.code} variant={blocker.severity === "critical" ? "destructive" : "default"}>
          <AlertTriangleIcon className="size-4" />
          <AlertTitle>{blocker.label}</AlertTitle>
          <AlertDescription>{blocker.description}</AlertDescription>
        </Alert>
      ))}

      {pipeline.warnings.map((warning) => (
        <Alert key={warning.code}>
          <AlertTriangleIcon className="size-4" />
          <AlertTitle>{warning.label}</AlertTitle>
          <AlertDescription>{warning.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
