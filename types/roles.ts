export type PermissionScope = "assigned" | "all"

export interface RolePermissionCatalogItem {
  key: string
  module: string
  action: string
  label: string
  description: string | null
  supportsAssignedScope: boolean
  sortOrder: number
}

export interface RolePermissionGrant {
  key: string
  scope: PermissionScope
}

export interface RoleRecord {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  isMutable: boolean
  isAdministrator: boolean
  archivedAt: string | null
  revision: number
  userCount: number
  permissions: RolePermissionGrant[]
  createdAt: string
  updatedAt: string
}

export interface RolesResponse {
  roles: RoleRecord[]
}

export interface RoleResponse {
  role: RoleRecord
}

export interface PermissionsResponse {
  permissions: RolePermissionCatalogItem[]
}

export interface SaveRolePayload {
  name: string
  description?: string | null
  permissions: RolePermissionGrant[]
  expectedRevision?: number
}

export interface ArchiveRolePayload {
  replacementRoleId: string
}
