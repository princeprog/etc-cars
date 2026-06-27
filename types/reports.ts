// Reporting module response contracts.
//
// These mirror the NestJS ReportsService output exactly. Money values are
// returned as fixed 2dp strings and percentages as fixed-precision strings so
// the UI and CSV exports render identical numbers.

export type ReportGroupBy = "day" | "week" | "month"

export interface ReportDateRange {
  startDate: string | null
  endDate: string | null
}

/** Shared filter contract sent to every reporting endpoint. */
export interface ReportFilters {
  startDate?: string
  endDate?: string
  groupBy?: ReportGroupBy
  agentName?: string
  status?: string
}

export interface SalesReportSummary {
  totalSales: number
  totalRevenue: string
  totalGrossProfit: string
  totalCommissionPayouts: string
  averageSaleValue: string
  grossMarginPercent: string
  salesWithKnownCost: number
  salesMissingCost: number
}

export interface SalesTrendPoint {
  period: string
  periodLabel: string
  salesCount: number
  revenue: string
  grossProfit: string
  commissionPayouts: string
}

export interface SalesAgentBreakdown {
  agentName: string
  salesCount: number
  revenue: string
  grossProfit: string
  commissionPayouts: string
  averageSaleValue: string
  grossMarginPercent: string
}

export interface LeadsConversion {
  totalBuyerLeads: number
  totalSellerLeads: number
  buyerWon: number
  buyerLost: number
  buyerActive: number
  buyerConversionRate: string
  sellerPurchased: number
  sellerRejected: number
  sellerActive: number
  sellerConversionRate: string
}

export interface ReportsOverviewResponse {
  dateRange: ReportDateRange
  sales: SalesReportSummary
  inventory: {
    totalUnits: number
    activeUnits: number
    available: number
    reserved: number
    sold: number
    totalInventoryValue: string
  }
  leads: LeadsConversion
  profitability: {
    totalGrossProfit: string
    grossMarginPercent: string
    averageGrossProfitPerSale: string
  }
}

export interface SalesReportResponse {
  filters: ReportDateRange & { groupBy: ReportGroupBy; agentName: string | null }
  summary: SalesReportSummary
  trend: SalesTrendPoint[]
  byAgent: SalesAgentBreakdown[]
}

export interface InventoryStatusBreakdown {
  status: string
  count: number
  percentage: string
}

export interface InventoryAgingBucket {
  bucket: string
  count: number
}

export interface InventoryBrandBreakdown {
  brand: string
  total: number
  available: number
  reserved: number
  sold: number
}

export interface InventoryReportResponse {
  basis: string
  summary: {
    totalUnits: number
    activeUnits: number
    available: number
    reserved: number
    sold: number
    incoming: number
    reconditioning: number
    totalInventoryValue: string
    soldVsAvailable: { sold: number; available: number }
  }
  byStatus: InventoryStatusBreakdown[]
  aging: InventoryAgingBucket[]
  byBrand: InventoryBrandBreakdown[]
}

export interface LeadStatusBreakdown {
  status: string
  count: number
}

export interface LeadsReportResponse {
  dateRange: ReportDateRange
  basis: string
  buyer: { total: number; byStatus: LeadStatusBreakdown[] }
  seller: { total: number; byStatus: LeadStatusBreakdown[] }
  conversion: LeadsConversion
}

export interface ProfitabilityTrendPoint {
  period: string
  periodLabel: string
  revenue: string
  grossProfit: string
  grossMarginPercent: string
}

export interface ProfitabilityReportResponse {
  filters: ReportDateRange & { groupBy: ReportGroupBy; agentName: string | null }
  summary: {
    totalRevenue: string
    totalGrossProfit: string
    grossMarginPercent: string
    averageGrossProfitPerSale: string
    salesWithKnownCost: number
    salesMissingCost: number
  }
  trend: ProfitabilityTrendPoint[]
  byAgent: SalesAgentBreakdown[]
}

export type ReportDomain = "sales" | "inventory" | "leads" | "profitability"
