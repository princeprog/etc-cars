import { API_ENDPOINTS } from "@/constants/api-config";
import { apiRequest } from "@/services/api-service";
import type {
  CreateInspectionTemplatePayload,
  InspectionChecklistSettingsResponse,
  InspectionTemplateDetailResponse,
  InspectionTemplatesResponse,
  PublishedInspectionTemplatesResponse,
  SellerLeadInspectionResponse,
  UpdateInspectionChecklistSettingsPayload,
  UpdateInspectionChecklistSettingsResponse,
  UpdateSellerLeadInspectionPayload,
  UpsertInspectionTemplateDraftPayload,
} from "@/types/inspection-checklists";

export function getInspectionChecklistSettings() {
  return apiRequest<InspectionChecklistSettingsResponse>(
    API_ENDPOINTS.inspectionTemplates.settings,
  );
}

export function updateInspectionChecklistSettings(
  payload: UpdateInspectionChecklistSettingsPayload,
) {
  return apiRequest<
    UpdateInspectionChecklistSettingsResponse,
    UpdateInspectionChecklistSettingsPayload
  >(API_ENDPOINTS.inspectionTemplates.settings, {
    method: "PUT",
    body: payload,
  });
}

export function getInspectionTemplates() {
  return apiRequest<InspectionTemplatesResponse>(
    API_ENDPOINTS.inspectionTemplates.root,
  );
}

export function getPublishedInspectionTemplates() {
  return apiRequest<PublishedInspectionTemplatesResponse>(
    API_ENDPOINTS.inspectionTemplates.published,
  );
}

export function getInspectionTemplate(id: string) {
  return apiRequest<InspectionTemplateDetailResponse>(
    API_ENDPOINTS.inspectionTemplates.byId(id),
  );
}

export function createInspectionTemplate(
  payload: CreateInspectionTemplatePayload,
) {
  return apiRequest<
    InspectionTemplateDetailResponse,
    CreateInspectionTemplatePayload
  >(API_ENDPOINTS.inspectionTemplates.root, {
    method: "POST",
    body: payload,
  });
}

export function updateInspectionTemplateDraft(
  id: string,
  payload: UpsertInspectionTemplateDraftPayload,
) {
  return apiRequest<
    InspectionTemplateDetailResponse,
    UpsertInspectionTemplateDraftPayload
  >(API_ENDPOINTS.inspectionTemplates.draft(id), {
    method: "PATCH",
    body: payload,
  });
}

export function publishInspectionTemplate(id: string) {
  return apiRequest(API_ENDPOINTS.inspectionTemplates.publish(id), {
    method: "POST",
  });
}

export function setDefaultInspectionTemplate(id: string) {
  return apiRequest(API_ENDPOINTS.inspectionTemplates.setDefault(id), {
    method: "POST",
  });
}

export function archiveInspectionTemplate(id: string) {
  return apiRequest(API_ENDPOINTS.inspectionTemplates.archive(id), {
    method: "POST",
  });
}

export function restoreInspectionTemplate(id: string) {
  return apiRequest(API_ENDPOINTS.inspectionTemplates.restore(id), {
    method: "POST",
  });
}

export function getSellerLeadInspection(leadId: string) {
  return apiRequest<SellerLeadInspectionResponse>(
    API_ENDPOINTS.sellerLeadInspections.byLeadId(leadId),
  );
}

export function startSellerLeadInspection(leadId: string) {
  return apiRequest<SellerLeadInspectionResponse>(
    API_ENDPOINTS.sellerLeadInspections.byLeadId(leadId),
    { method: "POST" },
  );
}

export function updateSellerLeadInspection(
  leadId: string,
  payload: UpdateSellerLeadInspectionPayload,
) {
  return apiRequest<
    SellerLeadInspectionResponse,
    UpdateSellerLeadInspectionPayload
  >(API_ENDPOINTS.sellerLeadInspections.byLeadId(leadId), {
    method: "PATCH",
    body: payload,
  });
}

export function completeSellerLeadInspection(leadId: string) {
  return apiRequest<SellerLeadInspectionResponse>(
    API_ENDPOINTS.sellerLeadInspections.complete(leadId),
    { method: "POST" },
  );
}
