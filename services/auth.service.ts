import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  AuthenticatedUsersResponse,
  AuthenticatedUserResponse,
  ChangePasswordPayload,
  CreateStaffPayload,
  ListUsersParams,
  LoginPayload,
  LogoutResponse,
  UpdateUserStatusPayload,
} from "@/types/auth"

export function login(payload: LoginPayload) {
  return apiRequest<AuthenticatedUserResponse, LoginPayload>(
    API_ENDPOINTS.auth.login,
    {
      method: "POST",
      body: payload,
      retryOnUnauthorized: false,
    },
  )
}

export function getAuthenticatedUser() {
  return apiRequest<AuthenticatedUserResponse>(API_ENDPOINTS.auth.me)
}

export function createStaff(payload: CreateStaffPayload) {
  return apiRequest<AuthenticatedUserResponse, CreateStaffPayload>(
    API_ENDPOINTS.auth.users,
    {
      method: "POST",
      body: payload,
    },
  )
}

export function getUsers(params?: ListUsersParams) {
  const searchParams = new URLSearchParams()

  if (params?.search?.trim()) {
    searchParams.set("search", params.search.trim())
  }

  if (params?.status && params.status !== "all") {
    searchParams.set("status", params.status)
  }

  const path = searchParams.size
    ? `${API_ENDPOINTS.auth.users}?${searchParams.toString()}`
    : API_ENDPOINTS.auth.users

  return apiRequest<AuthenticatedUsersResponse>(path)
}

export function updateUserStatus(id: string, payload: UpdateUserStatusPayload) {
  return apiRequest<AuthenticatedUserResponse, UpdateUserStatusPayload>(
    API_ENDPOINTS.auth.userStatus(id),
    {
      method: "PATCH",
      body: payload,
    },
  )
}

export function changePassword(payload: ChangePasswordPayload) {
  return apiRequest<AuthenticatedUserResponse, ChangePasswordPayload>(
    API_ENDPOINTS.auth.changePassword,
    {
      method: "POST",
      body: payload,
    },
  )
}

export function logout() {
  return apiRequest<LogoutResponse>(API_ENDPOINTS.auth.logout, {
    method: "POST",
    retryOnUnauthorized: false,
  })
}
