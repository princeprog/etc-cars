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
  availableVehicles: number
  reservedVehicles: number
  soldVehicles: number
  monthlySales: number
  monthlyRevenue: string
  monthlyProfit: string
  inventoryQuality: DashboardInventoryQuality
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
  queues: {
    overdueFollowUps: DashboardFollowUpQueueItem[]
    dueTodayFollowUps: DashboardFollowUpQueueItem[]
    newSellerLeads: DashboardSellerLeadQueueItem[]
    newBuyerLeads: DashboardBuyerLeadQueueItem[]
  }
}
