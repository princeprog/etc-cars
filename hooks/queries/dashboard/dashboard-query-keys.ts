import type { DashboardRange } from "@/types/dashboard";

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  summary: ["dashboard", "summary"] as const,
  detail: (range: DashboardRange) =>
    [...dashboardQueryKeys.summary, range] as const,
};
