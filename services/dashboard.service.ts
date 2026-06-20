import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest } from "@/services/api-service"
import type { DashboardResponse } from "@/types/dashboard"

export function getDashboard() {
  return apiRequest<DashboardResponse>(API_ENDPOINTS.dashboard.root)
}
