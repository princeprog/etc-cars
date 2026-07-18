export type LeadPipelineActionTarget =
  | "follow_up"
  | "sale_finalization"
  | "lead_edit"
  | "vehicle_create"

export type LeadPipelineSeverity = "critical" | "warning" | "info"

export interface LeadPipelineBlocker {
  code: string
  label: string
  description: string
  severity: LeadPipelineSeverity
  target?: LeadPipelineActionTarget
}

export interface LeadPipelineNextAction {
  code: string
  label: string
  description: string
  target?: LeadPipelineActionTarget
}

export interface LeadPipelineState {
  stage: string
  stageLabel: string
  progressPercent: number
  nextAction: LeadPipelineNextAction | null
  blockers: LeadPipelineBlocker[]
  warnings: LeadPipelineBlocker[]
  lastActivityAt: string | null
  isStale: boolean
  context: {
    openFollowUpCount: number
    latestFollowUpAt: string | null
    latestCompletedFollowUpAt: string | null
    finalizedSaleCount?: number
    vehicleCreated?: boolean
    staleAfterDays: number
  }
}
