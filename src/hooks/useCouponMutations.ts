'use client';

import { useCallback, useState } from 'react';
import {
  couponService,
  type CouponDetail,
  type CreateCouponPayload,
  type UpdateCouponPayload,
} from '@/services/api';
import { ApiError } from '@/types/api';

function toErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) {
    return fallback;
  }

  if (err.statusCode === 0 || err.statusCode >= 500) {
    return fallback;
  }

  if (err.statusCode === 403) {
    return 'You do not have permission to perform this action.';
  }

  return err.message || fallback;
}

async function unwrapCoupon(
  response: Awaited<ReturnType<typeof couponService.create>>,
  fallback: string
): Promise<CouponDetail> {
  if (!response.success || !response.data) {
    throw new ApiError(400, response.message || fallback);
  }

  return response.data;
}

export function useCouponMutations() {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const createCoupon = useCallback(async (payload: CreateCouponPayload): Promise<CouponDetail> => {
    setIsCreating(true);
    setError(null);

    try {
      return await unwrapCoupon(await couponService.create(payload), 'Unable to create coupon');
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to create coupon');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateCoupon = useCallback(async (id: string, payload: UpdateCouponPayload): Promise<CouponDetail> => {
    setIsUpdating(true);
    setError(null);

    try {
      return await unwrapCoupon(await couponService.update(id, payload), 'Unable to update coupon');
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to update coupon');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const activateCoupon = useCallback(async (id: string): Promise<CouponDetail> => {
    setIsActivating(true);
    setError(null);

    try {
      return await unwrapCoupon(await couponService.activate(id), 'Unable to activate coupon');
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to activate coupon');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsActivating(false);
    }
  }, []);

  const deactivateCoupon = useCallback(async (id: string): Promise<CouponDetail> => {
    setIsDeactivating(true);
    setError(null);

    try {
      return await unwrapCoupon(await couponService.deactivate(id), 'Unable to deactivate coupon');
    } catch (err) {
      const message = toErrorMessage(err, 'Unable to deactivate coupon');
      setError(message);
      throw err instanceof ApiError ? err : new ApiError(0, message);
    } finally {
      setIsDeactivating(false);
    }
  }, []);

  return {
    createCoupon,
    updateCoupon,
    activateCoupon,
    deactivateCoupon,
    error,
    setError,
    isCreating,
    isUpdating,
    isActivating,
    isDeactivating,
    isMutating: isCreating || isUpdating || isActivating || isDeactivating,
  };
}
