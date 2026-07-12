import { API_ENDPOINTS } from "@/constants/api-config"
import { apiRequest, authenticatedFetch } from "@/services/api-service"
import { AppApiError } from "@/types/api"
import type {
  InventoryReportResponse,
  LeadsReportResponse,
  ProfitabilityReportResponse,
  ReportDomain,
  ReportFilters,
  ReportsOverviewResponse,
  SalesReportResponse,
} from "@/types/reports"

function buildReportParams(filters: ReportFilters) {
  const params = new URLSearchParams()

  if (filters.startDate) params.set("startDate", filters.startDate)
  if (filters.endDate) params.set("endDate", filters.endDate)
  if (filters.groupBy) params.set("groupBy", filters.groupBy)
  if (filters.agentName) params.set("agentName", filters.agentName)
  if (filters.status) params.set("status", filters.status)

  return params
}

function withQuery(path: string, params: URLSearchParams) {
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export function getReportsOverview(filters: ReportFilters = {}) {
  return apiRequest<ReportsOverviewResponse>(
    withQuery(API_ENDPOINTS.reports.overview, buildReportParams(filters)),
  )
}

export function getSalesReport(filters: ReportFilters = {}) {
  return apiRequest<SalesReportResponse>(
    withQuery(API_ENDPOINTS.reports.sales, buildReportParams(filters)),
  )
}

export function getInventoryReport(filters: ReportFilters = {}) {
  return apiRequest<InventoryReportResponse>(
    withQuery(API_ENDPOINTS.reports.inventory, buildReportParams(filters)),
  )
}

export function getLeadsReport(filters: ReportFilters = {}) {
  return apiRequest<LeadsReportResponse>(
    withQuery(API_ENDPOINTS.reports.leads, buildReportParams(filters)),
  )
}

export function getProfitabilityReport(filters: ReportFilters = {}) {
  return apiRequest<ProfitabilityReportResponse>(
    withQuery(API_ENDPOINTS.reports.profitability, buildReportParams(filters)),
  )
}

/**
 * Download a report CSV. The export endpoint streams a file (not JSON), so we
 * fetch it directly — preserving the same cookie auth and 401-refresh behaviour
 * as `apiRequest` — and hand the resulting blob to the browser for download.
 * The applied report `filters` are forwarded so the export always matches what
 * the user is reviewing on screen.
 */
export async function downloadReportCsv(
  domain: ReportDomain,
  dataset: string,
  filters: ReportFilters = {},
) {
  const params = buildReportParams(filters)
  params.set("dataset", dataset)
  const path = withQuery(API_ENDPOINTS.reports.export(domain), params)

  const response = await authenticatedFetch(path, {
    method: "GET",
  })

  if (!response.ok) {
    throw new AppApiError(
      "Unable to export report. Please try again.",
      response.status,
    )
  }

  const blob = await response.blob()
  const filename = parseFilename(response) ?? `etc-${domain}-${dataset}.csv`

  triggerBlobDownload(blob, filename)
}

function parseFilename(response: Response) {
  const disposition = response.headers.get("content-disposition")
  if (!disposition) {
    return null
  }

  const match = /filename="?([^"]+)"?/i.exec(disposition)
  return match?.[1] ?? null
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(url)
}
