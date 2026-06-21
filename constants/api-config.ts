const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is required")
}

export const API_BASE_URL = apiBaseUrl

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    refresh: "/auth/refresh",
  },
  dashboard: {
    root: "/dashboard",
  },
  sellerLeads: {
    root: "/seller-leads",
    byId: (id: string) => `/seller-leads/${id}`,
    convert: (id: string) => `/seller-leads/${id}/convert`,
  },
  buyerLeads: {
    root: "/buyer-leads",
    byId: (id: string) => `/buyer-leads/${id}`,
    vehicleLinks: (id: string) => `/buyer-leads/${id}/vehicle-links`,
    vehicleLinkByVehicleId: (id: string, vehicleId: string) =>
      `/buyer-leads/${id}/vehicle-links/${vehicleId}`,
  },
  vehicles: {
    root: "/vehicles",
    byId: (id: string) => `/vehicles/${id}`,
  },
  uploads: {
    vehiclePhoto: "/uploads/vehicle-photos",
  },
  followUps: {
    root: "/follow-ups",
    byId: (id: string) => `/follow-ups/${id}`,
    complete: (id: string) => `/follow-ups/${id}/complete`,
  },
  sales: {
    root: "/sales",
    byId: (id: string) => `/sales/${id}`,
  },
} as const

export function buildApiUrl(path: string) {
  return new URL(path, API_BASE_URL).toString()
}

export function resolveApiAssetUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl
  }

  return buildApiUrl(pathOrUrl)
}
