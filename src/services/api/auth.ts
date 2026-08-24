import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/api';

export interface SendOtpPayload {
  countryCode?: string;
  mobileNumber: string;
}

export interface VerifyOtpPayload {
  countryCode?: string;
  mobileNumber: string;
  otp: string;
}

export interface AuthUserRole {
  id: string;
  name: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: AuthUserRole | null;
}

export interface AuthResponseData {
  user: AuthUser;
  token: string;
}

/**
 * Backend authentication contract:
 * POST /api/v1/auth/otp/send
 * POST /api/v1/auth/otp/verify
 */
export const authService = {
  sendOtp: (payload: SendOtpPayload) =>
    apiClient.post<ApiResponse<{ otp?: string }>>('/auth/otp/send', payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    apiClient.post<ApiResponse<AuthResponseData>>('/auth/otp/verify', payload),
};
