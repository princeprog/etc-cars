"use client"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { VehicleQualityScore } from "@/types/vehicles"

import {
  GRADE_BADGE_CLASSES,
  GRADE_SHORT_LABELS,
  getIssueCount,
} from "./vehicle-quality.helpers"

type Size = "sm" | "md"

export function VehicleQualityBadge({
  quality,
  size = "sm",
  showScore = true,
}: {
  quality: VehicleQualityScore | null | undefined
  size?: Size
  showScore?: boolean
}) {
  if (!quality) {
    return (
      <Badge
        variant="outline"
        className="rounded-full px-2 py-0.5 text-[11px] text-muted-foreground"
      >
        Score N/A
      </Badge>
    )
  }

  const { critical, warning, info } = getIssueCount(quality)

  const label = GRADE_SHORT_LABELS[quality.grade]
  const className = GRADE_BADGE_CLASSES[quality.grade]

  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-[11px] font-medium"
      : "px-2.5 py-1 text-xs font-semibold"

  const content = (
    <Badge
      variant="outline"
      className={`rounded-full ${sizeClass} ${className}`}
      aria-label={`Quality ${label} score ${quality.score}`}
    >
      <span className="tabular-nums">
        {showScore ? `${quality.score} ` : ""}
        {label}
      </span>
    </Badge>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{content}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs space-y-1 text-xs">
        <p className="font-medium">Inventory readiness {quality.score}/100</p>
        {critical + warning + info === 0 ? (
          <p className="text-muted-foreground">
            No outstanding readiness issues.
          </p>
        ) : (
          <ul className="space-y-0.5 text-muted-foreground">
            {critical ? (
              <li>
                {critical} critical issue{critical === 1 ? "" : "s"}
              </li>
            ) : null}
            {warning ? (
              <li>
                {warning} warning{warning === 1 ? "" : "s"}
              </li>
            ) : null}
            {info ? (
              <li>
                {info} suggestion{info === 1 ? "" : "s"}
              </li>
            ) : null}
          </ul>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
