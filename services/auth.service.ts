import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  AuthenticatedUserResponse,
  LoginPayload,
  LogoutResponse,
} from "@/types/auth"

export function login(payload: LoginPayload) {
  return apiRequest<AuthenticatedUserResponse, LoginPayload>(API_ENDPOINTS.auth.login, {
    method: "POST",
    body: payload,
    retryOnUnauthorized: false,
  })
}

export function getAuthenticatedUser() {
  return apiRequest<AuthenticatedUserResponse>(API_ENDPOINTS.auth.me)
}

export function logout() {
  return apiRequest<LogoutResponse>(API_ENDPOINTS.auth.logout, {
    method: "POST",
    retryOnUnauthorized: false,
  })
}
