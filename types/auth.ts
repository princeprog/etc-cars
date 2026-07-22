export interface AuthenticatedUser {
  id: string
  email: string
  fullName: string
  role: "admin" | "staff"
  roleId: string
  roleName: string
  isAdministrator: boolean
  permissions: Record<string, "assigned" | "all">
  mustChangePassword: boolean
  active: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthenticatedUserResponse {
  user: AuthenticatedUser
}

export interface RealtimeTokenResponse {
  token: string
  expiresAt: string
}

export interface CreateStaffPayload {
  email: string
  fullName?: string
  role?: "staff"
  roleId?: string
}

export interface ChangePasswordPayload {
  newPassword: string
}

export interface AuthenticatedUsersResponse {
  users: AuthenticatedUser[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  summary: {
    adminCount: number
    totalStaffCount: number
    activeStaffCount: number
    disabledStaffCount: number
  }
}

export interface ListUsersParams {
  page?: number
  pageSize?: number
  search?: string
  status?: "active" | "disabled" | "change_password_required" | "all"
}

export interface UpdateUserStatusPayload {
  active: boolean
}

export interface UpdateUserRolePayload {
  roleId: string
}

export interface LogoutResponse {
  success: true
}
