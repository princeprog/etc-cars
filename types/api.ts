export interface ApiErrorResponse {
  message?: string | string[]
  error?: string
  statusCode?: number
}

export interface PaginatedResponseMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export class AppApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: ApiErrorResponse | unknown,
  ) {
    super(message)
    this.name = "AppApiError"
  }
}

export function isAppApiError(error: unknown): error is AppApiError {
  return error instanceof AppApiError
}

export function getApiErrorMessage(error: unknown, fallback = "Request failed") {
  if (isAppApiError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
