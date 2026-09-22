'use client';

import { useCallback, useEffect, useState } from 'react';
import { couponService, type CouponDetail } from '@/services/api';
import { ApiError } from '@/types/api';

export function useCoupon(id: string) {
  const [coupon, setCoupon] = useState<CouponDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await couponService.getById(id);
        if (cancelled) {
          return;
        }

        if (!response.success || !response.data) {
          throw new ApiError(404, response.message || 'Coupon not found');
        }

        setCoupon(response.data);
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setCoupon(null);
        setError(err instanceof ApiError ? err.message : 'Unable to load coupon');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await couponService.getById(id);
      if (!response.success || !response.data) {
        throw new ApiError(404, response.message || 'Coupon not found');
      }

      setCoupon(response.data);
    } catch (err) {
      setCoupon(null);
      setError(err instanceof ApiError ? err.message : 'Unable to load coupon');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { coupon, error, isLoading, refetch };
}
