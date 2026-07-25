import type { PaginatedResponseMeta } from "@/types/api";
import type { Vehicle } from "@/types/vehicles";

export interface SaleBuyerLeadSummary {
  id: string;
  buyerName: string;
  contactNumber: string;
  email: string | null;
  status: string;
  closingNote: string | null;
}

export interface Commission {
  id: string;
  saleId: string;
  agentName: string | null;
  defaultAmount: string | null;
  overrideAmount: string | null;
  finalAmount: string;
  overrideReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  recordType: "sale";
  status: "finalized" | "commission_locked" | "needs_review";
  saleNumber: string;
  vehicleId: string;
  buyerLeadId: string;
  createdByUserId: string;
  agentName: string | null;
  saleDate: string;
  finalSaleAmount: string;
  grossProfitAmount: string | null;
  trackedCostsTotal: string;
  profitAfterTrackedCosts: string | null;
  commissionMethod: string | null;
  commissionLocked: boolean;
  paymentMode: "cash" | "financing";
  financingApplicationId: string | null;
  financing: {
    applicationId: string;
    applicationNumber: string | null;
    partnerId: string | null;
    partnerName: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaleWithDetails extends Sale {
  buyerLead: SaleBuyerLeadSummary;
  commission: Commission;
  vehicle: Vehicle;
}

export interface SaleDraft {
  id: string;
  recordType: "draft";
  status: "draft";
  draftNumber: string;
  vehicleId: string;
  buyerLeadId: string;
  createdByUserId: string;
  agentName: string | null;
  saleDate: string | null;
  finalSaleAmount: string | null;
  commissionOverrideAmount: string | null;
  commissionOverrideReason: string | null;
  buyerClosingNote: string | null;
  paymentMode: "cash" | "financing";
  financingApplicationId: string | null;
  financing: {
    applicationId: string;
    applicationNumber: string | null;
    partnerId: string | null;
    partnerName: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  buyerLead: SaleBuyerLeadSummary;
  vehicle: Vehicle;
}

export type SalesListItem = SaleWithDetails | SaleDraft;

export interface CreateSalePayload {
  vehicleId: string;
  buyerLeadId: string;
  saleDate: string;
  finalSaleAmount: string;
  agentName?: string | null;
  commissionOverrideAmount?: string | null;
  commissionOverrideReason?: string | null;
  buyerClosingNote?: string | null;
}

export interface CreateSaleResponse {
  sale: Sale;
  commission: Commission;
  vehicle: Vehicle;
}

export interface SaveSaleDraftPayload {
  vehicleId: string;
  buyerLeadId: string;
  saleDate?: string | null;
  finalSaleAmount?: string | null;
  agentName?: string | null;
  commissionOverrideAmount?: string | null;
  commissionOverrideReason?: string | null;
  buyerClosingNote?: string | null;
  paymentMode?: "cash" | "financing" | null;
  financingApplicationId?: string | null;
}

export type UpdateSaleDraftPayload = Partial<SaveSaleDraftPayload>;

export interface SaleDraftResponse {
  draft: SaleDraft;
}

export interface DeleteSaleDraftResponse {
  id: string;
}

export interface SaleResponse {
  sale: SaleWithDetails;
}

export interface SalesListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?:
    | "all"
    | "draft"
    | "finalized"
    | "commission_locked"
    | "needs_review";
  agentName?: string;
  dateRange?: "all" | "this_month" | "last_30_days";
  sortBy?:
    | "saleDate"
    | "createdAt"
    | "finalSaleAmount"
    | "saleNumber"
    | "agentName";
  sortOrder?: "asc" | "desc";
}

export interface SalesResponse extends PaginatedResponseMeta {
  sales: SalesListItem[];
}

export interface SalesSummaryResponse {
  totalSales: number;
  totalRevenue: string;
  totalGrossProfit: string;
  totalCommissionPayouts: string;
  totalProfitAfterTrackedCosts: string;
  totalDrafts?: number;
}
