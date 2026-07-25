import type { PaginatedResponseMeta } from "@/types/api"

export type FinancingApplicationStatus =
  | "draft"
  | "collecting_requirements"
  | "under_review"
  | "needs_revision"
  | "approved"
  | "rejected"
  | "loan_released"
  | "vehicle_released"
  | "cancelled"

export type FinancingRequirementStatus =
  | "pending"
  | "submitted"
  | "accepted"
  | "revision_requested"

export interface FinancingPartner {
  id: string
  name: string
  contactPerson: string | null
  contactNumber: string | null
  email: string | null
  notes: string | null
  isActive: boolean
  representatives: FinancingPartnerRepresentative[]
  createdAt: string
  updatedAt: string
}

export interface FinancingPartnerRepresentative {
  id: string
  partnerId: string
  userId: string
  fullName: string
  email: string
  roleName: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FinancingRequirementTemplate {
  id: string
  partnerId: string
  name: string
  description: string | null
  isDefault: boolean
  isActive: boolean
  items: Array<{
    id: string
    label: string
    description: string | null
    isRequired: boolean
    sortOrder: number
  }>
}

export interface FinancingDocumentVersion {
  id: string
  versionNumber: number
  originalFilename: string
  mimeType: string
  fileSize: number
  isCurrent: boolean
  createdAt: string
}

export interface FinancingRequirement {
  id: string
  label: string
  description: string | null
  isRequired: boolean
  sortOrder: number
  status: FinancingRequirementStatus
  revisionReason: string | null
  reviewNote: string | null
  reviewedAt: string | null
  documents: FinancingDocumentVersion[]
}

export interface FinancingApplication {
  id: string
  applicationNumber: string
  buyerLeadId: string
  vehicleId: string
  partnerId: string
  representativeUserId: string
  assignedStaffUserId: string
  status: FinancingApplicationStatus
  buyer: { id: string; name: string; contactNumber: string }
  vehicle: { id: string; stockNumber: string; label: string }
  partner: { id: string; name: string }
  representative: { id: string; name: string }
  assignedStaff: { id: string; name: string }
  requirementProgress: { total: number; submitted: number; accepted: number }
  requestedAmount: string | null
  downPayment: string | null
  termMonths: number | null
  decisionNote: string | null
  decidedAt: string | null
  releasedLoanAmount: string | null
  loanReleasedAt: string | null
  loanReleaseReference: string | null
  vehicleReleasedAt: string | null
  vehicleReleaseNote: string | null
  requirements: FinancingRequirement[]
  activeUploadLink: { id: string; expires_at: string; created_at: string } | null
  activity?: unknown[]
  createdAt: string
  updatedAt: string
}

export interface FinancingApplicationsResponse extends PaginatedResponseMeta {
  applications: FinancingApplication[]
}

export interface FinancingApplicationResponse {
  application: FinancingApplication
}

export interface FinancingPartnersResponse {
  partners: FinancingPartner[]
}

export interface FinancingTemplatesResponse {
  templates: FinancingRequirementTemplate[]
}

export interface FinancingUploadLinkResponse {
  uploadLink: {
    token: string
    expiresAt: string
  }
}

export interface FinancingUploadSession {
  sessionToken: string
  application: PublicFinancingApplication
}

export interface PublicFinancingApplication {
  id: string
  applicationNumber: string
  status: FinancingApplicationStatus
  requirements: Array<{
    id: string
    label: string
    description: string | null
    isRequired: boolean
    status: FinancingRequirementStatus
    revisionReason: string | null
    documents: Array<{
      id: string
      originalFilename: string
      mimeType: string
      fileSize: number
      createdAt: string
    }>
  }>
}
