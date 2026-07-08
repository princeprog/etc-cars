import type {
  VehicleQualityGrade,
  VehicleQualityIssueSeverity,
  VehicleQualityScore,
} from "@/types/vehicles"

export const GRADE_LABELS: Record<VehicleQualityGrade, string> = {
  excellent: "Excellent",
  good: "Good",
  needs_attention: "Needs attention",
  incomplete: "Incomplete",
}

export const GRADE_SHORT_LABELS: Record<VehicleQualityGrade, string> = {
  excellent: "Excellent",
  good: "Good",
  needs_attention: "Review",
  incomplete: "Incomplete",
}

export const GRADE_BADGE_CLASSES: Record<VehicleQualityGrade, string> = {
  excellent:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  good:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  needs_attention:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  incomplete:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
}

export const SEVERITY_LABELS: Record<VehicleQualityIssueSeverity, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Suggestion",
}

export const SEVERITY_BADGE_CLASSES: Record<VehicleQualityIssueSeverity, string> = {
  critical:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  info:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300",
}

export const VEHICLE_QUALITY_FILTERS = [
  { label: "All quality", value: "all" },
  { label: "Excellent", value: "excellent" },
  { label: "Good", value: "good" },
  { label: "Needs attention", value: "needs_attention" },
  { label: "Incomplete", value: "incomplete" },
] as const

export type VehicleQualityFilterValue =
  (typeof VEHICLE_QUALITY_FILTERS)[number]["value"]

export function getIssueCount(quality: VehicleQualityScore | null | undefined) {
  if (!quality) {
    return { critical: 0, warning: 0, info: 0, total: 0 }
  }
  return {
    critical: quality.blockingIssues.length,
    warning: quality.warnings.length,
    info: quality.suggestions.length,
    total:
      quality.blockingIssues.length +
      quality.warnings.length +
      quality.suggestions.length,
  }
}
