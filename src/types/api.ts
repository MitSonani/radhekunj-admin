/**
 * API types aligned with the Backend shared contract.
 * Do not invent additional response fields here.
 */

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type ErrorResponse = {
  success: false;
  message: string;
  requestId?: string;
  details?: unknown;
};

export class ApiError extends Error {
  statusCode: number;
  requestId?: string;
  details?: unknown;

  constructor(statusCode: number, message: string, options?: { requestId?: string; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.requestId = options?.requestId;
    this.details = options?.details;
  }
}
