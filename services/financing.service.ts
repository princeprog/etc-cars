import { API_ENDPOINTS, buildApiUrl } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import { AppApiError, type ApiErrorResponse } from "@/types/api"
import type {
  FinancingApplicationResponse,
  FinancingApplicationsResponse,
  FinancingPartnersResponse,
  FinancingTemplatesResponse,
  FinancingUploadLinkResponse,
  FinancingUploadSession,
  PublicFinancingApplication,
} from "@/types/financing"

export type FinancingApplicationFilters = {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  partnerId?: string
  representativeUserId?: string
  assignedStaffUserId?: string
}

export function getFinancingApplications(filters?: FinancingApplicationFilters) {
  const params = new URLSearchParams()
  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      params.set(key, String(value))
    }
  })
  const query = params.toString()
  return apiRequest<FinancingApplicationsResponse>(
    query
      ? `${API_ENDPOINTS.financing.applications}?${query}`
      : API_ENDPOINTS.financing.applications,
  )
}

export function getFinancingApplication(id: string) {
  return apiRequest<FinancingApplicationResponse>(
    API_ENDPOINTS.financing.applicationById(id),
  )
}

export function getFinancingPartners() {
  return apiRequest<FinancingPartnersResponse>(API_ENDPOINTS.financing.partners)
}

export function createFinancingPartner(payload: {
  name: string
  contactPerson?: string | null
  contactNumber?: string | null
  email?: string | null
  notes?: string | null
}) {
  return apiRequest(API_ENDPOINTS.financing.partners, {
    method: "POST",
    body: payload,
  })
}

export function addFinancingRepresentative(
  partnerId: string,
  payload: { userId: string; isActive?: boolean },
) {
  return apiRequest(API_ENDPOINTS.financing.partnerRepresentatives(partnerId), {
    method: "POST",
    body: payload,
  })
}

export function getFinancingTemplates(partnerId?: string) {
  return apiRequest<FinancingTemplatesResponse>(
    partnerId
      ? `${API_ENDPOINTS.financing.templates}?partnerId=${encodeURIComponent(partnerId)}`
      : API_ENDPOINTS.financing.templates,
  )
}

export function createFinancingTemplate(payload: {
  partnerId: string
  name: string
  description?: string | null
  isDefault?: boolean
  items: Array<{
    label: string
    description?: string | null
    isRequired?: boolean
    sortOrder?: number
  }>
}) {
  return apiRequest(API_ENDPOINTS.financing.templates, {
    method: "POST",
    body: payload,
  })
}

export function createFinancingApplication(payload: {
  buyerLeadId: string
  vehicleId: string
  partnerId: string
  representativeUserId: string
  assignedStaffUserId?: string | null
  templateId?: string | null
  requestedAmount?: string | null
  downPayment?: string | null
  termMonths?: number | null
}) {
  return apiRequest<FinancingApplicationResponse, typeof payload>(
    API_ENDPOINTS.financing.applications,
    {
      method: "POST",
      body: payload,
    },
  )
}

export function generateFinancingUploadLink(id: string) {
  return apiRequest<FinancingUploadLinkResponse>(
    API_ENDPOINTS.financing.uploadLink(id),
    { method: "POST" },
  )
}

export function revokeFinancingUploadLink(id: string) {
  return apiRequest(API_ENDPOINTS.financing.revokeUploadLink(id), {
    method: "POST",
  })
}

export function reviewFinancingRequirement(
  applicationId: string,
  requirementId: string,
  payload: { status: "accepted" | "revision_requested"; revisionReason?: string | null; note?: string | null },
) {
  return apiRequest<FinancingApplicationResponse, typeof payload>(
    API_ENDPOINTS.financing.reviewRequirement(applicationId, requirementId),
    { method: "POST", body: payload },
  )
}

export function decideFinancingApplication(
  id: string,
  payload: { decision: "approved" | "rejected"; note?: string | null },
) {
  return apiRequest<FinancingApplicationResponse, typeof payload>(
    API_ENDPOINTS.financing.decision(id),
    { method: "POST", body: payload },
  )
}

export function recordFinancingLoanRelease(
  id: string,
  payload: {
    releasedLoanAmount: string
    loanReleasedAt: string
    loanReleaseReference?: string | null
  },
) {
  return apiRequest<FinancingApplicationResponse, typeof payload>(
    API_ENDPOINTS.financing.loanRelease(id),
    { method: "POST", body: payload },
  )
}

export function recordFinancingVehicleRelease(
  id: string,
  payload: { vehicleReleasedAt?: string | null; note?: string | null },
) {
  return apiRequest<FinancingApplicationResponse, typeof payload>(
    API_ENDPOINTS.financing.vehicleRelease(id),
    { method: "POST", body: payload },
  )
}

export function uploadFinancingRequirementDocument(
  applicationId: string,
  requirementId: string,
  file: File,
) {
  const body = new FormData()
  body.set("file", file)
  return apiRequest<FinancingApplicationResponse, FormData>(
    API_ENDPOINTS.financing.requirementDocuments(applicationId, requirementId),
    { method: "POST", body },
  )
}

export function getFinancingDocumentDownloadUrl(
  applicationId: string,
  documentId: string,
) {
  return apiRequest<{ downloadUrl: string }>(
    API_ENDPOINTS.financing.documentDownload(applicationId, documentId),
  )
}

export async function verifyPublicFinancingUpload(
  token: string,
  contactNumber: string,
) {
  return publicRequest<FinancingUploadSession>(
    API_ENDPOINTS.financing.publicVerify(token),
    {
      method: "POST",
      body: { contactNumber },
    },
  )
}

export async function getPublicFinancingChecklist(
  token: string,
  sessionToken: string,
) {
  return publicRequest<{ application: PublicFinancingApplication }>(
    API_ENDPOINTS.financing.publicUpload(token),
    {
      headers: { "x-financing-upload-session": sessionToken },
    },
  )
}

export async function uploadPublicFinancingRequirementDocument(
  token: string,
  sessionToken: string,
  requirementId: string,
  file: File,
) {
  const body = new FormData()
  body.set("file", file)
  return publicRequest<{ application: PublicFinancingApplication }>(
    API_ENDPOINTS.financing.publicRequirementDocuments(token, requirementId),
    {
      method: "POST",
      headers: { "x-financing-upload-session": sessionToken },
      body,
    },
  )
}

export async function submitPublicFinancingRequirements(
  token: string,
  sessionToken: string,
) {
  return publicRequest<{ application: PublicFinancingApplication }>(
    API_ENDPOINTS.financing.publicSubmit(token),
    {
      method: "POST",
      body: { sessionToken },
    },
  )
}

async function publicRequest<TResponse>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: unknown } = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers)
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData

  if (options.body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
    body:
      options.body === undefined
        ? undefined
        : isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => undefined)) as
      | ApiErrorResponse
      | undefined
    const message = Array.isArray(payload?.message)
      ? payload.message.join(", ")
      : payload?.message || payload?.error || "Request failed"
    throw new AppApiError(message, response.status, payload)
  }

  return (await response.json()) as TResponse
}
