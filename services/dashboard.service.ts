import { API_ENDPOINTS } from "@/constants/api-config";
import { apiRequest } from "@/services/api-service";
import type { DashboardRange, DashboardResponse } from "@/types/dashboard";

export function getDashboard(range: DashboardRange) {
  const searchParams = new URLSearchParams({ range });

  return apiRequest<DashboardResponse>(
    `${API_ENDPOINTS.dashboard.root}?${searchParams.toString()}`,
  );
}
