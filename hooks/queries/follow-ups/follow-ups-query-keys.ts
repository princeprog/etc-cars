import type { FollowUpListFilters } from "@/types/follow-ups"

export const followUpsQueryKeys = {
  all: ["follow-ups"] as const,
  lists: () => [...followUpsQueryKeys.all, "list"] as const,
  filteredList: (filters: FollowUpListFilters) =>
    [...followUpsQueryKeys.all, "list", "filtered", filters] as const,
  detail: (id: string) => [...followUpsQueryKeys.all, "detail", id] as const,
}
