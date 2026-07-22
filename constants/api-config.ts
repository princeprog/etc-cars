const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is required");
}

export const API_BASE_URL = apiBaseUrl.replace(/\/+$/, "");

export const API_ENDPOINTS = {
  auth: {
    changePassword: "/auth/change-password",
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    realtimeToken: "/auth/realtime-token",
    refresh: "/auth/refresh",
    users: "/auth/users",
    userRole: (id: string) => `/auth/users/${id}/role`,
    userStatus: (id: string) => `/auth/users/${id}/status`,
  },
  roles: {
    root: "/roles",
    permissions: "/roles/permissions",
    byId: (id: string) => `/roles/${id}`,
    archive: (id: string) => `/roles/${id}/archive`,
    restore: (id: string) => `/roles/${id}/restore`,
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
  inspectionTemplates: {
    root: "/inspection-templates",
    settings: "/inspection-checklist-settings",
    published: "/inspection-templates/published",
    byId: (id: string) => `/inspection-templates/${id}`,
    draft: (id: string) => `/inspection-templates/${id}/draft`,
    publish: (id: string) => `/inspection-templates/${id}/publish`,
    setDefault: (id: string) => `/inspection-templates/${id}/set-default`,
    archive: (id: string) => `/inspection-templates/${id}/archive`,
    restore: (id: string) => `/inspection-templates/${id}/restore`,
  },
  sellerLeadInspections: {
    byLeadId: (id: string) => `/seller-leads/${id}/inspection`,
    complete: (id: string) => `/seller-leads/${id}/inspection/complete`,
  },
  uploads: {
    vehiclePhoto: "/uploads/vehicle-photos",
    expenseReceipt: "/uploads/expense-receipts",
  },
  followUps: {
    root: "/follow-ups",
    summary: "/follow-ups/summary",
    active: "/follow-ups/active",
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
  expenses: {
    root: "/expenses",
    byId: (id: string) => `/expenses/${id}`,
    markPaid: (id: string) => `/expenses/${id}/mark-paid`,
    receipt: (id: string) => `/expenses/${id}/receipt`,
    removeReceipt: (id: string) => `/expenses/${id}/receipt/remove`,
    void: (id: string) => `/expenses/${id}/void`,
  },
  expenseCategories: {
    root: "/expense-categories",
    byId: (id: string) => `/expense-categories/${id}`,
  },
  expenseRecurringRules: {
    root: "/expense-recurring-rules",
    byId: (id: string) => `/expense-recurring-rules/${id}`,
    deactivate: (id: string) => `/expense-recurring-rules/${id}/deactivate`,
  },
  expenseReports: {
    monthly: "/expense-reports/monthly",
    export: "/expense-reports/export",
  },
  notifications: {
    root: "/notifications",
    unreadCount: "/notifications/unread-count",
    byIdRead: (id: string) => `/notifications/${id}/read`,
    byIdUnread: (id: string) => `/notifications/${id}/unread`,
    markAllRead: "/notifications/mark-all-read",
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
