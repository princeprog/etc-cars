import type {
  VehicleQualityGrade,
  VehicleQualityIssueSeverity,
} from "./vehicles"

export interface DashboardInventoryQualityIssue {
  code: string
  label: string
  severity: VehicleQualityIssueSeverity
  count: number
}

export interface DashboardInventoryQuality {
  averageScore: number
  totalActiveVehicles: number
  gradeCounts: Record<VehicleQualityGrade, number>
  topIssues: DashboardInventoryQualityIssue[]
  lastEvaluatedAt: string
}

export interface DashboardMetrics {
  activeInventory: number
  activeSellerLeads: number
  sellerLeadsRequiringAction: number
  inspectionsPending: number
  approvedLeadsAwaitingConversion: number
  availableVehicles: number
  reservedVehicles: number
  soldVehicles: number
  monthlySales: number
  monthlyRevenue: string
  monthlyProfit: string
  inventoryQuality: DashboardInventoryQuality
}

export interface DashboardTrendPoint {
  label: string
  periodStart: string
  vehiclesAcquired: number
  vehiclesSold: number
}

export type DashboardSellerLeadPipelineStatus =
  | "New Inquiry"
  | "Contacted"
  | "Inspection Scheduled"
  | "Evaluated"
  | "Negotiating"
  | "Approved to Buy"

export interface DashboardSellerLeadPipelineItem {
  status: DashboardSellerLeadPipelineStatus
  count: number
}

export interface DashboardFollowUpQueueItem {
  id: string
  leadType: "buyer" | "seller"
  sellerLeadId: string | null
  buyerLeadId: string | null
  assigneeUserId: string
  dueAt: string
  status: "Due" | "Overdue"
  note: string
}

export interface DashboardSellerLeadQueueItem {
  id: string
  sellerName: string
  vehicleBrand: string
  vehicleModel: string
  status: string
  createdAt: string
}

export interface DashboardBuyerLeadQueueItem {
  id: string
  buyerName: string
  contactNumber: string
  status: string
  createdAt: string
}

export interface DashboardResponse {
  metrics: DashboardMetrics
  analytics: {
    acquisitionSalesTrend: {
      twelveWeeks: DashboardTrendPoint[]
      sixMonths: DashboardTrendPoint[]
      oneYear: DashboardTrendPoint[]
    }
    sellerLeadPipeline: DashboardSellerLeadPipelineItem[]
  }
  queues: {
    overdueFollowUps: DashboardFollowUpQueueItem[]
    dueTodayFollowUps: DashboardFollowUpQueueItem[]
    newSellerLeads: DashboardSellerLeadQueueItem[]
    newBuyerLeads: DashboardBuyerLeadQueueItem[]
  }
}
