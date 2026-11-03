'use client';

import { useCallback, useEffect, useState } from 'react';
import { PAGINATION } from '@/constants';
import { inventoryService } from '@/services/api';
import type { InventoryListItem, InventoryListParams } from '@/types/inventory';
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

export function useInventory({
  page,
  limit,
  search,
  categoryId,
  stockStatus,
  sortBy,
  sortOrder,
}: InventoryListParams) {
  const [items, setItems] = useState<InventoryListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await inventoryService.list({
        page,
        limit,
        search,
        categoryId,
        stockStatus,
        sortBy,
        sortOrder,
      });

      if (!res.success) {
        throw new ApiError(400, res.message || 'Unable to load inventory records');
      }

      setItems(res.data ?? []);
      setPagination(res.pagination ?? fallbackPagination(page, limit));
      setError(null);
    } catch (err) {
      setItems([]);
      setPagination(fallbackPagination(page, limit));
      setError(err instanceof ApiError ? err.message : 'Unable to load inventory records');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, categoryId, stockStatus, sortBy, sortOrder]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  return {
    items,
    pagination,
    error,
    isLoading,
    refetch: fetchItems,
  };
}
