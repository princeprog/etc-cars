"use client"

import Link from "next/link"
import { AlertTriangleIcon, ArrowRightIcon, InfoIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardInventoryQuality } from "@/types/dashboard"
import type {
  VehicleQualityGrade,
  VehicleQualityIssueSeverity,
} from "@/types/vehicles"

import { AnimatedQualityProgress } from "../vehicles/animated-quality-progress"
import {
  GRADE_BADGE_CLASSES,
  GRADE_LABELS,
  SEVERITY_BADGE_CLASSES,
} from "../vehicles/vehicle-quality.helpers"

const GRADE_ORDER: VehicleQualityGrade[] = [
  "excellent",
  "good",
  "needs_attention",
  "incomplete",
]

export function InventoryQualityWidget({
  summary,
}: {
  summary: DashboardInventoryQuality
}) {
  const hasVehicles = summary.totalActiveVehicles > 0

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Inventory readiness</CardTitle>
            <p className="text-xs text-muted-foreground">
              Average score across {summary.totalActiveVehicles} active vehicle
              {summary.totalActiveVehicles === 1 ? "" : "s"} (excludes sold).
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link href="/vehicles">
              View vehicles
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </Button>
        </div>
        {hasVehicles ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold tabular-nums">
                {summary.averageScore}
                <span className="text-sm font-normal text-muted-foreground">
                  /100
                </span>
              </span>
            </div>
            <AnimatedQualityProgress score={summary.averageScore} />
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5">
        {!hasVehicles ? (
          <p className="text-sm text-muted-foreground">
            No active vehicles to evaluate yet.
          </p>
        ) : (
          <>
            <GradeBreakdown summary={summary} />
            <TopIssues summary={summary} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

function GradeBreakdown({ summary }: { summary: DashboardInventoryQuality }) {
  const total = summary.totalActiveVehicles

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Grade breakdown
      </h4>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {GRADE_ORDER.map((grade) => {
          const count = summary.gradeCounts[grade]
          const share = total === 0 ? 0 : Math.round((count / total) * 100)

          return (
            <div
              key={grade}
              className="rounded-md border bg-muted/20 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className={`rounded-full px-2 py-0 text-[10px] font-medium ${GRADE_BADGE_CLASSES[grade]}`}
                >
                  {GRADE_LABELS[grade]}
                </Badge>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {share}%
                </span>
              </div>
              <p className="mt-1 text-lg font-semibold tabular-nums">{count}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TopIssues({ summary }: { summary: DashboardInventoryQuality }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Top issues
      </h4>
      {summary.topIssues.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No outstanding issues across active inventory.
        </p>
      ) : (
        <ul className="space-y-2">
          {summary.topIssues.map((issue) => {
            const Icon =
              issue.severity === "info" ? InfoIcon : AlertTriangleIcon
            return (
              <li
                key={issue.code}
                className="flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2 text-sm"
              >
                <Icon
                  className={`mt-0.5 size-4 shrink-0 ${getIconColor(issue.severity)}`}
                />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-foreground">{issue.label}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {issue.code}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-full px-2 py-0 text-[10px] font-medium ${SEVERITY_BADGE_CLASSES[issue.severity]}`}
                >
                  {issue.count} vehicle{issue.count === 1 ? "" : "s"}
                </Badge>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function getIconColor(severity: VehicleQualityIssueSeverity) {
  switch (severity) {
    case "critical":
      return "text-rose-600 dark:text-rose-400"
    case "warning":
      return "text-amber-600 dark:text-amber-400"
    case "info":
    default:
      return "text-slate-500"
  }
}
