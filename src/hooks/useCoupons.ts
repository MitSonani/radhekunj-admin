'use client';

import { useCallback, useEffect, useState } from 'react';
import { PAGINATION } from '@/constants';
import { couponService, type CouponListItem, type ListCouponsParams } from '@/services/api';
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

export function useCoupons({
  page,
  limit,
  search,
  status,
  discountType,
  scope,
  validity,
}: ListCouponsParams) {
  const [coupons, setCoupons] = useState<CouponListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyResult = useCallback(
    async (request: Promise<Awaited<ReturnType<typeof couponService.list>>>) => {
      try {
        const response = await request;
        if (!response.success) {
          throw new ApiError(400, response.message || 'Unable to load coupons');
        }

        setCoupons(response.data ?? []);
        setPagination(response.pagination ?? fallbackPagination(page, limit));
        setError(null);
      } catch (err) {
        setCoupons([]);
        setPagination(fallbackPagination(page, limit));
        setError(err instanceof ApiError ? err.message : 'Unable to load coupons');
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
        const response = await couponService.list({
          page,
          limit,
          search,
          status,
          discountType,
          scope,
          validity,
        });
        if (cancelled) {
          return;
        }

        if (!response.success) {
          throw new ApiError(400, response.message || 'Unable to load coupons');
        }

        setCoupons(response.data ?? []);
        setPagination(response.pagination ?? fallbackPagination(page, limit));
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setCoupons([]);
        setPagination(fallbackPagination(page, limit));
        setError(err instanceof ApiError ? err.message : 'Unable to load coupons');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, limit, search, status, discountType, scope, validity]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await applyResult(
      couponService.list({ page, limit, search, status, discountType, scope, validity })
    );
  }, [applyResult, page, limit, search, status, discountType, scope, validity]);

  return { coupons, pagination, error, isLoading, refetch };
}
