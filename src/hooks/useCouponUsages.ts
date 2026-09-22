'use client';

import { useCallback, useEffect, useState } from 'react';
import { PAGINATION } from '@/constants';
import { couponService, type CouponUsage, type ListCouponUsagesParams } from '@/services/api';
import { ApiError, type PaginationMeta } from '@/types/api';

const EMPTY_PAGINATION: PaginationMeta = {
  page: PAGINATION.DEFAULT_PAGE,
  limit: PAGINATION.DEFAULT_LIMIT,
  total: 0,
  totalPages: 0,
};

function fallbackPagination(page?: number, limit?: number): PaginationMeta {
  return {
    ...EMPTY_PAGINATION,
    page: page ?? PAGINATION.DEFAULT_PAGE,
    limit: limit ?? PAGINATION.DEFAULT_LIMIT,
  };
}

export function useCouponUsages(couponId: string, { page, limit }: ListCouponUsagesParams) {
  const [usages, setUsages] = useState<CouponUsage[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyResult = useCallback(
    async (request: Promise<Awaited<ReturnType<typeof couponService.listUsages>>>) => {
      try {
        const response = await request;
        if (!response.success) {
          throw new ApiError(400, response.message || 'Unable to load coupon usage');
        }

        setUsages(response.data ?? []);
        setPagination(response.pagination ?? fallbackPagination(page, limit));
        setError(null);
      } catch (err) {
        setUsages([]);
        setPagination(fallbackPagination(page, limit));
        setError(err instanceof ApiError ? err.message : 'Unable to load coupon usage');
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit]
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await couponService.listUsages(couponId, { page, limit });
        if (cancelled) {
          return;
        }

        if (!response.success) {
          throw new ApiError(400, response.message || 'Unable to load coupon usage');
        }

        setUsages(response.data ?? []);
        setPagination(response.pagination ?? fallbackPagination(page, limit));
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setUsages([]);
        setPagination(fallbackPagination(page, limit));
        setError(err instanceof ApiError ? err.message : 'Unable to load coupon usage');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [couponId, page, limit]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await applyResult(couponService.listUsages(couponId, { page, limit }));
  }, [applyResult, couponId, page, limit]);

  return { usages, pagination, error, isLoading, refetch };
}
