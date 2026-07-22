import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type {
  ArchiveRolePayload,
  PermissionsResponse,
  RoleResponse,
  RolesResponse,
  SaveRolePayload,
} from "@/types/roles"

export function getRoles() {
  return apiRequest<RolesResponse>(API_ENDPOINTS.roles.root)
}

export function getRole(id: string) {
  return apiRequest<RoleResponse>(API_ENDPOINTS.roles.byId(id))
}

export function getRolePermissions() {
  return apiRequest<PermissionsResponse>(API_ENDPOINTS.roles.permissions)
}

export function createRole(payload: SaveRolePayload) {
  return apiRequest<RoleResponse, SaveRolePayload>(API_ENDPOINTS.roles.root, {
    method: "POST",
    body: payload,
  })
}

export function updateRole(id: string, payload: SaveRolePayload) {
  return apiRequest<RoleResponse, SaveRolePayload>(API_ENDPOINTS.roles.byId(id), {
    method: "PUT",
    body: payload,
  })
}

export function archiveRole(id: string, payload: ArchiveRolePayload) {
  return apiRequest<{ success: true }, ArchiveRolePayload>(
    API_ENDPOINTS.roles.archive(id),
    {
      method: "POST",
      body: payload,
    },
  )
}

export function restoreRole(id: string) {
  return apiRequest<RoleResponse>(API_ENDPOINTS.roles.restore(id), {
    method: "POST",
  })
}
