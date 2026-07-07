"use client"

import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  VehicleQualityIssue,
  VehicleQualityIssueSeverity,
  VehicleQualityScore,
  VehicleStatus,
} from "@/types/vehicles"

import { AnimatedQualityProgress } from "./animated-quality-progress"

import {
  GRADE_BADGE_CLASSES,
  GRADE_LABELS,
  SEVERITY_BADGE_CLASSES,
  SEVERITY_LABELS,
} from "./vehicle-quality.helpers"

const SEVERITY_ICONS: Record<
  VehicleQualityIssueSeverity,
  typeof AlertTriangleIcon
> = {
  critical: AlertTriangleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
}

export function VehicleQualityPanel({
  quality,
  status,
  className,
}: {
  quality: VehicleQualityScore | null | undefined
  status: VehicleStatus
  className?: string
}) {
  if (!quality) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Inventory readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Quality score is unavailable for this vehicle right now.
          </p>
        </CardContent>
      </Card>
    )
  }

  const isSold = status === "Sold"
  const sections: Array<{
    title: string
    severity: VehicleQualityIssueSeverity
    items: VehicleQualityIssue[]
    emptyHint: string
  }> = [
    {
      title: "Critical",
      severity: "critical",
      items: quality.blockingIssues,
      emptyHint: "No critical issues.",
    },
    {
      title: "Warnings",
      severity: "warning",
      items: quality.warnings,
      emptyHint: "No warnings.",
    },
    {
      title: "Suggestions",
      severity: "info",
      items: quality.suggestions,
      emptyHint: "No suggestions.",
    },
  ]

  const totalIssues =
    quality.blockingIssues.length +
    quality.warnings.length +
    quality.suggestions.length

  return (
    <Card className={className}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Inventory readiness</CardTitle>
            <p className="text-xs text-muted-foreground">
              {isSold
                ? "Active-inventory checks are adjusted for sold vehicles."
                : "Score reflects core data completeness, pricing, media, profitability, freshness, and status."}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${GRADE_BADGE_CLASSES[quality.grade]}`}
          >
            {GRADE_LABELS[quality.grade]}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold tabular-nums">
              {quality.score}
              <span className="text-sm font-normal text-muted-foreground">
                /100
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {totalIssues === 0
                ? "No outstanding items"
                : `${totalIssues} item${totalIssues === 1 ? "" : "s"} to review`}
            </span>
          </div>
          <AnimatedQualityProgress score={quality.score} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {totalIssues === 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2Icon className="size-4" />
            <span>This vehicle meets all readiness checks.</span>
          </div>
        ) : null}
        {sections.map((section) => (
          <IssueSection
            key={section.severity}
            title={section.title}
            severity={section.severity}
            items={section.items}
            emptyHint={section.emptyHint}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function IssueSection({
  title,
  severity,
  items,
  emptyHint,
}: {
  title: string
  severity: VehicleQualityIssueSeverity
  items: VehicleQualityIssue[]
  emptyHint: string
}) {
  const Icon = SEVERITY_ICONS[severity]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </h4>
        <Badge
          variant="outline"
          className={`rounded-full px-2 py-0 text-[10px] font-medium ${SEVERITY_BADGE_CLASSES[severity]}`}
        >
          {items.length}
        </Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyHint}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((issue) => (
            <li
              key={issue.code}
              className="flex items-start gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm"
            >
              <Icon
                className={`mt-0.5 size-4 shrink-0 ${
                  severity === "critical"
                    ? "text-rose-600 dark:text-rose-400"
                    : severity === "warning"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-500"
                }`}
              />
              <div className="space-y-1">
                <p className="font-medium text-foreground">{issue.label}</p>
                <p className="text-xs text-muted-foreground">
                  {issue.description}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {SEVERITY_LABELS[severity]} · {issue.code}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
