export type LeadPipelineActionTarget =
  | "follow_up"
  | "vehicle_link"
  | "sale_finalization"
  | "lead_edit"
  | "vehicle_create"
  | "evaluation"
  | "view"

export type LeadPipelineSeverity = "critical" | "warning" | "info"

export interface LeadPipelineAction {
  code: string
  label: string
  description: string
  target?: LeadPipelineActionTarget
}

export interface LeadPipelineBlocker {
  code: string
  label: string
  description: string
  severity: LeadPipelineSeverity
  target?: LeadPipelineActionTarget
}

export interface LeadPipelineState {
  stage: string
  stageLabel: string
  progressPercent: number
  nextAction: LeadPipelineAction | null
  blockers: LeadPipelineBlocker[]
  warnings: LeadPipelineBlocker[]
  lastActivityAt: string | null
  isStale: boolean
  context?: {
    openFollowUpCount: number
    latestFollowUpAt: string | null
    latestCompletedFollowUpAt: string | null
    linkedVehicleCount?: number
    availableLinkedVehicleCount?: number
    reservedLinkedVehicleCount?: number
    soldLinkedVehicleCount?: number
    finalizedSaleCount?: number
    vehicleCreated?: boolean
    staleAfterDays: number
  }
}
