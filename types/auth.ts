export interface AuthenticatedUser {
  id: string
  email: string
  fullName: string
  role: "admin" | "staff"
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthenticatedUserResponse {
  user: AuthenticatedUser
}

export interface LogoutResponse {
  success: true
}
