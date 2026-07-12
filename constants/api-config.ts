const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is required");
}

export const API_BASE_URL = apiBaseUrl;

export const API_ENDPOINTS = {
  auth: {
    changePassword: "/auth/change-password",
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    refresh: "/auth/refresh",
    users: "/auth/users",
    userStatus: (id: string) => `/auth/users/${id}/status`,
  },
  dashboard: {
    root: "/dashboard",
  },
  sellerLeads: {
    root: "/seller-leads",
    byId: (id: string) => `/seller-leads/${id}`,
    convert: (id: string) => `/seller-leads/${id}/convert`,
    estimatedCosts: (id: string) => `/seller-leads/${id}/estimated-costs`,
    estimatedCostById: (id: string, costId: string) =>
      `/seller-leads/${id}/estimated-costs/${costId}`,
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
    modelOptions: "/vehicles/model-options",
    byId: (id: string) => `/vehicles/${id}`,
    trackedCosts: (id: string) => `/vehicles/${id}/tracked-costs`,
    trackedCostById: (id: string, costId: string) =>
      `/vehicles/${id}/tracked-costs/${costId}`,
  },
  vehicleCatalog: {
    brands: "/vehicle-catalog/brands",
    brandById: (id: string) => `/vehicle-catalog/brands/${id}`,
    models: "/vehicle-catalog/models",
    modelById: (id: string) => `/vehicle-catalog/models/${id}`,
    variants: "/vehicle-catalog/variants",
    variantById: (id: string) => `/vehicle-catalog/variants/${id}`,
  },
  uploads: {
    vehiclePhoto: "/uploads/vehicle-photos",
  },
  followUps: {
    root: "/follow-ups",
    summary: "/follow-ups/summary",
    byId: (id: string) => `/follow-ups/${id}`,
    complete: (id: string) => `/follow-ups/${id}/complete`,
  },
  activityHistory: {
    root: "/activity-history",
    summary: "/activity-history/summary",
    export: "/activity-history/export",
    byEntity: (entityType: string, entityId: string, limit?: number) =>
      `/activity-history/${entityType}/${entityId}${limit ? `?limit=${limit}` : ""}`,
  },
  sales: {
    root: "/sales",
    summary: "/sales/summary",
    byId: (id: string) => `/sales/${id}`,
    drafts: "/sales/drafts",
    draftById: (id: string) => `/sales/drafts/${id}`,
    finalizeDraft: (id: string) => `/sales/drafts/${id}/finalize`,
  },
  reports: {
    overview: "/reports/overview",
    sales: "/reports/sales",
    inventory: "/reports/inventory",
    leads: "/reports/leads",
    profitability: "/reports/profitability",
    export: (domain: string) => `/reports/${domain}/export`,
  },
} as const;

export function buildApiUrl(path: string) {
  return new URL(path, API_BASE_URL).toString();
}

export function resolveApiAssetUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return buildApiUrl(pathOrUrl);
}
