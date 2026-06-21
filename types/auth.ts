export interface AuthenticatedUser {
  id: string
  email: string
  fullName: string
  role: "admin" | "staff"
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

export interface CreateStaffPayload {
  email: string
  fullName?: string
  role: "staff"
}

export interface ChangePasswordPayload {
  newPassword: string
}

export interface AuthenticatedUsersResponse {
  users: AuthenticatedUser[]
}

export interface UpdateUserStatusPayload {
  active: boolean
}

export interface LogoutResponse {
  success: true
}
