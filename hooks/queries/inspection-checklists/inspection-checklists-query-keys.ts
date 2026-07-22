export const inspectionChecklistsQueryKeys = {
  all: ["inspection-checklists"] as const,
  settings: () => [...inspectionChecklistsQueryKeys.all, "settings"] as const,
  templates: () => [...inspectionChecklistsQueryKeys.all, "templates"] as const,
  published: () => [...inspectionChecklistsQueryKeys.all, "published"] as const,
  detail: (id: string) =>
    [...inspectionChecklistsQueryKeys.all, "template", id] as const,
  sellerLeadInspection: (leadId: string) =>
    [...inspectionChecklistsQueryKeys.all, "seller-lead", leadId] as const,
};
