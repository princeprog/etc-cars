import type {
  VehicleQualityGrade,
  VehicleQualityIssueSeverity,
} from "./vehicles";

export type DashboardRange =
  "this_month" | "last_30_days" | "last_90_days" | "year_to_date";

export interface DashboardPeriod {
  key: DashboardRange;
  label: string;
  startDate: string;
  endDate: string;
  groupBy: "day" | "week" | "month";
}

export interface DashboardInventoryQualityIssue {
  code: string;
  label: string;
  severity: VehicleQualityIssueSeverity;
  count: number;
}

export interface DashboardInventoryQuality {
  averageScore: number;
  totalActiveVehicles: number;
  gradeCounts: Record<VehicleQualityGrade, number>;
  topIssues: DashboardInventoryQualityIssue[];
  lastEvaluatedAt: string;
}

export interface DashboardInventory {
  active: number;
  statuses: {
    Incoming: number;
    Reconditioning: number;
    Available: number;
    Reserved: number;
  };
  quality: DashboardInventoryQuality;
}

export interface AdminDashboardInventory extends DashboardInventory {
  totalInventoryValue: string;
}

export interface DashboardExpenseSummary {
  totalExpenses: number;
  totalExpectedAmount: string;
  paidAmount: string;
  unpaidAmount: string;
  overdueCount: number;
  overdueAmount: string;
  dueWithinSevenDaysCount: number;
  dueWithinSevenDaysAmount: string;
  highestSpendingCategory: {
    categoryId: string;
    categoryName: string;
    count: number;
    expectedAmount: string;
    paidAmount: string;
    unpaidAmount: string;
  } | null;
  asOfDate: string;
}

export interface DashboardSalesTrendPoint {
  period: string;
  periodLabel: string;
  salesCount: number;
  revenue: string;
  grossProfit: string;
  commissionPayouts?: string;
}

export type DashboardSellerLeadPipelineStatus =
  | "New Inquiry"
  | "Contacted"
  | "Inspection Scheduled"
  | "Evaluated"
  | "Negotiating"
  | "Approved to Buy";

export type DashboardBuyerLeadPipelineStatus =
  "New Inquiry" | "Contacted" | "Interested" | "Negotiating" | "Reserved";

export interface DashboardPipelineItem<TStatus extends string = string> {
  status: TStatus;
  count: number;
}

export interface AdminDashboardResponse {
  view: "admin";
  period: DashboardPeriod;
  performance: {
    totalSales: number;
    revenue: string;
    grossProfit: string;
    grossMarginPercent: string;
    averageSaleValue: string;
    expenses: DashboardExpenseSummary;
    comparison: {
      salesPercent: string | null;
      revenuePercent: string | null;
      grossProfitPercent: string | null;
    };
  };
  inventory: AdminDashboardInventory;
  leads: {
    health: {
      totalBuyerLeads: number;
      totalSellerLeads: number;
      buyerWon: number;
      buyerLost: number;
      buyerActive: number;
      buyerConversionRate: string;
      sellerPurchased: number;
      sellerRejected: number;
      sellerActive: number;
      sellerConversionRate: string;
    };
    sellerPipeline: DashboardPipelineItem<DashboardSellerLeadPipelineStatus>[];
    buyerPipeline: DashboardPipelineItem<DashboardBuyerLeadPipelineStatus>[];
  };
  attention: {
    overdueFollowUps: number;
    dueTodayFollowUps: number;
    pendingInspections: number;
    approvedSellerLeads: number;
    incompleteListings: number;
    overdueExpenses: number;
  };
  trend: DashboardSalesTrendPoint[];
}

export interface DashboardPriorityItem {
  id: string;
  leadType: "buyer" | "seller";
  leadId: string | null;
  leadName: string;
  leadSecondary: string | null;
  dueAt: string;
  note: string;
  urgency: "overdue" | "today" | "upcoming";
}

export interface StaffDashboardResponse {
  view: "staff";
  period: DashboardPeriod;
  assignments: {
    openLeads: number;
    activeSellerLeads: number;
    activeBuyerLeads: number;
    dueTodayFollowUps: number;
    overdueFollowUps: number;
    pendingInspections: number;
  };
  personalPerformance: {
    totalSales: number;
    revenue: string;
    grossProfit: string;
    averageSaleValue: string;
    comparisonPercent: string | null;
    trend: DashboardSalesTrendPoint[];
  };
  inventory: DashboardInventory;
  pipelines: {
    seller: DashboardPipelineItem<DashboardSellerLeadPipelineStatus>[];
    buyer: DashboardPipelineItem<DashboardBuyerLeadPipelineStatus>[];
  };
  priorityQueue: DashboardPriorityItem[];
}

export type DashboardResponse = AdminDashboardResponse | StaffDashboardResponse;
