import type { FollowUpListFilters, LeadType } from "@/types/follow-ups";

export const followUpsQueryKeys = {
  all: ["follow-ups"] as const,
  lists: (filters?: FollowUpListFilters) =>
    [...followUpsQueryKeys.all, "list", filters ?? {}] as const,
  summary: (assigneeUserId?: string) =>
    [...followUpsQueryKeys.all, "summary", assigneeUserId ?? "all"] as const,
  detail: (id: string) => [...followUpsQueryKeys.all, "detail", id] as const,
  active: (leadType: LeadType, leadId: string) =>
    [...followUpsQueryKeys.all, "active", leadType, leadId] as const,
};
