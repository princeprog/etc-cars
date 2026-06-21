import { API_ENDPOINTS, buildApiUrl } from "@/constants/api-config"
import { ApiErrorResponse, AppApiError } from "@/types/api"

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

interface ApiRequestOptions<TBody> {
  method?: HttpMethod
  body?: TBody
  headers?: HeadersInit
  retryOnUnauthorized?: boolean
}

async function parseResponseBody<TResponse>(response: Response): Promise<TResponse | undefined> {
  const contentType = response.headers.get("content-type")

  if (!contentType?.includes("application/json")) {
    return undefined
  }

  return (await response.json()) as TResponse
}

async function createApiError(response: Response) {
  const payload = await parseResponseBody<ApiErrorResponse>(response)
  const message = Array.isArray(payload?.message)
    ? payload.message.join(", ")
    : payload?.message || payload?.error || "Request failed"

  return new AppApiError(message, response.status, payload)
}

async function attemptTokenRefresh() {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.refresh), {
    method: "POST",
    credentials: "include",
  })

  return response.ok
}

export async function apiRequest<TResponse, TBody = undefined>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const {
    method = "GET",
    body,
    headers,
    retryOnUnauthorized = true,
  } = options

  const requestHeaders = new Headers(headers)
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData

  if (body !== undefined && !isFormData && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json")
  }

  const executeRequest = () =>
    fetch(buildApiUrl(path), {
      method,
      credentials: "include",
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    })

  let response = await executeRequest()

  if (
    response.status === 401 &&
    retryOnUnauthorized &&
    path !== API_ENDPOINTS.auth.refresh &&
    path !== API_ENDPOINTS.auth.login
  ) {
    const refreshed = await attemptTokenRefresh()

    if (refreshed) {
      response = await executeRequest()
    }
  }

  if (!response.ok) {
    throw await createApiError(response)
  }

  const parsed = await parseResponseBody<TResponse>(response)
  return (parsed ?? ({} as TResponse))
}
