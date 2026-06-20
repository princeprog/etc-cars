import type { FollowUpStatus } from "@/types/follow-ups"

export const followUpsQueryKeys = {
  all: ["follow-ups"] as const,
  lists: (status?: FollowUpStatus) => [...followUpsQueryKeys.all, "list", status ?? "all"] as const,
  detail: (id: string) => [...followUpsQueryKeys.all, "detail", id] as const,
}
