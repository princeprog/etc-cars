import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  CompleteFollowUpPayload,
  CreateFollowUpPayload,
  FollowUpListFilters,
  FollowUpResponse,
  FollowUpsResponse,
} from "@/types/follow-ups"

export function getFollowUps(filters: FollowUpListFilters = {}) {
  const params = new URLSearchParams()

  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize))
  if (filters.search) params.set("search", filters.search)
  if (filters.status && filters.status !== "all") params.set("status", filters.status)
  if (filters.leadType && filters.leadType !== "all") params.set("leadType", filters.leadType)
  if (filters.assigneeUserId) params.set("assigneeUserId", filters.assigneeUserId)
  if (filters.sortBy) params.set("sortBy", filters.sortBy)
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder)

  const query = params.toString()
  const path = query ? `${API_ENDPOINTS.followUps.root}?${query}` : API_ENDPOINTS.followUps.root

  return apiRequest<FollowUpsResponse>(path)
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

export function completeFollowUp(id: string, payload: CompleteFollowUpPayload) {
  return apiRequest<FollowUpResponse, CompleteFollowUpPayload>(API_ENDPOINTS.followUps.complete(id), {
    method: "POST",
    body: payload,
  })
}
