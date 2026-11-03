'use client';

import { useCallback, useEffect, useState } from 'react';
import { PAGINATION } from '@/constants';
import { inventoryService } from '@/services/api';
import type { InventoryMovementListItem, StockMovementParams } from '@/types/inventory';
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

export function useInventoryMovements({
  page,
  limit,
  variantId,
  type,
  search,
  startDate,
  endDate,
}: StockMovementParams) {
  const [movements, setMovements] = useState<InventoryMovementListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await inventoryService.listMovements({
        page,
        limit,
        variantId,
        type,
        search,
        startDate,
        endDate,
      });

      if (!res.success) {
        throw new ApiError(400, res.message || 'Unable to load stock movement history');
      }

      setMovements(res.data ?? []);
      setPagination(res.pagination ?? fallbackPagination(page, limit));
      setError(null);
    } catch (err) {
      setMovements([]);
      setPagination(fallbackPagination(page, limit));
      setError(err instanceof ApiError ? err.message : 'Unable to load stock movement history');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, variantId, type, search, startDate, endDate]);

  useEffect(() => {
    void fetchMovements();
  }, [fetchMovements]);

  return {
    movements,
    pagination,
    error,
    isLoading,
    refetch: fetchMovements,
  };
}
