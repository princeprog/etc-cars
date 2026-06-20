import type { Vehicle } from "@/types/vehicles"

export interface Commission {
  id: string
  saleId: string
  agentName: string | null
  defaultAmount: string | null
  overrideAmount: string | null
  finalAmount: string
  overrideReason: string | null
  createdAt: string
  updatedAt: string
}

export interface Sale {
  id: string
  vehicleId: string
  buyerLeadId: string
  createdByUserId: string
  agentName: string | null
  saleDate: string
  finalSaleAmount: string
  grossProfitAmount: string | null
  commissionMethod: string | null
  commissionLocked: boolean
  createdAt: string
  updatedAt: string
}

export interface SaleWithDetails extends Sale {
  commission: Commission
  vehicle: Vehicle
}

export interface CreateSalePayload {
  vehicleId: string
  buyerLeadId: string
  saleDate: string
  finalSaleAmount: string
  agentName?: string | null
  commissionOverrideAmount?: string | null
  commissionOverrideReason?: string | null
  buyerClosingNote?: string | null
}

export interface CreateSaleResponse {
  sale: Sale
  commission: Commission
  vehicle: Vehicle
}

export interface SaleResponse {
  sale: SaleWithDetails
}

export interface SalesResponse {
  sales: SaleWithDetails[]
}
