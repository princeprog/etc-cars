import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  CompleteFollowUpPayload,
  CreateFollowUpPayload,
  FollowUpListFilters,
  FollowUpResponse,
  FollowUpsResponse,
  FollowUpSummaryResponse,
  UpdateFollowUpPayload,
} from "@/types/follow-ups"

export function getFollowUps(filters?: FollowUpListFilters) {
  const searchParams = new URLSearchParams()

  if (filters?.status) {
    searchParams.set("status", filters.status)
  }

  if (filters?.leadType) {
    searchParams.set("leadType", filters.leadType)
  }

  if (filters?.assigneeUserId) {
    searchParams.set("assigneeUserId", filters.assigneeUserId)
  }

  if (filters?.dueFrom) {
    searchParams.set("dueFrom", filters.dueFrom)
  }

  if (filters?.dueTo) {
    searchParams.set("dueTo", filters.dueTo)
  }

  if (filters?.search) {
    searchParams.set("search", filters.search)
  }

  if (filters?.sort) {
    searchParams.set("sort", filters.sort)
  }

  if (filters?.page) {
    searchParams.set("page", String(filters.page))
  }

  if (filters?.pageSize) {
    searchParams.set("pageSize", String(filters.pageSize))
  }

  const queryString = searchParams.toString()
  const endpoint = queryString
    ? `${API_ENDPOINTS.followUps.root}?${queryString}`
    : API_ENDPOINTS.followUps.root

  return apiRequest<FollowUpsResponse>(endpoint)
}

export function getFollowUpsSummary(assigneeUserId?: string) {
  const endpoint = assigneeUserId
    ? `${API_ENDPOINTS.followUps.summary}?assigneeUserId=${encodeURIComponent(assigneeUserId)}`
    : API_ENDPOINTS.followUps.summary

  return apiRequest<FollowUpSummaryResponse>(endpoint)
}

export function getFollowUp(id: string) {
  return apiRequest<FollowUpResponse>(API_ENDPOINTS.followUps.byId(id))
}

export function createFollowUp(payload: CreateFollowUpPayload) {
  return apiRequest<FollowUpResponse, CreateFollowUpPayload>(API_ENDPOINTS.followUps.root, {
    method: "POST",
    body: payload,
  })
}

export function updateFollowUp(id: string, payload: UpdateFollowUpPayload) {
  return apiRequest<FollowUpResponse, UpdateFollowUpPayload>(API_ENDPOINTS.followUps.byId(id), {
    method: "PATCH",
    body: payload,
  })
}

export function completeFollowUp(id: string, payload: CompleteFollowUpPayload) {
  return apiRequest<FollowUpResponse, CompleteFollowUpPayload>(API_ENDPOINTS.followUps.complete(id), {
    method: "POST",
    body: payload,
  })
}
