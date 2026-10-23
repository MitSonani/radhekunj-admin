'use client';

import { useCallback, useEffect, useState } from 'react';
import { PAGINATION } from '@/constants';
import { orderService } from '@/services/api';
import type { AdminOrderListItem, ListOrdersParams } from '@/types/orders';
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

export function useOrders({
  page,
  limit,
  search,
  status,
  paymentMethod,
  paymentStatus,
  shipmentStatus,
  startDate,
  endDate,
}: ListOrdersParams) {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyResult = useCallback(
    async (request: Promise<Awaited<ReturnType<typeof orderService.list>>>) => {
      try {
        const response = await request;
        if (!response.success) {
          throw new ApiError(400, response.message || 'Unable to load orders');
        }

        setOrders(response.data ?? []);
        setPagination(response.pagination ?? fallbackPagination(page, limit));
        setError(null);
      } catch (err) {
        setOrders([]);
        setPagination(fallbackPagination(page, limit));
        setError(err instanceof ApiError ? err.message : 'Unable to load orders');
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
        const response = await orderService.list({
          page,
          limit,
          search,
          status,
          paymentMethod,
          paymentStatus,
          shipmentStatus,
          startDate,
          endDate,
        });
        if (cancelled) {
          return;
        }

        if (!response.success) {
          throw new ApiError(400, response.message || 'Unable to load orders');
        }

        setOrders(response.data ?? []);
        setPagination(response.pagination ?? fallbackPagination(page, limit));
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setOrders([]);
        setPagination(fallbackPagination(page, limit));
        setError(err instanceof ApiError ? err.message : 'Unable to load orders');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    page,
    limit,
    search,
    status,
    paymentMethod,
    paymentStatus,
    shipmentStatus,
    startDate,
    endDate,
  ]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await applyResult(
      orderService.list({
        page,
        limit,
        search,
        status,
        paymentMethod,
        paymentStatus,
        shipmentStatus,
        startDate,
        endDate,
      })
    );
  }, [
    applyResult,
    page,
    limit,
    search,
    status,
    paymentMethod,
    paymentStatus,
    shipmentStatus,
    startDate,
    endDate,
  ]);

  return { orders, pagination, error, isLoading, refetch };
}
