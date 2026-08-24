'use client';

import { useCallback, useState } from 'react';
import { clearSession, isAdminRole, persistSession } from '@/lib/auth';
import { authService, type SendOtpPayload, type VerifyOtpPayload } from '@/services/api';
import { ApiError } from '@/types/api';

export function useSignIn() {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = useCallback(async (payload: SendOtpPayload) => {
    setIsSending(true);
    setError(null);

    try {
      const response = await authService.sendOtp(payload);
      if (!response.success) {
        throw new ApiError(400, response.message || 'Failed to send verification code');
      }
      return response.data?.otp;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send verification code';
      setError(message);
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  const verifyOtp = useCallback(async (payload: VerifyOtpPayload) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await authService.verifyOtp(payload);
      if (!response.success || !response.data) {
        throw new ApiError(400, response.message || 'OTP verification failed');
      }

      const { token, user } = response.data;
      if (!isAdminRole(user.role?.name)) {
        clearSession();
        throw new Error('This account does not have admin access.');
      }

      persistSession(token, {
        id: user.id,
        name: user.name,
        role: user.role,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OTP verification failed';
      setError(message);
      throw err;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return {
    requestOtp,
    verifyOtp,
    isSending,
    isVerifying,
    error,
    setError,
  };
}
