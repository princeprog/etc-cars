import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  CompleteFollowUpPayload,
  CreateFollowUpPayload,
  FollowUpResponse,
  FollowUpsResponse,
  FollowUpStatus,
} from "@/types/follow-ups"

export function getFollowUps(status?: FollowUpStatus) {
  const path = status
    ? `${API_ENDPOINTS.followUps.root}?status=${encodeURIComponent(status)}`
    : API_ENDPOINTS.followUps.root

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
