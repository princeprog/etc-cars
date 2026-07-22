export type InspectionRating = "good" | "fair" | "poor" | null;
export type InspectionOverallCondition = "good" | "fair" | "poor";

export type InspectionTemplateItem = {
  id?: string;
  stableKey?: string;
  label: string;
  findingKey?: string | null;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type InspectionTemplateSection = {
  id?: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
  items: InspectionTemplateItem[];
};

export type InspectionTemplateVersion = {
  id: string;
  templateId: string;
  versionNumber: number;
  status: "draft" | "published";
  publishedAt: string | null;
  sections?: InspectionTemplateSection[];
};

export type InspectionTemplate = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  draftVersion: InspectionTemplateVersion | null;
  latestPublishedVersion: InspectionTemplateVersion | null;
};

export type PublishedInspectionTemplate = {
  id: string;
  templateId: string;
  name: string;
  description: string | null;
  versionNumber: number;
  publishedAt: string;
  isDefault: boolean;
};

export type InspectionTemplateDetailResponse = {
  template: Omit<
    InspectionTemplate,
    "draftVersion" | "latestPublishedVersion"
  >;
  versions: InspectionTemplateVersion[];
};

export type InspectionTemplatesResponse = {
  templates: InspectionTemplate[];
};

export type PublishedInspectionTemplatesResponse = {
  templates: PublishedInspectionTemplate[];
};

export type InspectionChecklistUserSummary = {
  id: string;
  fullName: string | null;
};

export type InspectionChecklistSettings = {
  id?: string;
  revision: number;
  sections: InspectionTemplateSection[];
  updatedAt: string;
  updatedBy: InspectionChecklistUserSummary | null;
  affectedDraftInspectionCount: number;
};

export type InspectionChecklistSettingsResponse = InspectionChecklistSettings;

export type UpdateInspectionChecklistSettingsPayload = {
  expectedRevision: number;
  sections: InspectionTemplateSection[];
};

export type UpdateInspectionChecklistSettingsResponse = InspectionChecklistSettings;

export type SellerLeadInspectionAnswer = {
  rating: InspectionRating;
  notes: string | null;
};

export type SellerLeadInspection = {
  id: string;
  sellerLeadId: string;
  templateVersionId: string | null;
  templateSnapshot: {
    templateName: string;
    versionNumber: number;
    sections: InspectionTemplateSection[];
  };
  answers: Record<string, SellerLeadInspectionAnswer>;
  majorIssues: string | null;
  recommendedRepairs: string | null;
  inspectorNotes: string | null;
  estimatedRepairCost: string | null;
  overallCondition: InspectionOverallCondition;
  status: "draft" | "completed";
  completedAt: string | null;
  inspectorUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SellerLeadInspectionResponse = {
  inspection: SellerLeadInspection | null;
};

export type UpsertInspectionTemplateDraftPayload = {
  name?: string;
  description?: string | null;
  sections?: InspectionTemplateSection[];
};

export type CreateInspectionTemplatePayload = {
  name: string;
  description?: string | null;
  sourceVersionId?: string;
  sections?: InspectionTemplateSection[];
};

export type UpdateSellerLeadInspectionPayload = {
  answers?: Record<string, SellerLeadInspectionAnswer>;
  majorIssues?: string | null;
  recommendedRepairs?: string | null;
  inspectorNotes?: string | null;
  estimatedRepairCost?: string | null;
  overallCondition?: InspectionOverallCondition;
};
