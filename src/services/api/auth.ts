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
 * Admin login contract (existing admins only — never registers a user):
 * POST /api/v1/auth/admin/otp/send
 * POST /api/v1/auth/admin/otp/verify
 */
export const authService = {
  sendOtp: (payload: SendOtpPayload) =>
    apiClient.post<ApiResponse<{ otp?: string }>>('/auth/admin/otp/send', payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    apiClient.post<ApiResponse<AuthResponseData>>('/auth/admin/otp/verify', payload),
};
