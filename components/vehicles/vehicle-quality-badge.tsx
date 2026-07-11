"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { VehicleQualityScore } from "@/types/vehicles"

import { GRADE_LABELS, getIssueCount } from "./vehicle-quality.helpers"

type Size = "sm" | "md"

const GRADE_TEXT_CLASSES: Record<VehicleQualityScore["grade"], string> = {
  excellent: "text-emerald-700 dark:text-emerald-300",
  good: "text-sky-700 dark:text-sky-300",
  needs_attention: "text-amber-700 dark:text-amber-300",
  incomplete: "text-rose-700 dark:text-rose-300",
}

export function VehicleQualityBadge({
  quality,
  size = "sm",
}: {
  quality: VehicleQualityScore | null | undefined
  size?: Size
}) {
  if (!quality) {
    return (
      <span className="text-[11px] font-medium text-muted-foreground">
        N/A
      </span>
    )
  }

  const { critical, warning, info } = getIssueCount(quality)

  const label = GRADE_LABELS[quality.grade]
  const className = GRADE_TEXT_CLASSES[quality.grade]

  const sizeClass = size === "sm" ? "text-[11px]" : "text-xs"

  const content = (
    <span
      className={`inline-flex items-baseline gap-1 font-semibold tabular-nums ${sizeClass}`}
      aria-label={`Quality ${label} score ${quality.score} out of 100`}
    >
      <span className={className}>{quality.score}</span>
      <span className="font-medium text-muted-foreground">/ 100</span>
    </span>
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
