export interface ApiErrorResponse {
  message?: string | string[]
  error?: string
  statusCode?: number
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
